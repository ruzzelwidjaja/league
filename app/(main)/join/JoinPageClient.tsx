"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import { HiHashtag } from "react-icons/hi";
import JoinLeagueInput from "@/components/JoinLeagueInput";
import { InfoBox } from "@/components/ui/info-box";
import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";

export default function JoinPageClient() {
  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  // No loading states needed - all server logic is handled in the Server Component
  return (
    <main className="min-h-svh flex items-center justify-center p-8">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {/* Hash Icon */}
        <div className="mb-8 text-center">
          <HiHashtag className="w-14 h-14 text-neutral-500 mx-auto" />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-neutral-800">
            Enter League Code
          </h1>
          <p className="text-neutral-600">
            Enter the code provided by your league administrator
          </p>
        </div>

        <JoinLeagueInput />

        {/* Info Box */}
        <InfoBox title="Don't have a code?" className="mt-8">
          Visit the front desk at WeWork or scan the QR code posted in the building&apos;s ping pong area to get your league access code.
        </InfoBox>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-700 text-sm"
            size="sm"
          >
            Sign Out
          </Button>
        </div>
      </motion.div>
    </main>
  );
}