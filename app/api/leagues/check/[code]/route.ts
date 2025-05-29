import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } },
) {
  const { code } = await params;
  const supabase = createClient();

  const { data: league } = await (await supabase)
    .from("leagues")
    .select("id")
    .eq("join_code", code)
    .single();

  return NextResponse.json({ exists: !!league });
}
