import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params;

    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query(`
      SELECT id, name, description, "joinCode", 
             "seasonStart", "seasonEnd",
             "createdBy", "createdAt"
      FROM leagues 
      WHERE "joinCode" = $1
    `, [code]);

    await pool.end();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("Error fetching league details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 