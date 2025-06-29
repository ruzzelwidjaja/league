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

    // 3. Get next rank and update user availability concurrently
    const [rankResult, availabilityResult] = await Promise.all([
      // Get next rank
      supabase
        .from('league_members')
        .select('rank')
        .eq('leagueId', leagueId)
        .order('rank', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Update user availability
      availability ? supabase
        .from('user')
        .update({
          availability: availability,
          updatedAt: new Date().toISOString()
        })
        .eq('id', userId) : Promise.resolve({ error: null })
    ])

    if (rankResult.error) {
      console.error('Error getting rank:', rankResult.error)
      return { success: false, error: 'Failed to determine rank' }
    }

    if (availabilityResult.error) {
      console.error('Error updating availability:', availabilityResult.error)
      return { success: false, error: 'Failed to update availability' }
    }

    const nextRank = (rankResult.data?.rank || 0) + 1

    // 4. Add user to league and log activity concurrently
    const [memberResult, logResult] = await Promise.all([
      // Add user to league
      supabase
        .from('league_members')
        .insert({
          leagueId,
          userId,
          rank: nextRank,
          skillTier,
          status: 'active',
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

    return { success: true }

  } catch (error) {
    console.error('Error joining league:', error)
    return { success: false, error: 'Internal server error' }
  }
}