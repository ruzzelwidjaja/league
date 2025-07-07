'use server'

import { createClient } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { UserAvailability, League } from '@/lib/supabase/types'
import type { Json } from '@/lib/supabase/database.types'

export async function checkLeagueExists(code: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('leagues')
      .select('id')
      .eq('joinCode', code)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking league:', error)
    return false
  }
}

export async function getUserLeagueStatus(): Promise<{
  inLeague: boolean
  leagueCode: string | null
  error?: string
}> {
  try {
    // 1. Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return { inLeague: false, leagueCode: null, error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // 2. Get user's league status - simpler query without TypeScript issues
    const { data, error } = await supabase
      .from('league_members')
      .select('leagueId')
      .eq('userId', session.user.id)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      return { inLeague: false, leagueCode: null, error: 'Database error' }
    }

    if (!data) {
      return { inLeague: false, leagueCode: null }
    }

    // 3. Get the league's joinCode in a separate query for clarity
    if (!data.leagueId) {
      return { inLeague: false, leagueCode: null, error: 'Invalid league data' }
    }

    const { data: leagueData, error: leagueError } = await supabase
      .from('leagues')
      .select('joinCode')
      .eq('id', data.leagueId)
      .single()

    if (leagueError) {
      console.error('League fetch error:', leagueError)
      return { inLeague: false, leagueCode: null, error: 'League not found' }
    }

    return {
      inLeague: true,
      leagueCode: leagueData.joinCode
    }

  } catch (error) {
    console.error('Error checking user league status:', error)
    return { inLeague: false, leagueCode: null, error: 'Internal server error' }
  }
}

export async function joinLeague(
  leagueId: string,
  skillTier: string,
  availability: UserAvailability
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Check authentication first
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!leagueId || !skillTier) {
      return { success: false, error: 'Missing required fields' }
    }

    const supabase = await createClient()
    const userId = session.user.id

    // 2. Check if user is already a member (must be done first)
    const { data: existingMember } = await supabase
      .from('league_members')
      .select('id')
      .eq('userId', userId)
      .eq('leagueId', leagueId)
      .maybeSingle()

    if (existingMember) {
      return { success: false, error: 'Already a member of this league' }
    }

    // 3. Get next rank
    const { data: rankData, error: rankError } = await supabase
      .from('league_members')
      .select('rank')
      .eq('leagueId', leagueId)
      .order('rank', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (rankError) {
      console.error('Error getting rank:', rankError)
      return { success: false, error: 'Failed to determine rank' }
    }

    const nextRank = (rankData?.rank || 0) + 1

    // 4. Add user to league with availability and log activity concurrently
    const [memberResult, logResult] = await Promise.all([
      // Add user to league with availability stored in league_members
      supabase
        .from('league_members')
        .insert({
          leagueId,
          userId,
          rank: nextRank,
          skillTier,
          status: 'active',
          availability: (availability || {}) as Json,
          joinedAt: new Date().toISOString()
        }),

      // Log the activity
      supabase
        .from('activity_logs')
        .insert({
          leagueId,
          userId,
          action: 'joinedLeague',
          metadata: { skillTier, rank: nextRank },
          createdAt: new Date().toISOString()
        })
    ])

    if (memberResult.error) {
      console.error('Error adding member:', memberResult.error)
      return { success: false, error: 'Failed to join league' }
    }

    if (logResult.error) {
      console.error('Error logging activity:', logResult.error)
      // Don't fail the entire operation for logging errors
    }

    // 5. Revalidate relevant pages
    revalidatePath(`/league/${leagueId}`)
    revalidatePath('/leagues')

    return { success: true }

  } catch (error) {
    console.error('Error joining league:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function getLeagueByCode(code: string): Promise<{
  league: League | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: league, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('joinCode', code)
      .maybeSingle();

    if (error) {
      console.error('Error fetching league:', error);
      return { league: null, error: 'Failed to fetch league' };
    }

    return { league };
  } catch (error) {
    console.error('Error getting league by code:', error);
    return { league: null, error: 'Internal server error' };
  }
}

export async function getUserMembershipData(userId: string, leagueId: string): Promise<{
  isMember: boolean;
  membershipData?: {
    id: string;
    rank: number;
    previousRank?: number;
    skillTier: string;
    status: string | null;
    joinedAt: string | null;
    availability: Json | null;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('league_members')
      .select('id, rank, previousRank, skillTier, status, joinedAt, availability')
      .eq('userId', userId)
      .eq('leagueId', leagueId)
      .maybeSingle();

    if (error) {
      console.error('Error checking membership:', error);
      return { isMember: false, error: 'Failed to check membership' };
    }

    if (!data) {
      return { isMember: false };
    }

    return { 
      isMember: true, 
      membershipData: {
        id: data.id,
        rank: data.rank,
        previousRank: data.previousRank ?? undefined,
        skillTier: data.skillTier,
        status: data.status,
        joinedAt: data.joinedAt,
        availability: data.availability
      }
    };
  } catch (error) {
    console.error('Error getting user membership data:', error);
    return { isMember: false, error: 'Internal server error' };
  }
}

