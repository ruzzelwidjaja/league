import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    // Parse form data
    const formData = await request.formData();
    const profilePicture = formData.get('profilePicture') as File | null;
    const userId = formData.get('userId') as string | null;

    // Validate required fields
    if (!profilePicture || !userId) {
      return NextResponse.json(
        { error: "Profile picture and user ID are required" },
        { status: 400 }
      );
    }

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

    const imageUrl = await uploadProfilePicture(profilePicture, userId);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to upload profile picture" },
        { status: 500 }
      );
    }

    // Update user's profile picture in database
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    await pool.query(`
      UPDATE "user" 
      SET "image" = $1, "updatedAt" = NOW()
      WHERE id = $2
    `, [imageUrl, userId]);

    await pool.end();

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      message: "Profile picture uploaded successfully"
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}