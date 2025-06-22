"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the token from URL query parameters
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long");
      setIsSubmitting(false);
      return;
    }

    if (!token) {
      toast.error("Invalid or missing reset token");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await resetPassword({
        newPassword: password,
        token: token,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
        return;
      }

      if (data) {
        setSuccess(true);
        toast.success("Password reset successfully!");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success state instead of everything
  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold mb-2 text-neutral-800">
            Password Reset Successful!
          </h1>
          <p className="text-neutral-600">
            Your password has been changed successfully. You can now sign in with your new password.
          </p>
        </div>
        <Button
          onClick={() => router.push("/auth/signin")}
          className="w-full"
          size="lg"
        >
          Go to Sign In
        </Button>
      </div>
    );
  }

  // Show error state instead of everything
  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold mb-2 text-red-600">
            Invalid Reset Link
          </h1>
          <p className="text-neutral-600">
            This password reset link is invalid or has expired. Please request a new password reset.
          </p>
        </div>
        <Button
          onClick={() => router.push("/auth/forgot-password")}
          className="w-full"
          size="lg"
        >
          Request New Reset Link
        </Button>
      </div>
    );
  }

  // Show form with header when token exists and not successful
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold mb-2 text-neutral-800">
          Reset Password
        </h1>
        <p className="text-neutral-600">
          Create a new password for your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your new password"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your new password"
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !password || !confirmPassword}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
} 