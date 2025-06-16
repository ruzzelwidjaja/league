"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import styled from "styled-components";
import "react-phone-number-input/style.css";
import Image from "next/image";
import PingPongIcon from "@/public/PingPongIcon.png";

const StyledPhoneInputWrapper = styled.div<{ $hasError: boolean }>`
  .PhoneInput {
    display: flex;
    align-items: center;
    border: 1px solid ${props => props.$hasError ? 'var(--destructive)' : 'var(--border)'};
    border-radius: var(--radius);
    padding: 0.75rem;
    background-color: transparent;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .PhoneInput:focus-within {
    border-color: ${props => props.$hasError ? 'var(--destructive)' : 'var(--ring)'};
    box-shadow: 0 0 0 1px ${props => props.$hasError ? 'var(--destructive)' : 'var(--ring)'};
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .PhoneInputCountry {
    margin-right: 0.75rem;
  }

  .PhoneInputInput {
    flex: 1;
    border: none;
    padding: 0;
    outline: none;
    background-color: transparent;
    font-size: inherit;
    line-height: inherit;
  }

  .PhoneInputCountryIcon {
    width: 1.5rem;
    height: 1.125rem;
  }

  .PhoneInputCountrySelectArrow {
    margin-left: 0.25rem;
    width: 0.5rem;
    height: 0.25rem;
    border-style: solid;
    border-color: currentColor transparent transparent;
    border-width: 0.25rem 0.25rem 0;
  }
`;

// Validate Irish mobile number
const isValidIrishMobile = (number: string) => {
  const digits = number.startsWith("+353")
    ? number.replace("+353", "")
    : number.replace(/\D/g, "");
  return digits.match(/^(083|085|086|087|089)\d{7}$/) || digits.match(/^8[3-9]\d{7}$/);
};

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
  const [organizationName, setOrganizationName] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL and league code from search params
  const leagueCode = searchParams.get("league");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPhoneError(false);

    // Validation
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      setIsSubmitting(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      setIsSubmitting(false);
      return;
    }

    // Validate phone number only if provided
    if (phoneNumber && !isValidIrishMobile(phoneNumber)) {
      setPhoneError(true);
      toast.error("Please enter a valid mobile number");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber,
        organizationName: organizationName.trim() || null,
        callbackURL: "/auth/verify-callback", // This should redirect to our callback page
      });

      if (error) {
        toast.error(error.message || "Failed to create account");
        return;
      }

      if (data?.user) {
        // Show success state instead of immediately redirecting
        setSuccess(true);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success state
  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Verify your email</h1>
          <p className="text-gray-500 dark:text-gray-400">
            We&apos;ve sent a verification link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            You must verify your email before you can sign in to your account.
          </p>
        </div>
        <Button
          onClick={() => {
            if (leagueCode) {
              router.push(`/auth/signin?league=${leagueCode}`);
            } else {
              router.push("/auth/signin");
            }
          }}
          className="w-full"
        >
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Logo and Header - only show for sign up form */}
      <div className="mb-8 text-center">
        <Image
          src={PingPongIcon}
          alt="Ping Pong Icon"
          width={56}
          height={56}
          className="mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold mb-2 text-neutral-800">
          Join the League
        </h1>
        <p className="text-neutral-600">
          Create your account to join the league
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-rows-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Enter your first name"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Enter your last name"
              disabled={isSubmitting}
            />
          </div>
        </div>

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
          <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
          <StyledPhoneInputWrapper $hasError={phoneError}>
            <PhoneInput
              international
              defaultCountry="IE"
              value={phoneNumber}
              onChange={(value) => {
                setPhoneNumber(value);
                setPhoneError(false);
              }}
              placeholder="Enter phone number"
              disabled={isSubmitting}
            />
          </StyledPhoneInputWrapper>
          <p className="text-xs text-muted-foreground">
            This number can be used by other players for match coordination
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name (Optional)</Label>
          <Input
            id="organizationName"
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="Enter your organization name"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Company, school, or team you&apos;re representing
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a password"
            disabled={isSubmitting}
            minLength={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>

        {leagueCode && (
          <div className="text-center">
            <p className="text-sm text-neutral-600">
              You&apos;ll be redirected to join the league after creating your account
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          By creating an account, you agree to our Privacy Policy. Your information
          will be shared with other league members to facilitate match coordination.
        </div>
      </form>
    </>
  );
} 