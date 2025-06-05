import React from "react";
import { redirect } from "next/navigation";
import { getSignUpUrl, withAuth } from "@workos-inc/authkit-nextjs";
import { createLeagueQueries, createUserQueries, createLeagueMemberQueries } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { HiOutlineQrCode } from "react-icons/hi2";
import JoinLeagueForm from "./JoinLeagueForm";
import { setLeagueCodeAndRedirect } from "./actions";
import * as motion from "motion/react-client";

export default async function JoinLeaguePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { user } = await withAuth();

  const leagueQueries = createLeagueQueries();
  const userQueries = createUserQueries();
  const leagueMemberQueries = createLeagueMemberQueries();

  // Check if league exists
  const league = await leagueQueries.getLeagueByCode(code);

  if (!league) {
    return <div>Invalid league code</div>;
  }

  if (!user) {
    const signUpUrl = await getSignUpUrl();
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
          {/* Mail Icon */}
          <div className="mb-8">
            <HiOutlineQrCode className="w-14 h-14 text-neutral-500 mx-auto" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold mb-4 text-neutral-800">
            You&apos;re Invited!
          </h1>

          {/* Description */}
          <p className="text-lg text-neutral-600 mb-2">
            Join the <span className="font-semibold">WeWork Ping Pong League</span>
          </p>
          <p className="text-neutral-500 mb-8 leading-relaxed">
            Challenge your colleagues, climb the rankings, and become the office ping pong champion.
            Create your account to get started.
          </p>

          {/* Sign Up Button */}
          <form action={setLeagueCodeAndRedirect}>
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="redirectUrl" value={signUpUrl} />
            <Button
              type="submit"
              size="lg"
              className="w-full px-8 py-4 text-base font-medium"
            >
              Sign Up to Join
            </Button>
          </form>

          {/* League Info */}
          <p className="text-sm text-neutral-400 mt-6">
            League code: <span className="font-mono text-neutral-600">{code}</span>
          </p>
        </motion.div>
      </main>
    );
  }

  const dbUser = await userQueries.getUserByWorkosId(user.id);

  if (!dbUser) {
    console.error("User not found in database");
  }

  // Check if profile is completed - redirect if not
  if (dbUser && !dbUser.profile_completed) {
    redirect("/complete-profile");
  }

  // User is authenticated, check if already in league
  const isAlreadyMember = dbUser ? await leagueMemberQueries.isUserInLeague(dbUser.id, league.id) : false;

  console.log("membership--->", isAlreadyMember);
  if (isAlreadyMember) {
    redirect(`/league/${code}`);
  }

  // Show join confirmation page
  return <JoinLeagueForm league={league} />;
}
