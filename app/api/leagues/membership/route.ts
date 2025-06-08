import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get("userId");
    const leagueId = request.nextUrl.searchParams.get("leagueId");

    if (!userId || !leagueId) {
      return NextResponse.json({ error: "Missing userId or leagueId" }, { status: 400 });
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query(`
      SELECT id 
      FROM league_members 
      WHERE "userId" = $1 AND "leagueId" = $2
    `, [userId, leagueId]);

    await pool.end();

    return NextResponse.json({
      isMember: result.rows.length > 0
    });

  } catch (error) {
    console.error("Error checking league membership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 