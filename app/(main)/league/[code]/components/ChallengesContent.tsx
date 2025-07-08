'use client'
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, MessageCircle } from "lucide-react";
import type { Json } from "@/lib/supabase/database.types";
import { RespondToChallengeModal } from "./RespondToChallengeModal";
import { formatChallengeSlot, acceptChallengeWhatsApp, capitalizeFirstLetter } from "@/lib/utils";

interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  image?: string | null;
  organizationName?: string | null;
  phoneNumber?: string | null;
}

interface Challenge {
  id: string;
  challengerId: string | null;
  challengedId: string | null;
  status: string | null;
  createdAt: string | null;
  proposedSlots: Json | null;
  selectedSlot: Json | null;
  challenger?: User | null;
  challenged?: User | null;
  challengerRank?: number;
  challengedRank?: number;
}

interface ChallengesContentProps {
  challenges: Challenge[];
  currentUserId: string;
  currentUserRank: number;
  currentUserFirstName: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  type: 'active' | 'incoming' | 'outgoing' | 'rejected';
}

export function ChallengesContent({ challenges, currentUserId, currentUserRank, currentUserFirstName }: ChallengesContentProps) {
  // Calculate days remaining until auto-cancellation (5 working days = ~7 calendar days)
  const getDaysRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remainingDays = 7 - diffDays;
    return Math.max(0, remainingDays);
  };

  // Format selected time slot for active challenges
  const formatSelectedTimeSlot = (selectedSlot: Json | null) => {
    if (selectedSlot && typeof selectedSlot === 'object') {
      const slot = selectedSlot as { day?: string; slot?: string; date?: string };
      return formatChallengeSlot(slot);
    }
    return "Time TBD";
  };

  // Filter challenges by type
  const activeChallenges = challenges.filter(c => c.status === 'accepted');
  const incomingChallenges = challenges.filter(c => 
    c.status === 'pending' && c.challengedId === currentUserId
  );
  const outgoingChallenges = challenges.filter(c => 
    c.challengerId === currentUserId && (c.status === 'pending' || c.status === 'rejected')
  );

  // Filter recent rejections (past week)
  const recentRejections = outgoingChallenges.filter(c => {
    if (c.status !== 'rejected' || !c.createdAt) return false;
    const created = new Date(c.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo;
  });

  const pendingOutgoing = outgoingChallenges.filter(c => c.status === 'pending');

  const ChallengeCard = ({ 
    challenge, 
    type 
  }: ChallengeCardProps) => {
    const isCurrentUserChallenger = challenge.challengerId === currentUserId;
    const opponent = isCurrentUserChallenger ? challenge.challenged : challenge.challenger;
    const opponentRank = isCurrentUserChallenger ? challenge.challengedRank : challenge.challengerRank;
    
    // Determine if opponent is ranked higher or lower
    const isOpponentHigher = opponentRank && opponentRank < currentUserRank;
    
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-transparent">
        <div className="flex items-center justify-between">
          {/* Left Side: Rank Direction & Player Info */}
          <div className="flex items-center gap-3">
            {/* Rank Direction Indicator - Rounded Box */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              isOpponentHigher 
                ? 'bg-green-100 border border-green-200' 
                : 'bg-red-100 border border-red-200'
            }`}>
              {isOpponentHigher ? (
                <ChevronUp className="w-4 h-4 text-green-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-red-600" />
              )}
            </div>

            {/* Player Info */}
            <div className="flex flex-col">
              <p className="font-medium text-sm text-gray-900">
                {opponent?.firstName} {opponent?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                Rank #{opponentRank || '?'}
              </p>
            </div>
          </div>

          {/* Right Side Actions/Status */}
          <div className="flex items-center gap-1">
            {type === 'active' && (
              <div className="flex flex-col items-end gap-1">
                <p className="text-xs text-muted-foreground">
                  {formatSelectedTimeSlot(challenge.selectedSlot)}
                </p>
                {challenge.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    {getDaysRemaining(challenge.createdAt)} days left
                  </p>
                )}
                <div className="flex items-center gap-1">
                  {opponent?.phoneNumber && (
                    <Button 
                      size="xs" 
                      variant="outline"
                      onClick={() => {
                        if (!opponent?.phoneNumber) return;
                        const timeSlot = formatSelectedTimeSlot(challenge.selectedSlot);
                        const whatsappUrl = acceptChallengeWhatsApp(opponent?.phoneNumber, timeSlot, capitalizeFirstLetter(currentUserFirstName));
                        window.open(whatsappUrl, '_blank');
                      }}
                    >
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                  )}
                  <Button size="xs" variant="outline">
                    Submit Result
                  </Button>
                </div>
              </div>
            )}
            
            {type === 'incoming' && (
              <div className="flex flex-col items-end gap-1">
                {challenge.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    {getDaysRemaining(challenge.createdAt)} days left
                  </p>
                )}
                <RespondToChallengeModal
                  challenge={challenge}
                  currentUserRank={currentUserRank}
                >
                  <Button size="xs" variant="outline">
                    View Challenge
                  </Button>
                </RespondToChallengeModal>
              </div>
            )}
            
            {type === 'outgoing' && (
              <>
                <Badge variant="secondary">Pending</Badge>
                <Button size="xs" variant="ghost" className="text-red-500">
                  Withdraw
                </Button>
              </>
            )}
            
            {type === 'rejected' && (
              <Badge variant="destructive">Rejected</Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-2">
      {/* Active Challenges - Only show if there are challenges */}
      {activeChallenges.length > 0 && (
        <div>
          <h3 className="font-semibold text-md mb-3">Active Challenges</h3>
          <div className="space-y-3">
            {activeChallenges.map((challenge, index) => (
              <ChallengeCard
                key={index}
                challenge={challenge}
                type="active"
              />
            ))}
          </div>
        </div>
      )}

      {/* Incoming Challenges - Only show if there are challenges */}
      {incomingChallenges.length > 0 && (
        <div>
          <h3 className="font-semibold text-md mb-3">Incoming Challenges</h3>
          <div className="space-y-3">
            {incomingChallenges.map((challenge, index) => (
              <ChallengeCard
                key={index}
                challenge={challenge}
                type="incoming"
              />
            ))}
          </div>
        </div>
      )}

      {/* Outgoing Challenges - Only show if there are challenges */}
      {(pendingOutgoing.length > 0 || recentRejections.length > 0) && (
        <div>
          <h3 className="font-semibold text-md mb-3">Outgoing Challenges</h3>
          <div className="space-y-3">
            {/* Pending outgoing challenges */}
            {pendingOutgoing.map((challenge, index) => (
              <ChallengeCard
                key={`pending-${index}`}
                challenge={challenge}
                type="outgoing"
              />
            ))}
            
            {/* Recent rejections */}
            {recentRejections.map((challenge, index) => (
              <ChallengeCard
                key={`rejected-${index}`}
                challenge={challenge}
                type="rejected"
              />
            ))}
          </div>
        </div>
      )}

      {/* Show a message if no challenges exist at all */}
      {activeChallenges.length === 0 && incomingChallenges.length === 0 && pendingOutgoing.length === 0 && recentRejections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-md">No challenges yet</p>
          <p className="text-muted-foreground text-sm mt-2">
            Head to the Ladder tab to challenge someone!
          </p>
        </div>
      )}
    </div>
  );
}

export function ChallengesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Loading skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="size-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="size-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 