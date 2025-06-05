import React from "react";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { createUserQueries } from "@/lib/supabase/queries";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/");
  }

  const userQueries = createUserQueries();
  const dbUser = await userQueries.getUserByWorkosId(user.id);

  if (!dbUser) {
    redirect("/");
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-foreground mb-10">Profile</h1>
        <ProfileForm user={user} dbUser={dbUser} />
      </div>
    </main>
  );
} 