import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { headers } from "next/headers";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if email is verified
  if (!session.user.emailVerified) {
    redirect("/auth/signin?message=Please verify your email first");
  }

  return (
    <main className="min-h-svh p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-foreground mb-10">Profile</h1>
        <ProfileForm user={session.user} />
      </div>
    </main>
  );
} 