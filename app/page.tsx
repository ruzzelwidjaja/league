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
        <div className="max-w-md w-full">
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
          <div className="mt-8 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
            <p className="text-sm text-neutral-600 leading-relaxed">
              <span className="font-medium">Don&apos;t have a code?</span><br />
              Visit the front desk at WeWork or scan the QR code posted in the building&apos;s ping pong area to get your league access code.
            </p>
          </div>

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
        </div>
      </main>
    );
  }

  // User is not logged in - show landing page
  const signInUrl = await getSignInUrl();
  const signUpUrl = await getSignUpUrl();

  return (
    <main className="relative overflow-hidden px-6 py-8 min-h-svh flex items-center">
      <div className="mx-auto max-w-4xl w-full">
        {/* Logo */}
        <div className="mb-8">
          <PiPingPongFill className="w-8 h-8 text-neutral-600" />
        </div>

        {/* Main heading */}
        <h1 className="mb-6 text-4xl font-medium tracking-tight text-neutral-800 sm:text-5xl">
          Ping Pong League
          <span className="text-neutral-500 text-2xl sm:text-3xl font-normal ml-1"> @WeWork</span>
        </h1>

        {/* Description */}
        <p className="mb-10 max-w-lg text-lg text-neutral-600 leading-relaxed">
          A simple ladder system for ping pong enthusiasts.
          Challenge colleagues and track your progress.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group px-8 py-4 text-base font-medium transition-all duration-300"
          >
            <Link href={signUpUrl}>
              Join the League
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8 py-4 text-base font-medium border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-300"
          >
            <Link href={signInUrl}>
              Already a Player?
            </Link>
          </Button>
        </div>
      </div>

      {/* Subtle background decoration */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-neutral-100/40 to-stone-100/40 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-stone-100/40 to-neutral-100/40 blur-3xl"></div>
    </main>
  );
}