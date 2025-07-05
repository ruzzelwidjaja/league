import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from "@/lib/auth";
import { getUserLeagueStatus } from '@/lib/actions/leagues';
import JoinPageClient from './JoinPageClient';

export default async function JoinPage() {
  // Get session on the server - this is fast since middleware already validated the cookie
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Double-check authentication (middleware should have caught this, but safety first)
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  // Check email verification
  if (!session.user.emailVerified) {
    redirect('/auth/signin?message=Please check your email and verify your account');
  }
  
  // Fast database check during SSR - this runs on the server, not in the browser
  const leagueStatus = await getUserLeagueStatus();
  
  // If user is already in a league, redirect immediately
  if (leagueStatus.inLeague && leagueStatus.leagueCode) {
    redirect(`/league/${leagueStatus.leagueCode}`);
  }
  
  // User needs to join a league - render the client component
  return <JoinPageClient />;
}