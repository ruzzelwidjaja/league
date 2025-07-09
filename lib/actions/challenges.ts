'use server'

import { createClient } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { createChallengeSchema, acceptChallengeSchema } from '@/lib/validations/challenges'
import { getNowInLocalTzISO, getNowInLocalTz } from '@/lib/utils'

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
        createdAt: getNowInLocalTzISO()
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
        createdAt: getNowInLocalTzISO()
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

export async function acceptChallenge(
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
      error: 'You must be logged in to accept challenges' 
    };
  }

  // 2. Extract and validate form data
  const rawData = {
    challengeId: formData.get('challengeId') as string,
    selectedSlot: JSON.parse(formData.get('selectedSlot') as string || '{}')
  };

  const validation = acceptChallengeSchema.safeParse(rawData);
  
  if (!validation.success) {
    return { 
      success: false, 
      error: 'Invalid form data',
      fieldErrors: validation.error.flatten().fieldErrors
    };
  }

  const { challengeId, selectedSlot } = validation.data;

  const supabase = await createClient();
  const userId = session.user.id;

  try {
    // 3. Get challenge details and validate
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, challengerId, challengedId, status, leagueId, proposedSlots')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge || !challenge.leagueId) {
      return { 
        success: false, 
        error: 'Challenge not found' 
      };
    }

    // 4. Validate user is the challenged party
    if (challenge.challengedId !== userId || !challenge.challengerId) {
      return { 
        success: false, 
        error: 'You are not authorized to respond to this challenge' 
      };
    }

    // 5. Validate challenge status
    if (challenge.status !== 'pending') {
      return { 
        success: false, 
        error: 'This challenge is no longer pending' 
      };
    }

    // 6. Validate selected slot is in proposed slots
    const proposedSlots = challenge.proposedSlots as Array<{ id: string; day: string; date: string; slot: string }>;
    const isValidSlot = proposedSlots?.some(slot => 
      slot.id === selectedSlot.id
    );

    if (!isValidSlot) {
      return { 
        success: false, 
        error: 'Selected time slot is not valid' 
      };
    }

    const now = getNowInLocalTzISO();

    // 7. Update challenge
    const { error: updateError } = await supabase
      .from('challenges')
      .update({
        status: 'accepted',
        selectedSlot: selectedSlot,
        respondedAt: now
      })
      .eq('id', challengeId);

    if (updateError) {
      console.error('Challenge update error:', updateError);
      return { 
        success: false, 
        error: 'Failed to accept challenge. Please try again.' 
      };
    }

    // 8. Get current member data to check activity window
    const { data: member, error: memberError } = await supabase
      .from('league_members')
      .select('activityWindowStart, recentAcceptances, recentRejections, recentCancellations')
      .eq('userId', userId)
      .eq('leagueId', challenge.leagueId!)
      .single();

    if (memberError || !member) {
      console.error('Member fetch error:', memberError);
      return { 
        success: false, 
        error: 'Failed to update member stats' 
      };
    }

    // 9. Check if activity window needs reset (null or expired > 30 days)
    const needsReset = !member.activityWindowStart || 
      (getNowInLocalTz().getTime() - new Date(member.activityWindowStart).getTime()) > (30 * 24 * 60 * 60 * 1000);

    let memberUpdates: {
      activityWindowStart?: string;
      recentAcceptances?: number;
      recentRejections?: number;
      recentCancellations?: number;
    } = {};
    
    if (needsReset) {
      memberUpdates = {
        activityWindowStart: now,
        recentAcceptances: 1,
        recentRejections: 0,
        recentCancellations: 0
      };
    } else {
      memberUpdates = {
        recentAcceptances: (member.recentAcceptances || 0) + 1
      };
    }

    // 10. Update member stats
    const { error: memberUpdateError } = await supabase
      .from('league_members')
      .update(memberUpdates)
      .eq('userId', userId)
      .eq('leagueId', challenge.leagueId!);

    if (memberUpdateError) {
      console.error('Member update error:', memberUpdateError);
      // Don't fail the challenge acceptance for member stats errors
    }

    // 11. Create activity log
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        leagueId: challenge.leagueId!,
        userId: userId,
        relatedUserId: challenge.challengerId!,
        action: 'challengeAccepted',
        challengeId: challenge.id,
        metadata: { 
          selectedSlot 
        },
        createdAt: now
      });

    if (logError) {
      console.error('Activity log error:', logError);
      // Don't fail the challenge acceptance for logging errors
    }

    return { 
      success: true, 
      message: 'Challenge accepted successfully!',
      challengeId: challenge.id 
    };

  } catch (error) {
    console.error('Accept challenge error:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again.' 
    };
  }
}

