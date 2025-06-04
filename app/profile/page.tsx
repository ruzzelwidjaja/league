import React from "react";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { createUserQueries } from "@/lib/supabase/queries";
import ProfileForm from "./ProfileForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Profile</h1>
        </div>

        <ProfileForm user={user} dbUser={dbUser} />
      </div>
    </main>
  );
} 