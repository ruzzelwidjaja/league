import { z } from "zod";

// User schema based on Better Auth + additional fields
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Additional fields
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phoneNumber: z.string().nullable(),

  organizationName: z.string().nullable(),
  availability: z.record(z.any()).nullable(), // JSON object
  profilePictureUrl: z.string().url().nullable(),
});

export const UserInsertSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  id: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  emailVerified: z.boolean().optional(),

});

export const UserUpdateSchema = UserSchema.partial().extend({
  id: z.string(),
});

// Session schema
export const SessionSchema = z.object({
  id: z.string(),
  expiresAt: z.string().datetime(),
  token: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: z.string(),
});

// Account schema (for social providers)
export const AccountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  idToken: z.string().nullable(),
  accessTokenExpiresAt: z.string().datetime().nullable(),
  refreshTokenExpiresAt: z.string().datetime().nullable(),
  scope: z.string().nullable(),
  password: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Sign up form schema
export const SignUpFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Sign in form schema
export const SignInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Profile update schema
export const ProfileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phoneNumber: z.string().nullable().optional(),
  organizationName: z.string().nullable().optional(),
  availability: z.record(z.any()).nullable().optional(),
  profilePictureUrl: z.string().url().nullable().optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type UserInsert = z.infer<typeof UserInsertSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type SignUpForm = z.infer<typeof SignUpFormSchema>;
export type SignInForm = z.infer<typeof SignInFormSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>; 