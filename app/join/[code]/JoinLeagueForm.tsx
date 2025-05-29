'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinLeagueForm({ league, user }: { league: any, user: any }) {
  const [skillTier, setSkillTier] = useState('middle');
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  
  const handleJoin = async () => {
    setIsJoining(true);
    
    const response = await fetch('/api/leagues/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leagueId: league.id,
        skillTier,
      }),
    });
    
    if (response.ok) {
      router.push(`/league/${league.id}`);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1>Join {league.name}</h1>
      <p>{league.description}</p>
      
      <div className="mt-6">
        <label>Self-assess your skill level:</label>
        <select 
          value={skillTier} 
          onChange={(e) => setSkillTier(e.target.value)}
          className="w-full mt-2 p-2 border rounded"
        >
          <option value="top">Top Third (Experienced)</option>
          <option value="middle">Middle Third (Intermediate)</option>
          <option value="bottom">Bottom Third (Beginner)</option>
        </select>
      </div>
      
      <button
        onClick={handleJoin}
        disabled={isJoining}
        className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
      >
        {isJoining ? 'Joining...' : 'Join League'}
      </button>
    </div>
  );
}