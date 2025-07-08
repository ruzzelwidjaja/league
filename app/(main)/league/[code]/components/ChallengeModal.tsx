"use client";

import React, { useState, useEffect, useActionState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { sendChallenge } from "@/lib/actions/challenges";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Json } from "@/lib/supabase/database.types";
import { addDays, startOfDay, getDay } from "date-fns";

interface ChallengeModalProps {
  children: React.ReactNode;
  challengedUser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    rank: number;
    availability: Json | null;
  };
  currentUserAvailability: Json | null;
  currentUserRank: number;
  leagueId: string;
}

interface TimeSlot {
  id: string;
  date: string;
  day: string;
  slot: string;
}

interface Availability {
  [day: string]: {
    [timeSlot: string]: boolean;
  };
}

// Hook to detect mobile vs desktop
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
}

// Check if both users are available for a specific day and time slot
function isSharedAvailability(
  userAvailability: Json | null, 
  otherAvailability: Json | null, 
  dayName: string, 
  timeSlot: string
): boolean {
  if (!userAvailability || !otherAvailability) return false;

  const isAvailability = (obj: Json): obj is Availability => {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
  };

  if (!isAvailability(userAvailability) || !isAvailability(otherAvailability)) return false;

  return userAvailability[dayName]?.[timeSlot] && otherAvailability[dayName]?.[timeSlot];
}

// Count total shared availability slots
function getSharedAvailabilityCount(userAvailability: Json | null, otherAvailability: Json | null): number {
  if (!userAvailability || !otherAvailability) return 0;

  const isAvailability = (obj: Json): obj is Availability => {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
  };

  if (!isAvailability(userAvailability) || !isAvailability(otherAvailability)) return 0;

  let count = 0;
  for (const day in userAvailability) {
    if (otherAvailability[day]) {
      for (const timeSlot in userAvailability[day]) {
        if (userAvailability[day][timeSlot] && otherAvailability[day][timeSlot]) {
          count++;
        }
      }
    }
  }
  return count;
}

// Get date info for a specific date
function getDateInfo(date: Date) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const dayIndex = date.getDay();
  const dayName = days[dayIndex];
  const dayLabel = dayLabels[dayIndex];
  const dayNumber = date.getDate();
  
  return {
    dayName,
    dayLabel,
    dayNumber,
    isWeekend: dayIndex === 0 || dayIndex === 6,
    isWeekday: dayIndex >= 1 && dayIndex <= 5
  };
}

