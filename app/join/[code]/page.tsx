import React from "react";
import { redirect } from "next/navigation";
import { getSignUpUrl, withAuth } from "@workos-inc/authkit-nextjs";
import { createClient } from "@/lib/supabase/server";
import JoinLeagueForm from "./JoinLeagueForm";
import { setLeagueCodeAndRedirect } from "./actions";

export default async function JoinLeaguePage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = await params;
  const { user } = await withAuth();
  const supabase = createClient();

  // Check if league exists
  const { data: league, error: leagueError } = await (await supabase)
    .from("leagues")
    .select("*")
    .eq("join_code", code)
    .single();

  if (leagueError) {
    console.error("Error fetching league:", leagueError);
  }

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

  const { data: dbUser, error: dbUserError } = await (await supabase)
    .from("users")
    .select("id, profile_completed")
    .eq("workos_user_id", user.id)
    .single();

  if (dbUserError) {
    console.error("Error fetching dbUser:", dbUserError);
  }

  if (!dbUser) {
    console.error("User not found in database");
  }

  // Check if profile is completed - redirect if not
  if (dbUser && !dbUser.profile_completed) {
    redirect("/complete-profile");
  }

  // User is authenticated, check if already in league
  const { data: membership } = await (await supabase)
    .from("league_members")
    .select("*")
    .eq("league_id", league.id)
    .eq("user_id", dbUser?.id)
    .single();

  console.log("membership--->", membership);
  if (membership) {
    redirect(`/league/${code}`);
  }

  // Show join confirmation page
  return <JoinLeagueForm league={league} />;
}
