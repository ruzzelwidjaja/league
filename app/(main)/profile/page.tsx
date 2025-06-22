import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";

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
        <div className="animate-fade-in-slide-up">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/join">
              <IoIosArrowBack className="w-4 h-4" /> Back to League
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold text-foreground mb-10">Profile</h1>
        </div>
        <div className="animate-fade-in-slide-up">
          <ProfileForm user={session.user} />
        </div>
      </div>
    </main>
  );
} 