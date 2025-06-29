"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { getUserLeagueStatus } from "@/lib/actions/leagues";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL and league code from search params
  const redirectTo = searchParams.get("redirect") || "/";
  const leagueCode = searchParams.get("league");
  const message = searchParams.get("message");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to sign in");
        return;
      }

      if (data?.user) {
        // Handle post-login routing immediately (no toast for speed)
        if (leagueCode) {
          router.push(`/join/${leagueCode}`);
        } else {
          // Check if user is already in a league
          const leagueStatus = await getUserLeagueStatus();

          if (leagueStatus.inLeague && leagueStatus.leagueCode) {
            router.push(`/league/${leagueStatus.leagueCode}`);
            return;
          }

          router.push(redirectTo);
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {message && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">{message}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-neutral-600 hover:text-neutral-800 underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>

        {leagueCode && (
          <div className="text-center">
            <p className="text-sm text-neutral-600">
              You&apos;ll be redirected to join the league after signing in
            </p>
          </div>
        )}
      </form>
    </>
  );
}