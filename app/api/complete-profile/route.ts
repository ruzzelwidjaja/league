// app/api/complete-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { createClient } from "@/lib/supabase/server";
import { isValidPhoneNumber } from "libphonenumber-js";

export async function POST(request: NextRequest) {
  try {
    const { user } = await withAuth();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { firstName, lastName, phoneNumber } = await request.json();

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

    const supabase = createClient();

    // Update user profile - store full international format
    const { error } = await (await supabase)
      .from("users")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber, // Store full international format
        profile_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("workos_user_id", user.id);

    if (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in complete-profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}