import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserDropdown from "./components/UserDropdown";
import { headers } from "next/headers";
import { getLeagueByCode, getUserMembershipData, getLeagueMembers } from "@/lib/actions/leagues";
import { LeaguePreStart } from "./components/LeaguePreStart";
import { PlayerRankCard } from "@/components/PlayerRankCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LadderContent, LadderSkeleton } from "./components/LadderContent";
import { Suspense } from "react";

interface LeaguePageProps {
  params: Promise<{ code: string }>;
}

export default async function LeaguePage({ params }: LeaguePageProps) {
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

  // Check if user is member and get membership data
  const { isMember, membershipData, error: membershipError } = await getUserMembershipData(session.user.id, league.id);
  if (membershipError) {
    return <div>Error checking membership</div>;  
  }

  if (!isMember || !membershipData) {
    redirect(`/join/${code}`);
  }

  // Get all members with user details
  const { members, error: membersError } = await getLeagueMembers(league.id);
  if (membersError) {
    return <div>Error loading members</div>;
  }

  // Check if league has started
  const hasLeagueStarted = () => {
    const now = new Date();
    const seasonStart = new Date(league.seasonStart);
    return now >= seasonStart;
  };

  return (
    <main className="p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-1 gap-4 pb-4">
          <h1 className="text-xl font-semibold text-gray-900">{league.name}</h1>
          <UserDropdown user={session.user} />
        </div>

        {/* Conditional Content Based on League Status */}
        {hasLeagueStarted() ? (
          <div className="space-y-4">
            <PlayerRankCard 
              currentRank={membershipData.rank}
              previousRank={membershipData.previousRank}
            />
            
            <Tabs defaultValue="ladder" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ladder">Ladder</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ladder" className="mt-2">
                <Suspense fallback={<LadderSkeleton />}>
                  <LadderContent 
                    members={members || []}
                    currentUserId={session.user.id}
                    currentUserAvailability={membershipData.availability || null}
                    currentUserRank={membershipData.rank}
                    leagueId={league.id}
                  />
                </Suspense>
              </TabsContent>
              
              <TabsContent value="challenges" className="mt-4">
                <div className="py-8 text-center text-muted-foreground">
                  <p>TODO: Challenges</p>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <div className="py-8 text-center text-muted-foreground">
                  <p>TODO: History</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <LeaguePreStart 
            members={members || []}
            currentUserId={session.user.id}
          />
        )}
      </div>
    </main>
  );
}