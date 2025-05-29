'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinLeagueInput() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsChecking(true);

    try {
      // Check if league exists
      const response = await fetch(`/api/leagues/check/${code}`);
      const data = await response.json();

      if (data.exists) {
        // League exists, redirect to join page
        router.push(`/join/${code}`);
      } else {
        setError('Invalid league code. Please check and try again.');
      }
    } catch (err) {
      console.error('Error checking league:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter league code"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent lowercase text-center text-lg"
          required
          disabled={isChecking}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isChecking || !code.trim()}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {isChecking ? 'Checking...' : 'Join League'}
      </button>
    </form>
  );
}