function ChallengeModalContent({ challengedUser, currentUserAvailability, currentUserRank, leagueId, onClose }: Omit<ChallengeModalProps, 'children'> & { onClose: () => void }) {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [state, formAction, isPending] = useActionState(sendChallenge, {
    success: false,
    error: undefined,
    message: undefined
  });

  const router = useRouter();

  const sharedAvailabilityCount = getSharedAvailabilityCount(currentUserAvailability, challengedUser.availability);
  
  const times = [
    { id: "lunch", label: "12-1pm" },
    { id: "after_work", label: "5-7pm" }
  ];

  // Handle success - close modal and show toast
  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      onClose();
      router.refresh();
    }
  }, [state.success, state.message, onClose, router]);

  // Calculate rank changes
  const getRankPrediction = () => {
    const isChallengingUp = challengedUser.rank < currentUserRank; // Lower rank number = better position
    
    if (isChallengingUp) {
      // Challenging someone above you
      return {
        win: challengedUser.rank, // You take their rank
        lose: currentUserRank // You stay the same
      };
    } else {
      // Challenging someone below you  
      return {
        win: currentUserRank, // You stay the same
        lose: challengedUser.rank // You drop to their rank
      };
    }
  };

  const rankPrediction = getRankPrediction();

  // Get the dates for the current week view
  const getWeekDates = () => {
    const today = startOfDay(new Date());
    
    // Calculate start of week (Monday) for the current offset
    const startOfWeek = addDays(today, -getDay(today) + 1 + (currentWeekOffset * 7));
    
    const dates = [];
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const date = addDays(startOfWeek, i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  
  // Use local timezone - create date at start of day in local time
  const today = startOfDay(new Date()); // This creates today at midnight in local timezone
  
  // Allow selection from today up to 1 week ahead (6 days ahead, so 7 days total including today)
  const maxDate = addDays(today, 6);

  const isDateSelectable = (date: Date) => {
    // Normalize the input date to start of day for consistent comparison
    const normalizedDate = startOfDay(date);
    
    const dateInfo = getDateInfo(normalizedDate);
    const isAfterOrSameAsToday = normalizedDate >= today;
    const isBeforeOrSameAsMaxDate = normalizedDate <= maxDate;
    const result = dateInfo.isWeekday && isAfterOrSameAsToday && isBeforeOrSameAsMaxDate;
    
    return result;
  };

  // Check if a week has any available slots
  const hasAvailableSlots = (weekOffset: number) => {
    const testToday = startOfDay(new Date());
    
    // Calculate start of week (Monday) for the given offset
    const testStartOfWeek = addDays(testToday, -getDay(testToday) + 1 + (weekOffset * 7));
    
    let hasAnySelectable = false;
    for (let i = 0; i < 5; i++) {
      const date = addDays(testStartOfWeek, i);
      const selectable = isDateSelectable(date);
      if (selectable) {
        hasAnySelectable = true;
      }
    }
    
    return hasAnySelectable;
  };

  const toggleSlot = (date: Date, timeSlot: string) => {
    // Normalize date to start of day for consistent comparison
    const normalizedDate = startOfDay(date);
    
    if (!isDateSelectable(normalizedDate)) return;

    const dateInfo = getDateInfo(normalizedDate);
    const slotId = `${normalizedDate.toISOString().split('T')[0]}-${timeSlot}`;
    
    const newSlot: TimeSlot = {
      id: slotId,
      date: normalizedDate.toISOString().split('T')[0],
      day: dateInfo.dayLabel,
      slot: timeSlot
    };

    setSelectedSlots(prev => {
      const exists = prev.find(s => s.id === slotId);
      if (exists) {
        return prev.filter(s => s.id !== slotId);
      } else {
        return [...prev, newSlot];
      }
    });
  };

  const isSlotSelected = (date: Date, timeSlot: string) => {
    // Normalize date to start of day for consistent comparison
    const normalizedDate = startOfDay(date);
    
    const slotId = `${normalizedDate.toISOString().split('T')[0]}-${timeSlot}`;
    return selectedSlots.some(s => s.id === slotId);
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleSubmit = (formData: FormData) => {
    // Add the selected slots to form data
    formData.append('challengedId', challengedUser.id);
    formData.append('leagueId', leagueId);
    formData.append('proposedSlots', JSON.stringify(selectedSlots));
    
    formAction(formData);
  };

  return (
    <div className="p-6 pt-2 mx-auto w-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-5">
        <Avatar className="size-9">
          <AvatarImage src={challengedUser.image || undefined} alt={`${challengedUser.firstName} ${challengedUser.lastName}`} />
          <AvatarFallback className="text-sm font-medium bg-primary text-primary-foreground">
            {getInitials(challengedUser.firstName, challengedUser.lastName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-md">
            {challengedUser.firstName} {challengedUser.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">Rank #{challengedUser.rank}</p>
        </div>
      </div>

      {/* Rank Changes Badge Section */}
      <div className="flex items-center gap-3 mb-7">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 border border-green-200 text-green-700">
            <span className="text-sm font-medium">🏆</span>
            <span className="text-sm font-medium"> #{currentUserRank} → #{rankPrediction.win}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-700">
            <span className="text-sm font-medium">😞</span>
            <span className="text-sm font-medium"> #{currentUserRank} → #{rankPrediction.lose}</span> 
          </div>
        </div>
      </div>

      {/* Shared Availability Info */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Shared Availability</span>
        </div>
        {sharedAvailabilityCount > 0 ? (
          <p className="text-sm text-muted-foreground">
            You both have {sharedAvailabilityCount} matching time slots (highlighted in green below)
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No matching availability found</p>
        )}
      </div>



      {/* Time Slot Selection */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Propose Time Slots</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(prev => prev - 1)}
              disabled={currentWeekOffset === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              disabled={currentWeekOffset >= 1 || !hasAvailableSlots(currentWeekOffset + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Day headers */}
          <div className="grid grid-cols-6 gap-2 text-sm">
            <div></div>
            {weekDates.map((date, index) => {
              const dateInfo = getDateInfo(date);
              return (
                <div key={index} className="text-center">
                  <div className="font-medium text-foreground">{dateInfo.dayLabel}</div>
                  <div className="text-xs text-muted-foreground">{dateInfo.dayNumber}</div>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          {times.map((time) => (
            <div key={time.id} className="grid grid-cols-6 gap-2">
              <div className="flex items-center text-sm font-medium text-foreground py-2">
                {time.label}
              </div>
              {weekDates.map((date, dateIndex) => {
                const isSelectable = isDateSelectable(date);
                const isSelected = isSlotSelected(date, time.id);
                const dateInfo = getDateInfo(date);
                const isShared = isSharedAvailability(currentUserAvailability, challengedUser.availability, dateInfo.dayName, time.id);
                
                return (
                  <button
                    key={dateIndex}
                    onClick={() => toggleSlot(date, time.id)}
                    disabled={!isSelectable}
                    className={`h-10 rounded-md border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : isSelectable
                        ? isShared
                          ? "border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                        : "border-border bg-border text-muted-foreground cursor-not-allowed"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mt-4 space-y-2">
          {sharedAvailabilityCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-50 border border-green-300"></div>
              <span>Shared availability</span>
            </div>
          )}
          <div>Selected {selectedSlots.length} time slots • You can select up to 1 week ahead</div>
        </div>
      </div>

      {/* Error Messages */}
      {state.error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4">
          {state.error}
        </div>
      )}

      {/* Action Button */}
      <form action={handleSubmit}>
        <Button
          type="submit"
          disabled={selectedSlots.length === 0 || isPending}
          className="w-full"
        >
          {isPending ? "Sending Challenge..." : "Send Challenge"}
        </Button>
      </form>
    </div>
  );
}

export function ChallengeModal({ children, challengedUser, currentUserAvailability, currentUserRank, leagueId }: ChallengeModalProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => setOpen(false), []);

  const content = (
    <ChallengeModalContent
      challengedUser={challengedUser}
      currentUserAvailability={currentUserAvailability}
      currentUserRank={currentUserRank}
      leagueId={leagueId}
      onClose={handleClose}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {children}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Send Challenge</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Challenge</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
} 