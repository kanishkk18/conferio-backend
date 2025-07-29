import { z } from 'zod'
import { DayOfWeek, EventLocationType, IntegrationAppType } from '@prisma/client'

// Auth schemas
export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

// Event schemas
export const CreateEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  locationType: z.nativeEnum(EventLocationType),
})

export const EventIdSchema = z.object({
  eventId: z.string().cuid("Invalid event ID"),
})

export const UserNameSchema = z.object({
  username: z.string().min(1, "Username is required"),
})

export const UserNameAndSlugSchema = z.object({
  username: z.string().min(1, "Username is required"),
  slug: z.string().min(1, "Slug is required"),
})

// Availability schemas
export const DayAvailabilitySchema = z.object({
  day: z.nativeEnum(DayOfWeek),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  isAvailable: z.boolean(),
})

export const UpdateAvailabilitySchema = z.object({
  timeGap: z.number().min(1, "Time gap must be at least 1 minute"),
  days: z.array(DayAvailabilitySchema),
})

// Integration schemas
export const AppTypeSchema = z.object({
  appType: z.nativeEnum(IntegrationAppType),
})

// Meeting schemas
export const CreateMeetingSchema = z.object({
  eventId: z.string().cuid("Invalid event ID"),
  startTime: z.string().datetime("Invalid start time"),
  endTime: z.string().datetime("Invalid end time"),
  guestName: z.string().min(1, "Guest name is required"),
  guestEmail: z.string().email("Invalid email format"),
  additionalInfo: z.string().optional(),
})

export const MeetingIdSchema = z.object({
  meetingId: z.string().cuid("Invalid meeting ID"),
})

// Type exports
export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type CreateEventInput = z.infer<typeof CreateEventSchema>
export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilitySchema>
export type CreateMeetingInput = z.infer<typeof CreateMeetingSchema>