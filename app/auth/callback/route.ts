import { handleAuth } from "@workos-inc/authkit-nextjs";
import { createUserQueries } from "@/lib/supabase/queries";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const pendingLeagueCode = cookieStore.get("pending_league_code");

  // Determine return path BEFORE calling handleAuth
  let returnPath = "/";

  // We need to check if the user will need to complete their profile
  // But we can't check that until after auth, so we'll handle it differently
  if (pendingLeagueCode?.value) {
    returnPath = `/join/${pendingLeagueCode.value}`;
  }

  return handleAuth({
    returnPathname: returnPath, // This is the correct way to set the return path
    onSuccess: async ({ user }) => {
      // Sync user with Supabase using centralized query
      const userQueries = createUserQueries();
      const dbUser = await userQueries.upsertUser({
        workos_user_id: user.id,
        email: user.email,
        first_name: user.firstName || undefined,
        last_name: user.lastName || undefined,
        profile_picture_url: user.profilePictureUrl || undefined,
      });

      // Don't clear the cookie here if profile is not completed
      // We'll need it after they complete their profile
      if (dbUser?.profile_completed && pendingLeagueCode) {
        cookieStore.delete("pending_league_code");
      }
    },
  })(request);
}