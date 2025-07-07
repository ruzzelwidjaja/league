import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock } from "lucide-react";
import type { Json } from "@/lib/supabase/database.types";
import { ChallengeModal } from "./ChallengeModal";

interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  image?: string | null;
  organizationName?: string | null;
}

interface Availability {
  [day: string]: {
    [timeSlot: string]: boolean;
  };
}

interface Member {
  id: string;
  rank: number;
  skillTier: string;
  status: string | null;
  joinedAt: string | null;
  userId: string | null;
  recentRejections: number | null;
  recentAcceptances: number | null;
  recentCancellations: number | null;
  activityWindowStart: string | null;
  previousRank: number | null;
  availability: Json | null;
  ootDaysUsed: number | null;
  user: User | null;
}

interface Challenge {
  id: string;
  challengerId: string | null;
  challengedId: string | null;
  status: string | null;
}

interface LadderContentProps {
  members: Member[];
  currentUserId: string;
  currentUserAvailability: Json | null;
  currentUserRank: number;
  leagueId: string;
  pendingChallenges: Challenge[];
}

export function LadderContent({ members, currentUserId, currentUserAvailability, currentUserRank, leagueId, pendingChallenges }: LadderContentProps) {
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Sort members by rank (lower rank number = better position)
  const sortedMembers = [...members].sort((a, b) => a.rank - b.rank);
  
  // Check if a player can be challenged
  const canChallenge = (targetRank: number) => {
    // Can challenge players above you (lower rank number)
    if (targetRank < currentUserRank) return true;
    
    // Can challenge players within 3 ranks below you
    if (targetRank > currentUserRank && targetRank <= currentUserRank + 3) return true;
    
    return false;
  };

  // Get challenge status with another user
  const getChallengeStatus = (otherUserId: string) => {
    const challenge = pendingChallenges.find(c => 
      (c.challengerId === currentUserId && c.challengedId === otherUserId) ||
      (c.challengerId === otherUserId && c.challengedId === currentUserId)
    );
    
    if (!challenge) return null;
    
    // Return more specific status based on who initiated the challenge
    if (challenge.challengerId === currentUserId) {
      return challenge.status === 'pending' ? 'sent' : challenge.status;
    } else {
      return challenge.status === 'pending' ? 'received' : challenge.status;
    }
  };

  // Count pending challenges sent by current user
  const pendingChallengesSent = pendingChallenges.filter(c => 
    c.challengerId === currentUserId && c.status === 'pending'
  ).length;
  
  const hasReachedChallengeLimit = pendingChallengesSent >= 3;

  // Check if two players have similar availability
  const hasSimilarAvailability = (userAvailability: Json | null, otherAvailability: Json | null) => {
    if (!userAvailability || !otherAvailability) return false;
    
    // Type guard to check if the Json is an Availability object
    const isAvailability = (obj: Json): obj is Availability => {
      return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
    };
    
    if (!isAvailability(userAvailability) || !isAvailability(otherAvailability)) return false;
    
    // Check if they have any overlapping available time slots
    for (const day in userAvailability) {
      if (otherAvailability[day]) {
        for (const timeSlot in userAvailability[day]) {
          if (userAvailability[day][timeSlot] && otherAvailability[day][timeSlot]) {
            return true; // Found at least one overlapping available time slot
          }
        }
      }
    }
    
    return false;
  };


  return (
    <div>
      {sortedMembers.map((member, index) => {
        const isCurrentUser = member.user?.id === currentUserId;
        
        return (
          <React.Fragment key={member.id}>
            <div
              className={`py-4 flex items-center gap-3 transition-colors ${
                isCurrentUser 
                  ? 'bg-muted border border-primary/20 rounded-lg px-3' 
                  : null
              }`}
            >
            {/* Rank */}
            <div className="w-8 text-center">
              <span className={`text-sm font-medium text-muted-foreground`}>
                {member.rank}
              </span>
            </div>

            {/* Avatar */}
            <Avatar className="size-10">
              <AvatarImage
                src={member.user?.image || undefined}
                alt={`${member.user?.firstName} ${member.user?.lastName}`}
              />
              <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                {getInitials(member.user?.firstName, member.user?.lastName)}
              </AvatarFallback>
            </Avatar>

            {/* Player Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium truncate text-gray-900`}>
                  {member.user?.firstName} {member.user?.lastName}
                </p>
                {!isCurrentUser && hasSimilarAvailability(currentUserAvailability, member.availability) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                        <Clock className="w-3 h-3" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Similar availability</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              {member.user?.organizationName && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {member.user.organizationName}
                </p>
              )}
            </div>

            {/* Right side - You tag or Challenge button */}
            <div className="text-right">
              {isCurrentUser ? (
                <div className="bg-primary text-primary-foreground px-2 py-0.5 mr-2 rounded-md text-xs font-medium">
                  You
                </div>
              ) : (() => {
                const challengeStatus = getChallengeStatus(member.userId || '');
                
                if (challengeStatus) {
                  // Show challenge status
                  if (challengeStatus === 'sent') {
                    return (
                      <div className="text-xs text-amber-600 mr-2.5 font-medium">
                        Pending
                      </div>
                    );
                  } else if (challengeStatus === 'received') {
                    return (
                      <div className="text-xs text-blue-600 mr-2.5 font-medium">
                        Respond
                      </div>
                    );
                  } else if (challengeStatus === 'accepted') {
                    return (
                      <div className="text-xs text-green-600 mr-2.5 font-medium">
                        Accepted
                      </div>
                    );
                  }
                  return (
                    <div className="text-xs text-muted-foreground mr-2.5">
                      {challengeStatus}
                    </div>
                  );
                } else if (canChallenge(member.rank)) {
                  // Check if user has reached challenge limit
                  if (hasReachedChallengeLimit) {
                    return (
                      <div className="text-xs text-muted-foreground mr-2.5">
                        Max challenges
                      </div>
                    );
                  }
                  
                  // Show challenge button
                  return (
                    <ChallengeModal
                      challengedUser={{
                        id: member.userId || '',
                        firstName: member.user?.firstName || null,
                        lastName: member.user?.lastName || null,
                        image: member.user?.image || null,
                        rank: member.rank,
                        availability: member.availability
                      }}
                      currentUserAvailability={currentUserAvailability}
                      currentUserRank={currentUserRank}
                      leagueId={leagueId}
                    >
                      <Button 
                        size="xs" 
                        variant="outline"
                        title="Challenge this player"
                      >
                        Challenge
                      </Button>
                    </ChallengeModal>
                  );
                } else {
                  // Show unavailable
                  return (
                    <div className="text-xs text-muted-foreground mr-2.5">
                      Unavailable
                    </div>
                  );
                }
              })()}
            </div>
            </div>
            
            {/* Divider - 90% width, not after last item */}
            {index < sortedMembers.length - 1 && (
              <div className="w-full flex justify-center">
                <div className="w-[95%] h-px bg-gray-100"></div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {(!members || members.length === 0) && (
        <div className="py-8 text-center text-muted-foreground">
          <p>No players in the ladder yet.</p>
        </div>
      )}
    </div>
  );
}

export function LadderSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 text-center">
            <Skeleton className="h-4 w-6 mx-auto" />
          </div>
          <Skeleton className="size-10 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="text-right">
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
} 