import React from "react";
import Link from "next/link";
import {
  withAuth,
  getSignInUrl,
  getSignUpUrl,
  signOut,
} from "@workos-inc/authkit-nextjs";
import { createUserQueries, createLeagueMemberQueries } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PiPingPongFill } from "react-icons/pi";
import { HiHashtag } from "react-icons/hi";
import JoinLeagueInput from "@/components/JoinLeagueInput";
import { InfoBox } from "@/components/ui/info-box";
import * as motion from "motion/react-client";

export default async function HomePage() {
  const { user } = await withAuth();
  console.log("user in root page-->", user);

  if (user) {
    // User is logged in, check if they're in a league
    const userQueries = createUserQueries();

    // Get user from database
    const dbUser = await userQueries.getUserByWorkosId(user.id);

    if (!dbUser) {
      console.error("Error fetching dbUser: User not found");
    }
    console.log("dbUser in root page-->", dbUser);

    // Check if profile is completed - redirect if not
    if (dbUser && !dbUser.profile_completed) {
      redirect("/complete-profile");
    }

    if (dbUser) {
      // Check if user is in any league
      const leagueMemberQueries = createLeagueMemberQueries();
      const membership = await leagueMemberQueries.getUserFirstLeague(dbUser.id);
      console.log("in root page, logged in");
      console.log("dbUser in root page-->", dbUser);
      console.log("membership in root page-->", membership);

      if (membership?.leagues) {
        // User is in a league, redirect to it
        redirect(`/league/${membership.leagues.join_code}`);
      }
    }

    // User is logged in but not in a league
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

          <form
            action={async () => {
              "use server";
              await signOut();
            }}
            className="mt-6 text-center"
          >
            <button
              type="submit"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Sign Out
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  // User is not logged in - show landing page with animations
  const signInUrl = await getSignInUrl();
  const signUpUrl = await getSignUpUrl();

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
        ease: [0.25, 0.46, 0.45, 0.94] // Custom cubic-bezier for smooth easing
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
              <Link href={signUpUrl}>
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
              <Link href={signInUrl}>
                Already a Player?
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle background decoration with delayed fade-in */}
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