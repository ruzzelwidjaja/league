import React from 'react';
import { redirect } from 'next/navigation';
import { requireVerifiedAuth } from '@/lib/session-utils';
import { getUserLeagueStatus } from '@/lib/actions/leagues';
import JoinPageClient from './JoinPageClient';

export default async function JoinPage() {
  // Validate session with automatic cookie clearing for invalid sessions
  await requireVerifiedAuth();
  
  // Fast database check during SSR - this runs on the server, not in the browser
  const leagueStatus = await getUserLeagueStatus();
  
  // If user is already in a league, redirect immediately
  if (leagueStatus.inLeague && leagueStatus.leagueCode) {
    redirect(`/league/${leagueStatus.leagueCode}`);
  }
  
  // User needs to join a league - render the client component
  return <JoinPageClient />;
}