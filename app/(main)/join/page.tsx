"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { HiHashtag } from "react-icons/hi";
import JoinLeagueInput from "@/components/JoinLeagueInput";
import { InfoBox } from "@/components/ui/info-box";
import * as motion from "motion/react-client";
import { useRouter } from "next/navigation";

// Helper function to check if user is in a league
async function checkUserLeague(userId: string) {
  try {
    const response = await fetch(`/api/user/league-status?userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      return data.leagueCode;
    }
  } catch (error) {
    console.error("Error checking user league:", error);
  }
  return null;
}

export default function JoinPage() {
  const { data: session, isPending } = useSession();
  const [isCheckingLeague, setIsCheckingLeague] = useState(false);
  const router = useRouter();
  const hasChecked = React.useRef(false);

  // Check if authenticated user is in a league (only once per session)
  useEffect(() => {
    if (session?.user && !isCheckingLeague && !hasChecked.current) {
      // Check if email is verified first
      if (!session.user.emailVerified) {
        // Redirect to sign-in with message about email verification
        router.replace('/auth/signin?message=Please check your email and verify your account');
        return;
      }
      hasChecked.current = true;
      setIsCheckingLeague(true);

      // Check if user is already in a league
      checkUserLeague(session.user.id)
        .then((leagueCode) => {
          if (leagueCode) {
            // User is already in a league, redirect to their league
            router.replace(`/league/${leagueCode}`);
          } else {
            setIsCheckingLeague(false);
          }
        })
        .catch(() => setIsCheckingLeague(false));
    }
  }, [session?.user, router]);

  // Show loading state while checking session or league
  if (isPending || isCheckingLeague || (session?.user && !hasChecked.current)) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background">
        {/* Loading animation could go here */}
      </div>
    );
  }

  // If no session, redirect to signin (this should be handled by middleware, but just in case)
  if (!session?.user) {
    router.replace('/auth/signin');
    return null;
  }

  // User is authenticated, verified, and not in a league - show join form
  return (
    <main className="min-h-svh flex items-center justify-center p-8">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {/* Hash Icon */}
        <div className="mb-8 text-center">
          <HiHashtag className="w-14 h-14 text-neutral-500 mx-auto" />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-neutral-800">
            Enter League Code
          </h1>
          <p className="text-neutral-600">
            Enter the code provided by your league administrator
          </p>
        </div>

        <JoinLeagueInput />

        {/* Info Box */}
        <InfoBox title="Don't have a code?" className="mt-8">
          Visit the front desk at WeWork or scan the QR code posted in the building&apos;s ping pong area to get your league access code.
        </InfoBox>

        <div className="mt-6 text-center">
          <Link
            href="/auth/signin"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Sign Out
          </Link>
        </div>
      </motion.div>
    </main>
  );
} 