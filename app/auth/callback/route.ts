import { handleAuth } from "@workos-inc/authkit-nextjs";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const pendingLeagueCode = cookieStore.get("pending_league_code");

  // Determine where to redirect after auth
  let returnPath = "/";
  if (pendingLeagueCode?.value) {
    returnPath = `/join/${pendingLeagueCode.value}`;
  }

  return handleAuth({
    returnPathname: returnPath, // Dynamic return path!
    onSuccess: async ({ user }) => {
      const supabase = createClient();

      // Sync user with Supabase
      await (
        await supabase
      )
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
        .select("id")
        .single();

      // Clear the cookie after successful auth
      if (pendingLeagueCode) {
        cookieStore.delete("pending_league_code");
      }
    },
  })(request);
}
