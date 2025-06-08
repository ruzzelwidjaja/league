"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PiPingPongFill } from "react-icons/pi";
import { HiHashtag } from "react-icons/hi";
import JoinLeagueInput from "@/components/JoinLeagueInput";
import { InfoBox } from "@/components/ui/info-box";
import * as motion from "motion/react-client";

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

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const [isCheckingLeague, setIsCheckingLeague] = useState(false);
  const hasChecked = React.useRef(false);

  // Check if authenticated user is in a league (only once per session)
  useEffect(() => {
    if (session?.user && !isCheckingLeague && !hasChecked.current) {
      hasChecked.current = true;
      setIsCheckingLeague(true);

      // First check if there's a pending league code from sign-up flow
      const pendingLeagueCode = localStorage.getItem('pendingLeagueCode');
      if (pendingLeagueCode) {
        localStorage.removeItem('pendingLeagueCode');
        // Use router.replace for faster navigation
        window.location.replace(`/join/${pendingLeagueCode}`);
        return;
      }

      // Then check if user is already in a league
      checkUserLeague(session.user.id)
        .then((leagueCode) => {
          if (leagueCode) {
            // Use router.replace for faster navigation
            window.location.replace(`/league/${leagueCode}`);
          } else {
            setIsCheckingLeague(false);
          }
        })
        .catch(() => setIsCheckingLeague(false));
    }
  }, [session?.user]);

  // Show blank page while checking league
  if (isCheckingLeague) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background">
      </div>
    );
  }

  // Loading state - show for any loading condition
  if (isPending || isCheckingLeague || (session?.user && !hasChecked.current)) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        {/* <div className="h-20 w-20 border-8 border-border-200 text-secondary inline-block animate-spin rounded-full border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div> */}
      </div>
    );
  }

  // User is authenticated but not in a league
  if (session?.user) {
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

  // User is not authenticated - show landing page
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.1
      }
    }
  };

  return (
    <motion.main
      className="relative overflow-hidden px-6 py-8 min-h-svh flex items-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto max-w-4xl w-full">
        {/* Logo */}
        <motion.div className="mb-8" variants={itemVariants}>
          <PiPingPongFill className="w-8 h-8 text-neutral-600" />
        </motion.div>

        {/* Main heading */}
        <motion.h1
          className="mb-6 text-4xl font-medium tracking-tight text-neutral-800 sm:text-5xl"
          variants={itemVariants}
        >
          Ping Pong League
          <span className="text-neutral-500 text-2xl sm:text-3xl font-normal ml-1"> @WeWork</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mb-10 max-w-lg text-lg text-neutral-600 leading-relaxed"
          variants={itemVariants}
        >
          A simple ladder system for ping pong enthusiasts.
          Challenge colleagues and track your progress.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col gap-4 sm:flex-row"
          variants={containerVariants}
        >
          <motion.div variants={buttonVariants}>
            <Button
              asChild
              size="lg"
              className="group px-8 py-4 text-base font-medium transition-all duration-300 w-full sm:w-auto"
            >
              <Link href="/auth/signup">
                Join the League
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={buttonVariants}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 text-base font-medium border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-300 w-full sm:w-auto"
            >
              <Link href="/auth/signin">
                Already a Player?
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle background decoration */}
      <motion.div
        className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-neutral-100/40 to-stone-100/40 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-stone-100/40 to-neutral-100/40 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 1.0, ease: "easeOut" }}
      />
    </motion.main>
  );
}