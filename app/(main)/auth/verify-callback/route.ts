import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLeagueCodeCookie, clearLeagueCodeCookie } from "@/lib/actions/auth";

export async function GET(request: NextRequest) {
  console.log("Verify callback route handler called");

  try {
    // Get the session to verify the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Check for pending league code cookie
    const leagueCode = await getLeagueCodeCookie();
    console.log("League code from cookie:", leagueCode);

    if (leagueCode) {
      // Clear the cookie and redirect to join page
      await clearLeagueCodeCookie();
      return NextResponse.redirect(new URL(`/join/${leagueCode}`, request.url));
    }

    // No league code, redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error in verify callback:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
} 