"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Target, Clock } from "lucide-react";
import type { League } from "@/lib/supabase/types";
import type { UserAvailability } from "@/lib/supabase/types";
import { motion } from "motion/react";

export default function JoinLeagueForm({ league }: { league: League }) {
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const levels = [
    {
      id: "top",
      title: "Experienced",
      description: "Experienced player who can handle some spins and serves",
    },
    {
      id: "middle",
      title: "Intermediate",
      description: "Intermediate player, comfortable with basic rallies",
    },
    {
      id: "bottom",
      title: "Beginner",
      description: "Beginner or casual player, still learning",
    },
  ];

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const times = [
    { id: "lunch", label: "12-1pm" },
    { id: "after_work", label: "5-7pm" }
  ];

  const toggleSlot = (day: string, time: string) => {
    const slot = `${day}-${time}`;
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  // Convert selected slots to UserAvailability format
  const buildAvailability = (): UserAvailability => {
    const availability: UserAvailability = {};

    selectedSlots.forEach(slot => {
      const [day, time] = slot.split('-');
      if (!availability[day as keyof UserAvailability]) {
        availability[day as keyof UserAvailability] = {};
      }
      availability[day as keyof UserAvailability]![time as 'lunch' | 'after_work'] = true;
    });

    return availability;
  };

  const handleJoin = async () => {
    if (!selectedLevel || selectedSlots.length === 0) return;

    setIsJoining(true);

    try {
      const availability = buildAvailability();

      const response = await fetch("/api/leagues/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leagueId: league.id,
          skillTier: selectedLevel,
          availability,
        }),
      });

      if (response.ok) {
        router.push(`/league/${league.joinCode}`);
      } else {
        console.error("Failed to join league");
        setIsJoining(false);
      }
    } catch (error) {
      console.error("Error joining league:", error);
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 mt-10">
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-foreground mb-4">Join {league.name}</h1>
            <p className="text-muted-foreground">Help us place you in the right starting position</p>
          </div>

          {/* Skill Level Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">What&apos;s your skill level?</h2>
            </div>
            <p className="text-muted-foreground text-sm">This helps us place you in the appropriate starting third</p>

            <div className="space-y-3">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${selectedLevel === level.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  <div className="font-medium text-foreground mb-1">{level.title}</div>
                  <div className="text-sm text-muted-foreground">{level.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Availability Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">When are you usually available?</h2>
            </div>
            <p className="text-muted-foreground text-sm">Select all time slots when you can play (Monday - Friday only)</p>

            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-2 text-sm">
                <div></div>
                {dayLabels.map((day) => (
                  <div key={day} className="text-center font-medium text-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {times.map((time) => (
                <div key={time.id} className="grid grid-cols-6 gap-2">
                  <div className="flex items-center text-sm font-medium text-foreground py-2">
                    {time.label}
                  </div>
                  {days.map((day) => {
                    const slot = `${day}-${time.id}`;
                    const isSelected = selectedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(day, time.id)}
                        className={`h-10 rounded-md border-2 transition-all ${isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                          }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              Selected {selectedSlots.length} time slots
            </div>
          </div>

          <Button
            onClick={handleJoin}
            disabled={!selectedLevel || selectedSlots.length === 0 || isJoining}
            className="w-full"
            size="lg"
          >
            {isJoining ? "Joining..." : "Complete Registration"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
