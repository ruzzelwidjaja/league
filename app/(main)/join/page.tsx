"use client";

import React, { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { HiHashtag } from "react-icons/hi";
import JoinLeagueInput from "@/components/JoinLeagueInput";
import { InfoBox } from "@/components/ui/info-box";
import * as motion from "motion/react-client";
import { useRouter } from "next/navigation";
import { getUserLeagueStatus } from "@/lib/actions/leagues";
import { Button } from "@/components/ui/button";
import LoadingAnimation from "@/components/LoadingAnimation";

export default function JoinPage() {
  const { data: session, isPending } = useSession();
  const [isCheckingLeague, setIsCheckingLeague] = useState(false);
  const [manualSessionCheck, setManualSessionCheck] = useState<unknown>(null);
  const router = useRouter();
  const hasChecked = React.useRef(false);

  // Manual session check for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      authClient.getSession().then((result) => {
        console.log('🔍 MANUAL SESSION CHECK:', result);
        setManualSessionCheck(result);
      }).catch((error) => {
        console.log('❌ MANUAL SESSION ERROR:', error);
        setManualSessionCheck({ error: error.message });
      });
    }
  }, []);

  // Debug logging
  console.log('📱 JOIN PAGE DEBUG:', {
    isPending,
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id || 'none',
    userEmail: session?.user?.email || 'none',
    emailVerified: session?.user?.emailVerified || false,
    isCheckingLeague,
    hasChecked: hasChecked.current,
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'server',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    timestamp: new Date().toISOString(),
    // Additional debugging for auth issues
    cookies: typeof window !== 'undefined' ? document.cookie : 'server',
    sessionObject: session,
    manualSessionCheck
  });

  // Check if authenticated user is in a league (only once per session)
  useEffect(() => {
    console.log('🔄 USE_EFFECT TRIGGER:', {
      hasUser: !!session?.user,
      isCheckingLeague,
      hasChecked: hasChecked.current,
      shouldRun: !!(session?.user && !isCheckingLeague && !hasChecked.current)
    });

    if (session?.user && !isCheckingLeague && !hasChecked.current) {
      console.log('✅ STARTING LEAGUE CHECK for user:', session.user.email);

      // Check if email is verified first
      if (!session.user.emailVerified) {
        console.log('❌ EMAIL NOT VERIFIED, redirecting to signin');
        // Redirect to sign-in with message about email verification
        router.replace('/auth/signin?message=Please check your email and verify your account');
        return;
      }

      hasChecked.current = true;
      setIsCheckingLeague(true);
      console.log('📞 CALLING getUserLeagueStatus...');

      // Check if user is already in a league using Server Action
      getUserLeagueStatus()
        .then((leagueStatus) => {
          console.log('📊 LEAGUE STATUS RESULT:', leagueStatus);
          if (leagueStatus.inLeague && leagueStatus.leagueCode) {
            console.log('🏓 USER IN LEAGUE, redirecting to:', leagueStatus.leagueCode);
            // User is already in a league, redirect to their league
            router.replace(`/league/${leagueStatus.leagueCode}`);
          } else {
            console.log('👤 USER NOT IN LEAGUE, showing join form');
            setIsCheckingLeague(false);
          }
        })
        .catch((error) => {
          console.error("❌ ERROR checking user league:", error);
          setIsCheckingLeague(false);
        });
    }
  }, [session?.user, router]);

  // Show loading state while checking session or league
  if (isPending || isCheckingLeague || (session?.user && !hasChecked.current)) {
    console.log('🔄 SHOWING LOADING ANIMATION:', {
      isPending,
      isCheckingLeague,
      hasUserButNotChecked: !!(session?.user && !hasChecked.current),
      reason: isPending ? 'pending' : isCheckingLeague ? 'checking' : 'not-checked'
    });
    return (
      <LoadingAnimation />
    );
  }

  // If no session, redirect to signin (this should be handled by middleware, but just in case)
  if (!session?.user) {
    console.log('🚫 NO SESSION/USER, redirecting to signin');
    router.replace('/auth/signin');
    return null;
  }

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  // User is authenticated, verified, and not in a league - show join form
  console.log('✨ SHOWING JOIN FORM for user:', session.user.email);

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

        {/* Debug info visible on page (easier for mobile debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <strong>Debug:</strong> User: {session.user.email} |
            Verified: {session.user.emailVerified ? 'Yes' : 'No'} |
            Checked: {hasChecked.current ? 'Yes' : 'No'} |
            Time: {new Date().toLocaleTimeString()}
          </div>
        )}
      </motion.div>
    </main>
  );
}