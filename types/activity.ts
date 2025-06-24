import { z } from "zod";

// Activity log action enum
export const ActivityActionSchema = z.enum([
  "user_joined_league",
  "user_left_league",
  "challenge_created",
  "challenge_accepted",
  "challenge_rejected",
  "challenge_completed",
  "challenge_cancelled",
  "match_score_submitted",
  "rank_updated",
  "profile_updated",
  "league_created",
  "out_of_town_added",
  "out_of_town_removed",
]);

// Activity log schema
export const ActivityLogSchema = z.object({
  id: z.string(),
  action: ActivityActionSchema,
  userId: z.string().nullable(),
  relatedUserId: z.string().nullable(),
  leagueId: z.string().nullable(),
  metadata: z.record(z.any()).nullable(), // JSON object for additional data
  createdAt: z.string().datetime().nullable(),
});

export const ActivityLogInsertSchema = ActivityLogSchema.omit({
  id: true,
  createdAt: true
}).extend({
  id: z.string().optional(),
  createdAt: z.string().datetime().nullable().optional(),
});

export const ActivityLogUpdateSchema = ActivityLogSchema.partial().extend({
  id: z.string(),
});

// Activity log with details schema (for display)
export const ActivityLogWithDetailsSchema = ActivityLogSchema.extend({
  actorUser: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    image: z.string().nullable(),
  }),
  targetUser: z.object({
    id: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    image: z.string().nullable(),
  }).nullable(),
  league: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable(),
});

// Out of town period schema
export const OutOfTownPeriodSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  leagueId: z.string().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  createdAt: z.string().datetime().nullable(),
});

export const OutOfTownPeriodInsertSchema = OutOfTownPeriodSchema.omit({
  id: true,
  createdAt: true
}).extend({
  id: z.string().optional(),
  createdAt: z.string().datetime().nullable().optional(),
});

export const OutOfTownPeriodUpdateSchema = OutOfTownPeriodSchema.partial().extend({
  id: z.string(),
});

// Create out of town period form schema
export const CreateOutOfTownFormSchema = z.object({
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
  leagueId: z.string().min(1, "Please select a league"),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine((data) => new Date(data.startDate) >= new Date(), {
  message: "Start date cannot be in the past",
  path: ["startDate"],
});

// Activity filter schema
export const ActivityFilterSchema = z.object({
  action: ActivityActionSchema.optional(),
  userId: z.string().optional(),
  leagueId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Out of town filter schema
export const OutOfTownFilterSchema = z.object({
  userId: z.string().optional(),
  leagueId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  active: z.boolean().optional(), // Filter for currently active periods
  upcoming: z.boolean().optional(), // Filter for upcoming periods
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Availability schema (for user profile)
export const AvailabilitySchema = z.object({
  monday: z.object({
    available: z.boolean(),
    timeSlots: z.array(z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })).optional(),
  }),
  tuesday: z.object({
    available: z.boolean(),
    timeSlots: z.array(z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })).optional(),
  }),
  wednesday: z.object({
    available: z.boolean(),
    timeSlots: z.array(z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })).optional(),
  }),
  thursday: z.object({
    available: z.boolean(),
    timeSlots: z.array(z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })).optional(),
  }),
  friday: z.object({
    available: z.boolean(),
    timeSlots: z.array(z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })).optional(),
  }),
  saturday: z.object({
    available: z.boolean(),
    timeSlots: z.array(z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })).optional(),
  }),
  sunday: z.object({
    available: z.boolean(),
    timeSlots: z.array(z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    })).optional(),
  }),
});

// Type exports
export type ActivityAction = z.infer<typeof ActivityActionSchema>;
export type ActivityLog = z.infer<typeof ActivityLogSchema>;
export type ActivityLogInsert = z.infer<typeof ActivityLogInsertSchema>;
export type ActivityLogUpdate = z.infer<typeof ActivityLogUpdateSchema>;
export type ActivityLogWithDetails = z.infer<typeof ActivityLogWithDetailsSchema>;
export type OutOfTownPeriod = z.infer<typeof OutOfTownPeriodSchema>;
export type OutOfTownPeriodInsert = z.infer<typeof OutOfTownPeriodInsertSchema>;
export type OutOfTownPeriodUpdate = z.infer<typeof OutOfTownPeriodUpdateSchema>;
export type CreateOutOfTownForm = z.infer<typeof CreateOutOfTownFormSchema>;
export type ActivityFilter = z.infer<typeof ActivityFilterSchema>;
export type OutOfTownFilter = z.infer<typeof OutOfTownFilterSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>; 