'use server'

import { createClient } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { createChallengeSchema } from '@/lib/validations/challenges'

interface ChallengeState {
  success: boolean
  error?: string
  message?: string
  fieldErrors?: Record<string, string[]>
  challengeId?: string
}

export async function sendChallenge(
  prevState: ChallengeState, 
  formData: FormData
): Promise<ChallengeState> {
  
  // 1. Authentication check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { 
      success: false, 
      error: 'You must be logged in to send challenges' 
    };
  }

  // 2. Extract and validate form data
  const rawData = {
    challengedId: formData.get('challengedId') as string,
    leagueId: formData.get('leagueId') as string,
    proposedSlots: JSON.parse(formData.get('proposedSlots') as string || '[]')
  };

  const validation = createChallengeSchema.safeParse(rawData);
  
  if (!validation.success) {
    return { 
      success: false, 
      error: 'Invalid form data',
      fieldErrors: validation.error.flatten().fieldErrors
    };
  }

  const { challengedId, leagueId, proposedSlots } = validation.data;
  const challengerId = session.user.id;

  // 3. Basic validation
  if (challengerId === challengedId) {
    return { 
      success: false, 
      error: 'You cannot challenge yourself' 
    };
  }

  const supabase = await createClient();

  try {
    // 4. Get FRESH data for both users to validate challenge rules
    const [challengerResult, challengedResult] = await Promise.all([
      supabase
        .from('league_members')
        .select('rank, status, skillTier, recentRejections')
        .eq('userId', challengerId)
        .eq('leagueId', leagueId)
        .single(),
      
      supabase
        .from('league_members')
        .select('rank, status, skillTier')
        .eq('userId', challengedId)
        .eq('leagueId', leagueId)
        .single()
    ]);

    if (challengerResult.error || !challengerResult.data) {
      return { 
        success: false, 
        error: 'You are not a member of this league' 
      };
    }

    if (challengedResult.error || !challengedResult.data) {
      return { 
        success: false, 
        error: 'The player you are trying to challenge is not in this league' 
      };
    }

    const challenger = challengerResult.data;
    const challenged = challengedResult.data;

    // 5. Validate challenger status
    if (challenger.status !== 'active') {
      return { 
        success: false, 
        error: 'You must be active to send challenges' 
      };
    }

    // 6. Validate challenged player status
    if (challenged.status === 'oot') {
      return { 
        success: false, 
        error: 'This player is currently out of town and unavailable for challenges' 
      };
    }

    if (challenged.status === 'inactive') {
      return { 
        success: false, 
        error: 'This player is inactive and unavailable for challenges' 
      };
    }

    // 7. Validate rank-based challenge rules
    const canChallengeUp = challenged.rank < challenger.rank && challenged.rank >= challenger.rank - 3; // Challenge up to 3 above
    const canChallengeDown = challenged.rank > challenger.rank; // Challenge anyone below

    if (!canChallengeUp && !canChallengeDown) {
      return { 
        success: false, 
        error: `You can only challenge players up to 3 ranks above you or any player below you. This player is rank ${challenged.rank}.`
      };
    }

    // 8. Check for existing pending challenges between these players
    const { data: existingChallenge } = await supabase
      .from('challenges')
      .select('id, status')
      .eq('leagueId', leagueId)
      .or(`and(challengerId.eq.${challengerId},challengedId.eq.${challengedId}),and(challengerId.eq.${challengedId},challengedId.eq.${challengerId})`)
      .in('status', ['pending', 'accepted'])
      .limit(1);

    if (existingChallenge && existingChallenge.length > 0) {
      return { 
        success: false, 
        error: 'You already have a pending challenge with this player' 
      };
    }

    // 9. Check challenger pending challenge limit
    const { data: challengerPendingChallenges } = await supabase
      .from('challenges')
      .select('id')
      .eq('challengerId', challengerId)
      .eq('leagueId', leagueId)
      .eq('status', 'pending');

    const maxPendingChallenges = 3;
    if (challengerPendingChallenges && challengerPendingChallenges.length >= maxPendingChallenges) {
      return { 
        success: false, 
        error: `You have reached the maximum of ${maxPendingChallenges} pending challenges. Please wait for responses before sending more.` 
      };
    }

    // 10. Check challenged player incoming challenge limit
    const { data: challengedIncomingChallenges } = await supabase
      .from('challenges')
      .select('id')
      .eq('challengedId', challengedId)
      .eq('leagueId', leagueId)
      .eq('status', 'pending');

    if (challengedIncomingChallenges && challengedIncomingChallenges.length >= maxPendingChallenges) {
      return { 
        success: false, 
        error: `This player is currently busy with ${maxPendingChallenges} pending challenges. Please try again later.` 
      };
    }

    // 11. Create the challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert({
        leagueId,
        challengerId,
        challengedId,
        proposedSlots,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      .select('id')
      .single();

    if (challengeError) {
      console.error('Challenge creation error:', challengeError);
      return { 
        success: false, 
        error: 'Failed to create challenge. Please try again.' 
      };
    }

    // 12. Create activity log
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        leagueId,
        userId: challengerId,
        relatedUserId: challengedId,
        action: 'challengeSent',
        challengeId: challenge.id,
        metadata: { 
          proposedSlots,
          challengerRank: challenger.rank,
          challengedRank: challenged.rank 
        },
        createdAt: new Date().toISOString()
      });

    if (logError) {
      console.error('Activity log error:', logError);
      // Don't fail the challenge creation for logging errors
    }

    // 13. Don't revalidate immediately - let the client handle UI updates
    // The modal needs to close gracefully first
    // revalidatePath('/league/[code]', 'page');
    // revalidatePath('/challenges');

    return { 
      success: true, 
      message: 'Challenge sent successfully!',
      challengeId: challenge.id 
    };

  } catch (error) {
    console.error('Challenge creation error:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again.' 
    };
  }
}

