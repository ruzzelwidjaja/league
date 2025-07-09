import React from "react";
import { requireVerifiedAuth } from "@/lib/session-utils";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await requireVerifiedAuth();

  return (
    <main className="min-h-svh p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-foreground mb-10 animate-fade-in-slide-up">Profile</h1>
        <div className="animate-fade-in-slide-up">
          <ProfileForm user={session.user} />
        </div>
      </div>
    </main>
  );
} 