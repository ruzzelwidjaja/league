// app/api/complete-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { createUserQueries } from "@/lib/supabase/queries";
import { isValidPhoneNumber } from "libphonenumber-js";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { user } = await withAuth();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, organizationName, phoneNumber } = await request.json();

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !phoneNumber?.trim()) {
      return NextResponse.json(
        { error: "First name, last name, and phone number are required" },
        { status: 400 }
      );
    }

    // Validate phone number format using libphonenumber-js
    if (!isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: "Please enter a valid mobile number" },
        { status: 400 }
      );
    }

    const userQueries = createUserQueries();

    // Update user profile using centralized query
    const success = await userQueries.completeProfile(user.id, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone_number: phoneNumber,
      organization_name: organizationName?.trim() || null,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Check for pending league code
    const cookieStore = await cookies();
    const pendingLeagueCode = cookieStore.get("pending_league_code");

    let redirectTo = "/";
    if (pendingLeagueCode?.value) {
      redirectTo = `/join/${pendingLeagueCode.value}`;
      // Clear the cookie now that we're using it
      cookieStore.delete("pending_league_code");
    }

    return NextResponse.json({ success: true, redirectTo });
  } catch (error) {
    console.error("Error in complete-profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}