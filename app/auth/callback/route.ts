// @ts-nocheck
import { handleAuth } from "@workos-inc/authkit-nextjs";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const pendingLeagueCode = cookieStore.get("pending_league_code");

  return handleAuth({
    onSuccess: async ({ user }) => {
      const supabase = createClient();

      // Sync user with Supabase
      const { data: dbUser } = await (await supabase)
        .from("users")
        .upsert(
          {
            workos_user_id: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "workos_user_id",
          },
        )
        .select("id, profile_completed")
        .single();

      // Check if profile is complete
      if (!dbUser?.profile_completed) {
        // Keep the pending league code for after profile completion
        return { returnPathname: "/complete-profile" };
      }

      // Profile is complete, proceed with original logic
      let returnPath = "/";
      if (pendingLeagueCode?.value) {
        returnPath = `/join/${pendingLeagueCode.value}`;
        // Clear the cookie only when consuming it
        cookieStore.delete("pending_league_code");
      }

      return { returnPathname: returnPath };
    },
  })(request);
}