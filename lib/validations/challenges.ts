import { z } from 'zod'

// Base schemas matching your database
export const challengeStatusSchema = z.enum([
  'pending', 'accepted', 'completed', 'rejected', 'expired', 'withdrawn', 'cancelled'
])

export const rejectionReasonSchema = z.enum(['declined', 'rankDifference'])

export const activityActionSchema = z.enum([
  'challengeSent', 'challengeAccepted', 'challengeRejected', 
  'challengeExpired', 'challengeWithdrawn', 'matchCompleted',
  'rankSwap', 'rankPenalty', 'wentOot', 'returnedFromOot', 'joinedLeague'
])

export const leagueMemberStatusSchema = z.enum(['active', 'oot', 'inactive'])

// Time slot schema for proposedSlots jsonb field
export const timeSlotSchema = z.object({
  id: z.string(),
  date: z.string(),
  day: z.string(),
  slot: z.string()
})

// Challenge creation schema
export const createChallengeSchema = z.object({
  challengedId: z.string().min(1, 'Challenged user ID is required'),
  leagueId: z.string().uuid('Invalid league ID'),
  proposedSlots: z.array(timeSlotSchema)
    .min(1, 'At least one time slot must be proposed')
    .max(10, 'Maximum 10 time slots allowed')
})

// Challenge acceptance schema
export const acceptChallengeSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  selectedSlot: timeSlotSchema
})

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>
export type AcceptChallengeInput = z.infer<typeof acceptChallengeSchema>
export type TimeSlot = z.infer<typeof timeSlotSchema>