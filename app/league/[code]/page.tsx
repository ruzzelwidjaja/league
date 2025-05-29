/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { withAuth, signOut } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function LeaguePage({ 
  params 
}: { 
  params: { code: string } 
}) {
  const { code } = await params;
  const { user } = await withAuth({ ensureSignedIn: true });
  
  if (!user) {
    redirect('/');
  }

  const supabase = createClient();
  
  // Get league by code
  const { data: league, error: leagueError } = await (await supabase)
    .from('leagues')
    .select('*')
    .eq('join_code', code)
    .single();
  
  if (!league) {
    return <div>League not found</div>;
  }
  if (leagueError) {
    console.error('Error fetching league:', leagueError);
  }

  // Get user from database
  const { data: dbUser } = await (await supabase)
    .from('users')
    .select('id')
    .eq('workos_user_id', user.id)
    .single();

  // Check if user is member
  const { data: membership } = await (await supabase)
    .from('league_members')
    .select('*')
    .eq('league_id', league.id)
    .eq('user_id', dbUser?.id)
    .single();

  if (!membership) {
    redirect(`/join/${code}`);
  }

  // Get all members for ladder display
  const { data: members } = await (await supabase)
    .from('league_members')
    .select(`
      *,
      users (
        email,
        first_name,
        last_name
      )
    `)
    .eq('league_id', league.id)
    .order('rank', { ascending: true });

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{league.name}</h1>
            <p className="text-gray-600">League Code: {league.join_code}</p>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
            <button 
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Sign Out
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-4 border-b">Current Rankings</h2>
          <div className="divide-y">
            {members?.map((member: any) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400">
                    #{member.rank}
                  </span>
                  <div>
                    <p className="font-semibold">
                      {member.users?.first_name} {member.users?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{member.users?.email}</p>
                  </div>
                </div>
                {member.user_id === dbUser?.id && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}