/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { withAuth, signOut } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { createLeagueQueries, createUserQueries, createLeagueMemberQueries } from "@/lib/supabase/queries";

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { user } = await withAuth({ ensureSignedIn: true });
  console.log("IN LEAGUE PAGE");
  console.log("user in league page-->", user);
  if (!user) {
    redirect("/");
  }

  const leagueQueries = createLeagueQueries();
  const userQueries = createUserQueries();
  const leagueMemberQueries = createLeagueMemberQueries();

  // Get league by code
  const league = await leagueQueries.getLeagueByCode(code);

  if (!league) {
    return <div>League not found</div>;
  }

  // Get user from database
  const dbUser = await userQueries.getUserByWorkosId(user.id);

  // Check if user is member
  const isUserMember = dbUser ? await leagueMemberQueries.isUserInLeague(dbUser.id, league.id) : false;

  if (!isUserMember) {
    redirect(`/join/${code}`);
  }

  // Get all members for ladder display
  const members = await leagueMemberQueries.getLeagueMembers(league.id);

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
              "use server";
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
          <h2 className="text-xl font-semibold p-4 border-b">
            Current Rankings
          </h2>
          <div className="divide-y">
            {members?.map((member: any) => (
              <div
                key={member.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400">
                    #{member.rank}
                  </span>
                  <div>
                    <p className="font-semibold">
                      {member.users?.first_name} {member.users?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member.users?.email}
                    </p>
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
