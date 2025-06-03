import { NextRequest, NextResponse } from "next/server";
import { createLeagueQueries } from "@/lib/supabase/queries";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const leagueQueries = createLeagueQueries();

  const exists = await leagueQueries.leagueExists(code);

  return NextResponse.json({ exists });
}
