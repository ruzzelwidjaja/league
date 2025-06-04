import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { createUserQueries } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

// Validate Irish mobile number
function isValidIrishMobile(number: string): boolean {
  const digits = number.startsWith("+353")
    ? number.replace("+353", "")
    : number.replace(/\D/g, "");

  return Boolean(
    digits.match(/^(083|085|086|087|089)\d{7}$/) ||
    digits.match(/^8[3-9]\d{7}$/)
  );
}

// Upload file to Supabase Storage
async function uploadProfilePicture(file: File, userId: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Convert File to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('File upload failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await withAuth({ ensureSignedIn: true });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userQueries = createUserQueries();
    const dbUser = await userQueries.getUserByWorkosId(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const organizationName = formData.get('organizationName') as string;
    const phoneNumber = formData.get('phoneNumber') as string | null;
    const profilePicture = formData.get('profilePicture') as File | null;

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Validate phone number if provided
    if (phoneNumber && !isValidIrishMobile(phoneNumber)) {
      return NextResponse.json(
        { error: "Please enter a valid mobile number" },
        { status: 400 }
      );
    }

    let profilePictureUrl: string | null = null;

    // Handle profile picture upload
    if (profilePicture && profilePicture.size > 0) {
      // Validate file size (5MB limit)
      if (profilePicture.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size must be less than 5MB" },
          { status: 400 }
        );
      }

      // Validate file type
      if (!profilePicture.type.startsWith('image/')) {
        return NextResponse.json(
          { error: "Please select an image file" },
          { status: 400 }
        );
      }

      profilePictureUrl = await uploadProfilePicture(profilePicture, user.id);

      if (!profilePictureUrl) {
        return NextResponse.json(
          { error: "Failed to upload profile picture" },
          { status: 500 }
        );
      }
    }

    // Update user in database
    const updateData: Record<string, string | null> = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      organization_name: organizationName?.trim() || null,
      phone_number: phoneNumber || null,
    };

    if (profilePictureUrl) {
      updateData.profile_picture_url = profilePictureUrl;
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', dbUser.id);

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 