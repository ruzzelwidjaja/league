/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { withAuth, signOut } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { createLeagueQueries, createUserQueries, createLeagueMemberQueries } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { InfoBox } from "@/components/ui/info-box";

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { user } = await withAuth({ ensureSignedIn: true });

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

  // Get all members for display
  const members = await leagueMemberQueries.getLeagueMembers(league.id);

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{league.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Code: {league.join_code} • {members?.length || 0} players</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button variant="outline" size="sm" type="submit">
              Sign Out
            </Button>
          </form>
        </div>

        <InfoBox className="mb-8 text-sm text-muted-foreground p-4">
          We are currently registering players. You will receive an email once the league is ready to start.
        </InfoBox>

        {/* Players List */}
        <div>
          <div className="mb-3">
            <h2 className="font-medium text-gray-900">Players</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {members?.map((member: any) => (
              <div
                key={member.id}
                className="py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={member.users?.profile_picture_url}
                      alt={`${member.users?.first_name} ${member.users?.last_name}`}
                    />
                    <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                      {getInitials(member.users?.first_name, member.users?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.users?.first_name} {member.users?.last_name}
                      </p>
                      {member.user_id === dbUser?.id && (
                        <div className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-medium">
                          You
                        </div>
                      )}
                    </div>
                    {member.users?.organization_name && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {member.users.organization_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Joined {member.joined_at ? formatJoinDate(member.joined_at) : 'Recently'}
                  </p>
                </div>
              </div>
            ))}

            {(!members || members.length === 0) && (
              <div className="py-8 text-center text-gray-500">
                <p>No players have joined yet.</p>
                <p className="text-sm mt-1">Share the league code to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
