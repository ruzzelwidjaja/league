import { z } from "zod";

// Challenge status enum
export const ChallengeStatusSchema = z.enum([
  "pending",
  "accepted",
  "rejected",
  "scheduled",
  "completed",
  "cancelled"
]);

// Time slot schema
export const TimeSlotSchema = z.object({
  date: z.string().datetime(),
  startTime: z.string(),
  endTime: z.string(),
  timezone: z.string().optional(),
});

// Match score schema
export const MatchScoreSchema = z.object({
  challengerScore: z.number().min(0),
  challengedScore: z.number().min(0),
  sets: z.array(z.object({
    challengerGames: z.number().min(0),
    challengedGames: z.number().min(0),
  })).optional(),
});

// Challenge schema
export const ChallengeSchema = z.object({
  id: z.string(),
  challengerId: z.string().nullable(),
  challengedId: z.string().nullable(),
  leagueId: z.string().nullable(),
  status: ChallengeStatusSchema.nullable(),
  proposedSlots: z.array(TimeSlotSchema).nullable(),
  selectedSlot: z.string().datetime().nullable(),
  acceptedAt: z.string().datetime().nullable(),
  respondedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  rejectionReason: z.string().nullable(),
  matchScores: MatchScoreSchema.nullable(),
  scoreSubmittedBy: z.string().nullable(),
  scoreSubmittedAt: z.string().datetime().nullable(),
  winnerId: z.string().nullable(),
  createdAt: z.string().datetime().nullable(),
});

export const ChallengeInsertSchema = ChallengeSchema.omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
  respondedAt: true,
  completedAt: true,
  scoreSubmittedAt: true,
}).extend({
  id: z.string().optional(),
  createdAt: z.string().datetime().nullable().optional(),
  acceptedAt: z.string().datetime().nullable().optional(),
  respondedAt: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  scoreSubmittedAt: z.string().datetime().nullable().optional(),
});

export const ChallengeUpdateSchema = ChallengeSchema.partial().extend({
  id: z.string(),
});

// Create challenge form schema
export const CreateChallengeFormSchema = z.object({
  challengedId: z.string().min(1, "Please select an opponent"),
  proposedSlots: z.array(TimeSlotSchema).min(1, "Please propose at least one time slot"),
  message: z.string().optional(),
});

// Respond to challenge schema
export const RespondToChallengeSchema = z.object({
  action: z.enum(["accept", "reject"]),
  selectedSlot: z.string().datetime().optional(),
  rejectionReason: z.string().optional(),
}).refine((data) => {
  if (data.action === "accept" && !data.selectedSlot) {
    return false;
  }
  if (data.action === "reject" && !data.rejectionReason) {
    return false;
  }
  return true;
}, {
  message: "Selected slot is required when accepting, rejection reason is required when rejecting",
  path: ["selectedSlot"],
});

// Submit score schema
export const SubmitScoreSchema = z.object({
  challengerScore: z.number().min(0, "Score must be 0 or greater"),
  challengedScore: z.number().min(0, "Score must be 0 or greater"),
  sets: z.array(z.object({
    challengerGames: z.number().min(0).max(7, "Games per set cannot exceed 7"),
    challengedGames: z.number().min(0).max(7, "Games per set cannot exceed 7"),
  })).optional(),
}).refine((data) => {
  // Ensure there's a winner
  return data.challengerScore !== data.challengedScore;
}, {
  message: "Match cannot end in a tie",
  path: ["challengerScore"],
});

// Challenge with details schema (for display)
export const ChallengeWithDetailsSchema = ChallengeSchema.extend({
  challenger: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    image: z.string().nullable(),
  }).nullable(),
  challenged: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    image: z.string().nullable(),
  }).nullable(),
  league: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable(),
  winner: z.object({
    id: z.string(),
    name: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  }).nullable(),
  scoreSubmitter: z.object({
    id: z.string(),
    name: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  }).nullable(),
});

// Activity filter schema
export const ChallengeFilterSchema = z.object({
  status: ChallengeStatusSchema.optional(),
  leagueId: z.string().optional(),
  userId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Type exports
export type ChallengeStatus = z.infer<typeof ChallengeStatusSchema>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type MatchScore = z.infer<typeof MatchScoreSchema>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type ChallengeInsert = z.infer<typeof ChallengeInsertSchema>;
export type ChallengeUpdate = z.infer<typeof ChallengeUpdateSchema>;
export type CreateChallengeForm = z.infer<typeof CreateChallengeFormSchema>;
export type RespondToChallenge = z.infer<typeof RespondToChallengeSchema>;
export type SubmitScore = z.infer<typeof SubmitScoreSchema>;
export type ChallengeWithDetails = z.infer<typeof ChallengeWithDetailsSchema>;
export type ChallengeFilter = z.infer<typeof ChallengeFilterSchema>; 