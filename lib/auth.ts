import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('database url', process.env.DATABASE_URL)

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
        const result = await resend.emails.send({
          from: 'ping_pong_league@ruzzel.me',
          to: user.email,
          subject: 'Verify your email',
          html: `
            <p>Welcome to the Ping Pong League!</p>
            <p>Click <a href="${url}">here</a> to verify your email.</p>`,
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
    redirectTo: "/", // This is where users go after verification
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
      profileCompleted: {
        type: "boolean",
        defaultValue: false,
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