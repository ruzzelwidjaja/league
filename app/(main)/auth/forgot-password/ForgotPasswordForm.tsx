"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgetPassword } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await forgetPassword({
        email,
        redirectTo: "/auth/reset-password", // Where users go after clicking the email link
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
        return;
      }

      if (data) {
        setSuccess(true);
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
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
            Check your email
          </h1>
          <p className="text-neutral-600">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-neutral-500">
            The link will expire in 1 hour for security reasons.
          </p>
        </div>
        <Button
          onClick={() => router.push("/auth/signin")}
          className="w-full"
          size="lg"
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  // Show form with header when not successful
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold mb-2 text-neutral-800">
          Forgot Password?
        </h1>
        <p className="text-neutral-600">
          Enter your email address and we&apos;ll send you a link to reset your password
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !email}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </div>
  );
} 