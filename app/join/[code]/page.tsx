import React from "react";
import { redirect } from "next/navigation";
import { getSignUpUrl, withAuth } from "@workos-inc/authkit-nextjs";
import { createLeagueQueries, createUserQueries, createLeagueMemberQueries } from "@/lib/supabase/queries";
import JoinLeagueForm from "./JoinLeagueForm";
import { setLeagueCodeAndRedirect } from "./actions";

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
    // TODO: Find a way to set cookie & redirect to signup url without having to click the buttonn
    // Store the league code in a cookie for after auth
    // Create a hidden form that will be submitted automatically
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="mb-4">Please sign in to join this league</p>
          <form action={setLeagueCodeAndRedirect}>
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="redirectUrl" value={signUpUrl} />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Sign Up to Join
            </button>
          </form>
        </div>
      </div>
    );
    // const formData = new FormData();
    // formData.append('code', code);
    // formData.append('redirectUrl', signUpUrl);
    // await setLeagueCodeAndRedirect(formData);
    // redirect(signUpUrl);
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
