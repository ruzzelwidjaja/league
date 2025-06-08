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

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Check if user is in any league using direct database query
    // Since we migrated to Better Auth schema, we query the user table directly
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query(`
      SELECT l."joinCode" 
      FROM leagues l
      JOIN league_members lm ON l.id = lm."leagueId"
      WHERE lm."userId" = $1
      LIMIT 1
    `, [userId]);

    await pool.end();

    if (result.rows.length > 0) {
      return NextResponse.json({
        inLeague: true,
        leagueCode: result.rows[0].joinCode
      });
    }

    return NextResponse.json({
      inLeague: false,
      leagueCode: null
    });

  } catch (error) {
    console.error("Error checking user league status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 