import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

// Delete old profile picture from storage
async function deleteOldProfilePicture(oldUrl: string): Promise<void> {
  try {
    if (!oldUrl) return;

    const supabase = await createClient();
    // Extract file path from URL
    const urlParts = oldUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (fileName && fileName !== 'undefined') {
      const { error } = await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting old profile picture:', error);
      } else {
        console.log('Old profile picture deleted:', fileName);
      }
    }
  } catch (error) {
    console.error('Failed to delete old profile picture:', error);
  }
}

// Upload file to Supabase Storage
async function uploadProfilePicture(file: File, userId: string, oldProfileUrl?: string): Promise<string | null> {
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

    // Delete old profile picture after successful upload
    if (oldProfileUrl) {
      await deleteOldProfilePicture(oldProfileUrl);
    }

    return publicUrl;
  } catch (error) {
    console.error('File upload failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get current profile picture URL for deletion
    let oldProfilePictureUrl: string | undefined = undefined;
    const { Pool: PostgresPool } = await import("pg");
    const profilePool = new PostgresPool({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      const currentUserResult = await profilePool.query(`
        SELECT "profilePictureUrl" FROM "user" WHERE id = $1
      `, [session.user.id]);

      if (currentUserResult.rows.length > 0) {
        oldProfilePictureUrl = currentUserResult.rows[0].profilePictureUrl || undefined;
      }
    } catch (error) {
      console.error('Error getting current profile picture:', error);
    }

    // Handle profile picture upload
    if (profilePicture && profilePicture.size > 0) {
      // Validate file size (5MB limit)
      if (profilePicture.size > 5 * 1024 * 1024) {
        await profilePool.end();
        return NextResponse.json(
          { error: "File size must be less than 5MB" },
          { status: 400 }
        );
      }

      // Validate file type
      if (!profilePicture.type.startsWith('image/')) {
        await profilePool.end();
        return NextResponse.json(
          { error: "Please select an image file" },
          { status: 400 }
        );
      }

      profilePictureUrl = await uploadProfilePicture(profilePicture, session.user.id, oldProfilePictureUrl);

      if (!profilePictureUrl) {
        await profilePool.end();
        return NextResponse.json(
          { error: "Failed to upload profile picture" },
          { status: 500 }
        );
      }
    }

    await profilePool.end();

    // Update user in Better Auth database using direct query
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const updateFields = [
      '"firstName" = $1',
      '"lastName" = $2',
      '"organizationName" = $3',
      '"phoneNumber" = $4',
      '"updatedAt" = NOW()'
    ];
    const updateValues = [
      firstName.trim(),
      lastName.trim(),
      organizationName?.trim() || null,
      phoneNumber || null
    ];

    if (profilePictureUrl) {
      updateFields.push('"profilePictureUrl" = $5');
      updateValues.push(profilePictureUrl);
    }

    await pool.query(`
      UPDATE "user" 
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length + 1}
    `, [...updateValues, session.user.id]);

    await pool.end();

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