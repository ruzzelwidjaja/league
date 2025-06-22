import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HiOutlineQrCode } from "react-icons/hi2";
import JoinLeagueForm from "./JoinLeagueForm";
import * as motion from "motion/react-client";
import Link from "next/link";
import { Pool } from "pg";

interface League {
  id: string;
  name: string;
  description: string | null;
  joinCode: string;
  createdAt: string | null;
  createdBy: string | null;
  seasonEnd: string;
  seasonStart: string;
}

export default async function JoinLeaguePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("Session in join page:", {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    isEmailVerified: session?.user?.emailVerified
  });

  // Check if league exists and get details
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  let league: League | null = null;

  try {
    const result = await pool.query(`
      SELECT id, name, description, "joinCode", 
             "seasonStart", "seasonEnd",
             "createdBy", "createdAt"
      FROM leagues 
      WHERE "joinCode" = $1
    `, [code]);

    if (result.rows.length > 0) {
      league = result.rows[0];
    }
  } catch (error) {
    console.error("Error checking league:", error);
  } finally {
    await pool.end();
  }

  // League not found
  if (!league) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Invalid League Code
          </h1>
          <p className="text-neutral-600 mb-6">
            The league code &quot;{code}&quot; is not valid or has expired.
          </p>
          <Button asChild>
            <Link href="/">
              Go Home
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  // Check if user is authenticated and verified
  if (session && session.user) {
    if (!session.user.emailVerified) {
      redirect('/auth/signin?message=Please verify your email first');
    }

    // Check if user is already a member
    const memberPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      const membershipResult = await memberPool.query(`
        SELECT id 
        FROM league_members 
        WHERE "userId" = $1 AND "leagueId" = $2
      `, [session.user.id, league.id]);

      if (membershipResult.rows.length > 0) {
        redirect(`/league/${code}`);
      }
    } catch (error) {
      console.error("Error checking membership:", error);
    } finally {
      await memberPool.end();
    }

    // User is authenticated and not a member - show join form
    return <JoinLeagueForm league={league} />;
  }

  // User not authenticated - show invitation page
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {/* QR Code Icon */}
        <div className="mb-8">
          <HiOutlineQrCode className="w-14 h-14 text-neutral-500 mx-auto" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-4 text-neutral-800">
          You&apos;re Invited!
        </h1>

        {/* Description */}
        <p className="text-lg text-neutral-600 mb-2">
          Join <span className="font-semibold">{league.name}</span>
        </p>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          Challenge your colleagues, climb the rankings, and become the office ping pong champion.
          Create your account to get started.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <form action={async () => {
            "use server";
            await import("@/lib/actions/auth").then(({ redirectToAuth }) =>
              redirectToAuth(code, 'signup')
            );
          }}>
            <Button
              type="submit"
              size="lg"
              className="w-full"
            >
              Sign Up to Join
            </Button>
          </form>

          <form action={async () => {
            "use server";
            await import("@/lib/actions/auth").then(({ redirectToAuth }) =>
              redirectToAuth(code, 'signin')
            );
          }}>
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full"
            >
              Already have an account? Sign In
            </Button>
          </form>
        </div>

        {/* League Info */}
        <p className="text-sm text-neutral-400 mt-6">
          League code: <span className="font-mono text-neutral-600">{code}</span>
        </p>
      </motion.div>
    </main>
  );
}
