import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { Resend } from "resend";
import { createVerificationEmailHtml } from "./email/templates/verification-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        console.log('Attempting to send verification email to:', user.email);

        // Create professional email template
        const firstName = user.name?.split(' ')[0] || 'there';
        const emailHtml = createVerificationEmailHtml({
          userEmail: user.email,
          verificationUrl: url,
          userName: firstName,
        });

        const result = await resend.emails.send({
          from: 'league@ruzzel.me',
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
      availability: {
        type: "string",
        required: false,
      },
      profilePictureUrl: {
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