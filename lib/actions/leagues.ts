'use server'

import { createClient } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { UserAvailability } from '@/lib/supabase/types'

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
          availability: availability || {},
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