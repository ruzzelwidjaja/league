import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leagueId, skillTier } = await request.json();
  const supabase = createClient();

  // Get user from database
  const { data: dbUser } = await (await supabase)
    .from("users")
    .select("id")
    .eq("workos_user_id", user.id)
    .single();

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get current member count
  const { count } = await (await supabase)
    .from("league_members")
    .select("*", { count: "exact", head: true })
    .eq("league_id", leagueId);

  // Add user to league
  const { error } = await (await supabase).from("league_members").insert({
    league_id: leagueId,
    user_id: dbUser.id,
    rank: (count || 0) + 1,
    skill_tier: skillTier,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
