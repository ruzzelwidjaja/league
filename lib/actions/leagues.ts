'use server'

import { createClient } from '@/lib/supabase/server'

export async function checkLeagueExists(code: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('leagues')
      .select('id')
      .eq('joinCode', code)
      .maybeSingle() // Use maybeSingle() to avoid error on no results

    if (error) {
      console.error('Database error:', error)
      return false
    }

    return !!data // Returns true if league exists, false otherwise
  } catch (error) {
    console.error('Error checking league:', error)
    return false
  }
}