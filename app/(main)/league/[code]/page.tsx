import React from "react";
import { requireVerifiedAuth } from "@/lib/session-utils";
import { redirect } from "next/navigation";
import UserDropdown from "./components/UserDropdown";
import { getLeagueByCode, getUserMembershipData, getLeagueMembers, getDetailedChallenges } from "@/lib/actions/leagues";
import { getNowInLocalTz } from "@/lib/utils";
import { LeaguePreStart } from "./components/LeaguePreStart";
import { PlayerRankCard } from "@/components/PlayerRankCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LadderContent, LadderSkeleton } from "./components/LadderContent";
import { ChallengesContent, ChallengesSkeleton } from "./components/ChallengesContent";
import { Suspense } from "react";

interface LeaguePageProps {
  params: Promise<{ code: string }>;
}

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { code } = await params;
  const session = await requireVerifiedAuth();

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

  // Get all members with user details and challenge data
  const [membersResult, challengesResult] = await Promise.all([
    getLeagueMembers(league.id),
    getDetailedChallenges(session.user.id, league.id)
  ]);

  if (membersResult.error) {
    return <div>Error loading members</div>;
  }

  if (challengesResult.error) {
    return <div>Error loading challenges</div>;
  }

  const { members } = membersResult;
  const { challenges } = challengesResult;

  // Check if league has started
  const hasLeagueStarted = () => {
    const now = getNowInLocalTz();
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
              pendingChallenges={challenges || []}
              currentUserId={session.user.id}
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
                    pendingChallenges={challenges || []}
                  />
                </Suspense>
              </TabsContent>
              
              <TabsContent value="challenges" className="mt-2">
                <Suspense fallback={<ChallengesSkeleton />}>
                  <ChallengesContent 
                    challenges={challenges || []}
                    currentUserId={session.user.id}
                    currentUserRank={membershipData.rank}
                    currentUserFirstName={session.user.firstName || ''}
                  />
                </Suspense>
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