import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("workos-signature");
  const secret = process.env.WORKOS_WEBHOOK_SECRET!;

  // Verify webhook signature
  const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (hash !== signature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);
  const supabase = await createClient();

  switch (event.event) {
    case "user.created":
      // For new users, create with WorkOS data
      await supabase.from("users").upsert({
        workos_user_id: event.data.id,
        email: event.data.email,
        first_name: event.data.first_name,
        last_name: event.data.last_name,
        profile_picture_url: event.data.profilePictureUrl,
        updated_at: new Date().toISOString(),
      });
      break;

    case "user.updated": {
      // For existing users, only update email (preserve local profile data)
      // Check if user exists and has completed profile
      const { data: existingUser } = await supabase
        .from("users")
        .select("profile_completed")
        .eq("workos_user_id", event.data.id)
        .single();

      if (existingUser?.profile_completed) {
        // Only update email for users with completed profiles
        await supabase
          .from("users")
          .update({
            email: event.data.email,
            updated_at: new Date().toISOString(),
          })
          .eq("workos_user_id", event.data.id);
      } else {
        // For users without completed profiles, update all fields
        await supabase.from("users").upsert({
          workos_user_id: event.data.id,
          email: event.data.email,
          first_name: event.data.first_name,
          last_name: event.data.last_name,
          profile_picture_url: event.data.profilePictureUrl,
          updated_at: new Date().toISOString(),
        });
      }
      break;
    }

    case "user.deleted":
      await supabase
        .from("users")
        .delete()
        .eq("workos_user_id", event.data.id);
      break;
  }

  return new Response("OK", { status: 200 });
}
