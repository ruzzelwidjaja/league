"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinLeagueInput() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsChecking(true);

    try {
      // Check if league exists
      const response = await fetch(`/api/leagues/check/${code}`);
      const data = await response.json();

      if (data.exists) {
        // League exists, redirect to join page
        router.push(`/join/${code}`);
      } else {
        setError("Invalid league code. Please check and try again.");
      }
    } catch (err) {
      console.error("Error checking league:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="leagueCode"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter league code"
          className="text-center text-lg"
          required
          disabled={isChecking}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button
        type="submit"
        disabled={isChecking || !code.trim()}
        className="w-full"
        size="lg"
      >
        {isChecking ? "Checking..." : "Join League"}
      </Button>
    </form>
  );
}
