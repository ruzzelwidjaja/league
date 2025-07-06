import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { InfoBox } from "@/components/ui/info-box";
import UserDropdown from "./UserDropdown";
import { headers } from "next/headers";
import { getLeagueByCode, checkUserMembership, getLeagueMembers } from "@/lib/actions/leagues";

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if email is verified
  if (!session.user.emailVerified) {
    redirect("/auth/signin?message=Please verify your email first");
  }

  // Get league by code
  const { league, error: leagueError } = await getLeagueByCode(code);
  if (leagueError || !league) {
    return <div>League not found</div>;
  }

  // Check if user is member
  const { isMember, error: membershipError } = await checkUserMembership(session.user.id, league.id);
  if (membershipError) {
    return <div>Error checking membership</div>;  
  }

  if (!isMember) {
    redirect(`/join/${code}`);
  }

  // Get all members with user details
  const { members, error: membersError } = await getLeagueMembers(league.id);
  if (membersError) {
    return <div>Error loading members</div>;
  }

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
    <main className="min-h-svh p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 gap-4 animate-fade-in-slide-up">
          <h1 className="text-2xl font-semibold text-gray-900">{league.name}</h1>
          <UserDropdown user={session.user} />
        </div>

        {/* Info Box */}
        <div className="animate-fade-in-slide-up">
          <InfoBox className="mb-8 text-sm text-muted-foreground p-4">
            We&apos;re currently registering players. You&apos;ll get an email once the league is ready to start.
          </InfoBox>
        </div>

        {/* Players List */}
        <div className="animate-fade-in-slide-up">
          <div className="mb-3">
            <h2 className="font-medium text-gray-900">Players ({members?.length || 0})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {members?.map((member) => (
              <div
                key={member.id}
                className="py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={member.user?.image || undefined}
                      alt={`${member.user?.firstName} ${member.user?.lastName}`}
                    />
                    <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                      {getInitials(member.user?.firstName, member.user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.user?.firstName} {member.user?.lastName}
                      </p>
                      {member.user?.id === session.user.id && (
                        <div className="bg-primary text-primary-foreground px-2 py-0.5 rounded-md text-xs font-medium">
                          You
                        </div>
                      )}
                    </div>
                    {member.user?.organizationName && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {member.user.organizationName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Joined {member.joinedAt ? formatJoinDate(member.joinedAt) : 'Recently'}
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
