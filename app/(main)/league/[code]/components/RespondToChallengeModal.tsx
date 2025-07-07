'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { acceptChallenge } from '@/lib/actions/challenges';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { toast } from 'sonner';
import type { Json } from '@/lib/supabase/database.types';

interface TimeSlot {
  id: string;
  day: string;
  date: string;
  slot: string;
}

interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  image?: string | null;
  organizationName?: string | null;
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

interface RespondToChallengeModalProps {
  challenge: Challenge;
  currentUserRank: number;
  children: React.ReactNode;
}

const initialState = {
  success: false,
  error: undefined,
  message: undefined,
  fieldErrors: undefined,
  challengeId: undefined,
};

export function RespondToChallengeModal({ challenge, currentUserRank, children }: RespondToChallengeModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [state, formAction, isPending] = useActionState(acceptChallenge, initialState);
  const router = useRouter();

  // Get opponent info (challenger since we're the challenged party)
  const opponent = challenge.challenger;
  const opponentRank = challenge.challengerRank || 0;

  // Calculate rank changes
  const getRankPrediction = () => {
    const isChallengingUp = opponentRank < currentUserRank; // Lower rank number = better position
    
    if (isChallengingUp) {
      // Challenging someone above you
      return {
        win: opponentRank, // You take their rank
        lose: currentUserRank // You stay the same
      };
    } else {
      // Challenging someone below you  
      return {
        win: currentUserRank, // You stay the same
        lose: opponentRank // You drop to their rank
      };
    }
  };

  const rankPrediction = getRankPrediction();

  // Parse proposed slots - type guard and fallback
  const proposedSlots: TimeSlot[] = Array.isArray(challenge.proposedSlots) 
    ? (challenge.proposedSlots as unknown as TimeSlot[])
    : [];

  // Sort proposed slots by date (earliest first)
  const sortedProposedSlots = proposedSlots.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const mapDayToFull = (day: string) => {
    const dayMap: { [key: string]: string } = {
      'Mon': 'Monday',
      'Tue': 'Tuesday', 
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday',
      'Sun': 'Sunday'
    };
    return dayMap[day] || day;
  };

  const formatTimeSlot = (slot: string) => {
    return slot === 'lunch' ? '12-1pm' : '5-7pm';
  };

  const handleSubmit = async (formData: FormData) => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    formData.append('challengeId', challenge.id);
    formData.append('selectedSlot', JSON.stringify(selectedSlot));
    
    await formAction(formData);
  };

  // Handle success
  React.useEffect(() => {
    if (state.success) {
      setOpen(false);
      toast.success(state.message || 'Challenge accepted successfully!');
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

  const ModalContent = () => (
    <div className="space-y-6 p-1">
      {/* Player Card */}
      <div className="flex items-center gap-3 mb-5">
        <Avatar className="size-9">
          <AvatarImage
            src={opponent?.image || undefined}
            alt={`${opponent?.firstName} ${opponent?.lastName}`}
          />
          <AvatarFallback className="text-sm font-medium bg-primary text-primary-foreground">
            {getInitials(opponent?.firstName, opponent?.lastName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-md">
            {opponent?.firstName} {opponent?.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">Rank #{opponentRank}</p>
        </div>
      </div>

      {/* Rank Predictions */}
      <div className="flex items-center gap-3 mb-7">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 border border-green-200 text-green-700">
            <span className="text-sm font-medium">🏆</span>
            <span className="text-sm font-medium">#{currentUserRank} → #{rankPrediction.win}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-700">
            <span className="text-sm font-medium">😞</span>
            <span className="text-sm font-medium">#{currentUserRank} → #{rankPrediction.lose}</span>
          </div>
        </div>
      </div>

      {/* Proposed Time Slots */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">
          Proposed Time Slots ({sortedProposedSlots.length})
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          {sortedProposedSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                selectedSlot?.id === slot.id
                  ? 'border-primary bg-muted text-foreground'
                  : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{mapDayToFull(slot.day)}</p>
                  <p className="text-xs text-muted-foreground">{slot.date}</p>
                </div>
                <Badge variant="default" className="text-xs">
                  {formatTimeSlot(slot.slot)}
                </Badge>
              </div>
            </button>
          ))}
        </div>

        {/* Explanation */}
        <div className="text-xs text-muted-foreground">
          <p>These are suggested time slots from your challenger. Select one that works best for you to confirm the match time.</p>
        </div>
      </div>

      {/* Accept Button */}
      <form action={handleSubmit}>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!selectedSlot || isPending}
        >
          {isPending ? 'Accepting...' : 'Accept Challenge'}
        </Button>
      </form>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Challenge</DialogTitle>
          </DialogHeader>
          <ModalContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="px-4 pb-6">
        <DrawerHeader>
          <DrawerTitle>Respond to Challenge</DrawerTitle>
        </DrawerHeader>
        <ModalContent />
      </DrawerContent>
    </Drawer>
  );
} 