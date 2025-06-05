// app/complete-profile/page.tsx
import React from "react";
import { withAuth, signOut } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { createUserQueries } from "@/lib/supabase/queries";
import { LuUser } from "react-icons/lu";
import CompleteProfileForm from "./CompleteProfileForm";
import * as motion from "motion/react-client";

export default async function CompleteProfilePage() {
  const { user } = await withAuth();

  if (!user) {
    redirect("/");
  }

  const userQueries = createUserQueries();

  // Get user from database to check if profile is already complete
  const dbUser = await userQueries.getUserByWorkosId(user.id);

  // If profile is already complete, redirect to home
  if (dbUser?.profile_completed) {
    redirect("/");
  }

  // Transform user data to match the expected props format
  const userProps = {
    id: user.id,
    email: user.email || "",
    firstName: user.firstName || "",
    lastName: user.lastName || ""
  };

  // Transform existing data to match the expected props format
  const existingData = dbUser ? {
    first_name: dbUser.first_name || undefined,
    last_name: dbUser.last_name || undefined,
    phone_number: dbUser.phone_number || undefined,
    organization_name: dbUser.organization_name || undefined
  } : undefined;

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LuUser className="h-12 w-12 text-[#C0A891]" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            Just a few more details to get you started!
          </p>
        </div>

        <CompleteProfileForm
          user={userProps}
          existingData={existingData}
        />

        <form
          action={async () => {
            "use server";
            await signOut();
          }}
          className="mt-4 text-center"
        >
          <button
            type="submit"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Sign Out
          </button>
        </form>
      </motion.div>
    </main>
  );
}