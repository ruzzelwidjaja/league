import { handleAuth } from '@workos-inc/authkit-nextjs';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const GET = handleAuth({
  returnPathname: '/',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSuccess: async ({ user, accessToken, refreshToken }) => {
    const supabase = createClient();
    console.log('user-->', user);
    // Sync user with Supabase
    const { data: dbUser, error } = await (await supabase)
      .from('users')
      .upsert({
        workos_user_id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'workos_user_id',
      })
      .select('id')
      .single();
    console.log('dbUser-->', dbUser);
    console.log('error-->', error);

    // Check if there's a pending league join
    const cookieStore = await cookies();
    const pendingLeagueCode = cookieStore.get('pending_league_code');
    console.log('cookieStore-->', cookieStore);
    console.log('pendingLeagueCode-->', pendingLeagueCode);
    console.log('dbUser-->', dbUser);

    if (pendingLeagueCode && dbUser) {
      // Join the league
      const { data: league } = await (await supabase)
        .from('leagues')
        .select('id')
        .eq('join_code', pendingLeagueCode.value)
        .single();
      
      if (league) {
        // Clear the pending cookies
        cookieStore.delete('pending_league_code');
        cookieStore.delete('pending_skill_tier');
        redirect(`/league/${pendingLeagueCode.value}`);
      }
    }
  },
});