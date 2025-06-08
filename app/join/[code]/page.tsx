"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { HiOutlineQrCode } from "react-icons/hi2";
import JoinLeagueForm from "./JoinLeagueForm";
import * as motion from "motion/react-client";
import Link from "next/link";

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

export default function JoinLeaguePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { data: session, isPending } = useSession();
  const [league, setLeague] = useState<League | null>(null);
  const [isLoadingLeague, setIsLoadingLeague] = useState(true);

  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  const hasMembershipChecked = React.useRef(false);

  // Check if league exists
  useEffect(() => {
    const checkLeague = async () => {
      try {
        const response = await fetch(`/api/leagues/check/${code}`);
        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            // Get league details
            const leagueResponse = await fetch(`/api/leagues/details/${code}`);
            if (leagueResponse.ok) {
              const leagueData = await leagueResponse.json();
              setLeague(leagueData);
            }
          }
        }
      } catch (error) {
        console.error("Error checking league:", error);
      } finally {
        setIsLoadingLeague(false);
      }
    };

    checkLeague();
  }, [code]);

  // Check if user is already a member when they're authenticated (only once)
  useEffect(() => {
    const checkMembership = async () => {
      if (session?.user && league && !isCheckingMembership && !hasMembershipChecked.current) {
        hasMembershipChecked.current = true;
        setIsCheckingMembership(true);
        try {
          const response = await fetch(`/api/leagues/membership?userId=${session.user.id}&leagueId=${league.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.isMember) {
              // Redirect to league page
              router.push(`/league/${code}`);
            }
          }
        } catch (error) {
          console.error("Error checking membership:", error);
        } finally {
          setIsCheckingMembership(false);
        }
      }
    };

    checkMembership();
  }, [session?.user, league, code, router]);

  // Loading states
  if (isPending || isLoadingLeague || isCheckingMembership) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <div className="h-20 w-20 border-8 border-border-200 text-secondary inline-block animate-spin rounded-full border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
      </div>
    );
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

  // User not authenticated - show invitation page
  if (!session?.user) {
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
            <Button
              asChild
              size="lg"
              className="w-full"
              onClick={() => {
                // Store league code for post-verification redirect
                localStorage.setItem('pendingLeagueCode', code);
              }}
            >
              <Link href={`/auth/signup?league=${code}`}>
                Sign Up to Join
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href={`/auth/signin?league=${code}`}>
                Already have an account? Sign In
              </Link>
            </Button>
          </div>

          {/* League Info */}
          <p className="text-sm text-neutral-400 mt-6">
            League code: <span className="font-mono text-neutral-600">{code}</span>
          </p>
        </motion.div>
      </main>
    );
  }

  // Since we now collect all profile info during signup, we don't need profile completion check
  // Remove the profile completion check entirely

  // User is authenticated and profile is complete - show join form
  return <JoinLeagueForm league={league} />;
}
