import { z } from "zod";

// League member role schema (?)
export const LeagueMemberRoleSchema = z.enum(["member", "admin", "owner"]);

// League schema
export const LeagueSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  joinCode: z.string(),
  seasonStart: z.string().datetime(),
  seasonEnd: z.string().datetime(),
  createdBy: z.string().nullable(),
  createdAt: z.string().datetime().nullable(),
});

export const LeagueInsertSchema = LeagueSchema.omit({
  id: true,
  createdAt: true
}).extend({
  id: z.string().optional(),
  createdAt: z.string().datetime().nullable().optional(),
});

export const LeagueUpdateSchema = LeagueSchema.partial().extend({
  id: z.string(),
});

// League member schema
export const LeagueMemberSchema = z.object({
  id: z.string(),
  leagueId: z.string().nullable(),
  userId: z.string().nullable(),
  rank: z.number(),
  skillTier: z.string(),
  status: z.string().nullable(),
  joinedAt: z.string().datetime().nullable(),
  previous_rank: z.number().nullable(),
  recentAcceptances: z.number().nullable(),
  recentRejections: z.number().nullable(),
  activityWindowStart: z.string().datetime().nullable(),
});

export const LeagueMemberInsertSchema = LeagueMemberSchema.omit({
  id: true,
  joinedAt: true,
  previous_rank: true,
  recentAcceptances: true,
  recentRejections: true,
  activityWindowStart: true,
}).extend({
  id: z.string().optional(),
  joinedAt: z.string().datetime().nullable().optional(),
  previous_rank: z.number().nullable().optional(),
  recentAcceptances: z.number().nullable().optional(),
  recentRejections: z.number().nullable().optional(),
  activityWindowStart: z.string().datetime().nullable().optional(),
});

export const LeagueMemberUpdateSchema = LeagueMemberSchema.partial().extend({
  id: z.string(),
});

// Create league form schema
export const CreateLeagueFormSchema = z.object({
  name: z.string().min(1, "League name is required"),
  description: z.string().optional(),
  seasonStart: z.string().datetime("Invalid start date"),
  seasonEnd: z.string().datetime("Invalid end date"),
}).refine((data) => new Date(data.seasonEnd) > new Date(data.seasonStart), {
  message: "Season end date must be after start date",
  path: ["seasonEnd"],
});

// Join league form schema
export const JoinLeagueFormSchema = z.object({
  joinCode: z.string().min(1, "Join code is required"),
  skillTier: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"], {
    required_error: "Please select a skill tier",
  }),
});

// Update rank schema
export const UpdateRankSchema = z.object({
  userId: z.string(),
  newRank: z.number().min(1, "Rank must be at least 1"),
});

// League standings schema (for display)
export const LeagueStandingsSchema = z.object({
  id: z.string(),
  rank: z.number(),
  previousRank: z.number().nullable(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    image: z.string().nullable(),
  }),
  skillTier: z.string(),
  wins: z.number(),
  losses: z.number(),
  winPercentage: z.number(),
  recentForm: z.array(z.enum(["W", "L"])),
});

// Type exports
export type League = z.infer<typeof LeagueSchema>;
export type LeagueInsert = z.infer<typeof LeagueInsertSchema>;
export type LeagueUpdate = z.infer<typeof LeagueUpdateSchema>;
export type LeagueMember = z.infer<typeof LeagueMemberSchema>;
export type LeagueMemberInsert = z.infer<typeof LeagueMemberInsertSchema>;
export type LeagueMemberUpdate = z.infer<typeof LeagueMemberUpdateSchema>;
export type CreateLeagueForm = z.infer<typeof CreateLeagueFormSchema>;
export type JoinLeagueForm = z.infer<typeof JoinLeagueFormSchema>;
export type UpdateRank = z.infer<typeof UpdateRankSchema>;
export type LeagueStandings = z.infer<typeof LeagueStandingsSchema>; 