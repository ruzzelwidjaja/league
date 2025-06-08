import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leagueId, skillTier, availability } = await request.json();

    if (!leagueId || !skillTier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Check if user is already in the league
    const membershipCheck = await pool.query(`
      SELECT id FROM league_members 
      WHERE "userId" = $1 AND "leagueId" = $2
    `, [session.user.id, leagueId]);

    if (membershipCheck.rows.length > 0) {
      await pool.end();
      return NextResponse.json({ error: "Already a member of this league" }, { status: 400 });
    }

    // Get the next rank for this league
    const rankResult = await pool.query(`
      SELECT COALESCE(MAX(rank), 0) + 1 as next_rank 
      FROM league_members 
      WHERE "leagueId" = $1
    `, [leagueId]);

    const nextRank = rankResult.rows[0].next_rank;

    // Update user availability if provided
    if (availability) {
      await pool.query(`
        UPDATE "user" 
        SET availability = $1, "updatedAt" = NOW()
        WHERE id = $2
      `, [JSON.stringify(availability), session.user.id]);
    }

    // Add user to league
    await pool.query(`
      INSERT INTO league_members ("leagueId", "userId", rank, "skillTier", status, "joinedAt")
      VALUES ($1, $2, $3, $4, 'active', NOW())
    `, [leagueId, session.user.id, nextRank, skillTier]);

    // Log the activity
    await pool.query(`
      INSERT INTO activity_logs ("leagueId", "userId", action, metadata, "createdAt")
      VALUES ($1, $2, 'joinedLeague', $3, NOW())
    `, [leagueId, session.user.id, JSON.stringify({ skillTier, rank: nextRank })]);

    await pool.end();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error joining league:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
