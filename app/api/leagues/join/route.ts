import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { createUserQueries, createLeagueMemberQueries } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leagueId, skillTier } = await request.json();

  const userQueries = createUserQueries();
  const leagueMemberQueries = createLeagueMemberQueries();

  // Get user from database
  const dbUser = await userQueries.getUserByWorkosId(user.id);

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if user is already in the league
  const isAlreadyMember = await leagueMemberQueries.isUserInLeague(dbUser.id, leagueId);
  if (isAlreadyMember) {
    return NextResponse.json({ error: "Already a member of this league" }, { status: 400 });
  }

  // Add user to league using centralized query
  const membership = await leagueMemberQueries.joinLeague(dbUser.id, leagueId, skillTier || 'bottom');

  if (!membership) {
    return NextResponse.json({ error: "Failed to join league" }, { status: 500 });
  }

  // Update skill tier if provided
  if (skillTier && skillTier !== 'bottom') {
    const success = await leagueMemberQueries.updateMemberSkillTier(dbUser.id, leagueId, skillTier);
    if (!success) {
      console.error("Failed to update skill tier, but membership was created");
    }
  }

  return NextResponse.json({ success: true });
}
