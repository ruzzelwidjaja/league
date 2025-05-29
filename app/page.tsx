// @ts-nocheck // ignore eslint
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import Link from 'next/link';
import { withAuth, getSignInUrl, getSignUpUrl, signOut } from '@workos-inc/authkit-nextjs';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import JoinLeagueInput from '@/components/JoinLeagueInput';

export default async function HomePage() {
  const { user } = await withAuth();
  
  if (user) {
    // User is logged in, check if they're in a league
    const supabase = createClient();
    
    // Get user from database
    const { data: dbUser } = await (await supabase)
      .from('users')
      .select('id')
      .eq('workos_user_id', user.id)
      .single();
    
    if (dbUser) {
      // Check if user is in any league
      const { data: membership } = await (await supabase)
        .from('league_members')
        .select(`
          league_id,
          leagues (
            id,
            join_code
          )
        `)
        .eq('user_id', dbUser.id)
        .single();
      
      if (membership?.leagues) {
        // User is in a league, redirect to it
        redirect(`/league/${membership.leagues.join_code}`);
      }
    }
    
    // User is logged in but not in a league
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome to League Ladder</h1>
            <p className="text-gray-600">Hey {user.email}! Enter your league code to join.</p>
          </div>
          
          <JoinLeagueInput />
          
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
            className="mt-8 text-center"
          >
            <button 
              type="submit"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Sign Out
            </button>
          </form>
        </div>
      </main>
    );
  }
  
  // User is not logged in - show landing page
  const signInUrl = await getSignInUrl();
  const signUpUrl = await getSignUpUrl();
  
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-5xl font-bold mb-4">League Ladder</h1>
        <p className="text-xl text-gray-600 mb-8">
          Compete. Challenge. Climb the ranks.
        </p>
        <p className="mb-8 text-gray-500">
          Join your workplace ping pong league and track your progress up the competitive ladder.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href={signInUrl}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Sign In
          </Link>
          <Link 
            href={signUpUrl}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}