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
      SELECT id FROM leagues WHERE "joinCode" = $1
    `, [code]);

    await pool.end();

    return NextResponse.json({ exists: result.rows.length > 0 });

  } catch (error) {
    console.error("Error checking league:", error);
    return NextResponse.json({ exists: false });
  }
}