export async function getLeagueMembers(leagueId: string): Promise<{
  members: Array<{
    id: string;
    rank: number;
    skillTier: string;
    status: string | null;
    joinedAt: string | null;
    userId: string | null;
    recentRejections: number | null;
    recentAcceptances: number | null;
    recentCancellations: number | null;
    activityWindowStart: string | null;
    previousRank: number | null;
    availability: Json | null;
    ootDaysUsed: number | null;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      organizationName: string | null;
      image: string | null;
    } | null;
  }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: members, error } = await supabase
      .from('league_members')
      .select(`
        id,
        rank,
        skillTier,
        status,
        joinedAt,
        userId,
        recentRejections,
        recentAcceptances,
        recentCancellations,
        activityWindowStart,
        previousRank,
        availability,
        ootDaysUsed,
        user:userId (
          id,
          firstName,
          lastName,
          organizationName,
          image
        )
      `)
      .eq('leagueId', leagueId)
      .order('joinedAt', { ascending: false });

    if (error) {
      console.error('Error fetching league members:', error);
      return { members: [], error: 'Failed to fetch members' };
    }

    return { members: members || [] };
  } catch (error) {
    console.error('Error getting league members:', error);
    return { members: [], error: 'Internal server error' };
  }
}

export async function getUserPendingChallenges(userId: string, leagueId: string): Promise<{
  challenges: Array<{
    id: string;
    challengerId: string | null;
    challengedId: string | null;
    status: string | null;
  }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('id, challengerId, challengedId, status')
      .eq('leagueId', leagueId)
      .or(`challengerId.eq.${userId},challengedId.eq.${userId}`)
      .in('status', ['pending', 'accepted'])
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching pending challenges:', error);
      return { challenges: [], error: 'Failed to fetch challenges' };
    }

    return { challenges: challenges || [] };
  } catch (error) {
    console.error('Error getting pending challenges:', error);
    return { challenges: [], error: 'Internal server error' };
  }
}

export async function getDetailedChallenges(userId: string, leagueId: string): Promise<{
  challenges: Array<{
    id: string;
    challengerId: string | null;
    challengedId: string | null;
    status: string | null;
    createdAt: string | null;
    proposedSlots: Json | null;
    selectedSlot: Json | null;
    challenger?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      image: string | null;
      organizationName: string | null;
    } | null;
    challenged?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      image: string | null;
      organizationName: string | null;
    } | null;
    challengerRank?: number;
    challengedRank?: number;
  }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get challenges first
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('id, challengerId, challengedId, status, createdAt, proposedSlots, selectedSlot')
      .eq('leagueId', leagueId)
      .or(`challengerId.eq.${userId},challengedId.eq.${userId}`)
      .in('status', ['pending', 'accepted', 'rejected'])
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching detailed challenges:', error);
      return { challenges: [], error: 'Failed to fetch challenges' };
    }

    // Get user details and ranks for each challenge
    const challengesWithDetails = await Promise.all((challenges || []).map(async (challenge) => {
      let challenger = null, challenged = null, challengerRank = undefined, challengedRank = undefined;

      // Get challenger details and rank
      if (challenge.challengerId) {
        const [userResult, memberResult] = await Promise.all([
          supabase
            .from('user')
            .select('id, firstName, lastName, image, organizationName')
            .eq('id', challenge.challengerId)
            .single(),
          supabase
            .from('league_members')
            .select('rank')
            .eq('userId', challenge.challengerId)
            .eq('leagueId', leagueId)
            .single()
        ]);
        
        challenger = userResult.data;
        challengerRank = memberResult.data?.rank;
      }

      // Get challenged details and rank
      if (challenge.challengedId) {
        const [userResult, memberResult] = await Promise.all([
          supabase
            .from('user')
            .select('id, firstName, lastName, image, organizationName')
            .eq('id', challenge.challengedId)
            .single(),
          supabase
            .from('league_members')
            .select('rank')
            .eq('userId', challenge.challengedId)
            .eq('leagueId', leagueId)
            .single()
        ]);
        
        challenged = userResult.data;
        challengedRank = memberResult.data?.rank;
      }

      return {
        ...challenge,
        challenger,
        challenged,
        challengerRank,
        challengedRank
      };
    }));

    return { challenges: challengesWithDetails };
  } catch (error) {
    console.error('Error getting detailed challenges:', error);
    return { challenges: [], error: 'Internal server error' };
  }
}