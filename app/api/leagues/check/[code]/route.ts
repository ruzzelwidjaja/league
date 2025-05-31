import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  context: { params: { code: string } },
) {
  const { code } = await context.params;
  const supabase = createClient();

  const { data: league } = await (await supabase)
    .from("leagues")
    .select("id")
    .eq("join_code", code)
    .single();

  return NextResponse.json({ exists: !!league });
}
