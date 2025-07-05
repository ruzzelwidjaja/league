import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { Resend } from "resend";
import { createVerificationEmailHtml } from "../emails/verification-email";
import { createPasswordResetEmailHtml } from "../emails/password-reset-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://10.16.61.31:3000",
    "https://mocha.gg",
    "https://www.mocha.gg",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 4,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      try {
        console.log('Attempting to send password reset email to:', user.email);

        const firstName = user.name?.split(' ')[0] || 'there';

        // Use react-email template
        const emailHtml = await createPasswordResetEmailHtml({
          userEmail: user.email,
          resetUrl: url,
          userName: firstName,
        });

        const result = await resend.emails.send({
          from: 'league@mocha.gg',
          to: user.email,
          subject: 'Reset your password - Ping Pong League',
          html: emailHtml,
        });
        console.log('Password reset email sent successfully:', result);
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw error; // Re-throw so Better Auth knows it failed
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        console.log('Attempting to send verification email to:', user.email);

        // Create professional email template
        const firstName = user.name?.split(' ')[0] || 'there';
        const emailHtml = await createVerificationEmailHtml({
          userEmail: user.email,
          verificationUrl: url,
          userName: firstName,
        });

        const result = await resend.emails.send({
          from: 'league@mocha.gg',
          to: user.email,
          subject: 'Verify your email - Ping Pong League',
          html: emailHtml,
        });
        console.log('Email sent successfully:', result);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error; // Re-throw so Better Auth knows it failed
      }
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days (1 month)
    updateAge: 60 * 60 * 24, // 1 day (refresh session every day if user is active)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      organizationName: {
        type: "string",
        required: false,
      },
    },
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  }
});