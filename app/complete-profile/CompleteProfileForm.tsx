// app/complete-profile/CompleteProfileForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import styled from "styled-components";
import "react-phone-number-input/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const StyledPhoneInputWrapper = styled.div<{ $hasError: boolean }>`
  .PhoneInput {
    display: flex;
    align-items: center;
    border: 1px solid ${props => props.$hasError ? 'var(--destructive)' : 'var(--border)'};
    border-radius: var(--radius);
    padding: 0.75rem;
    background-color: transparent;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    ::selection {
      background-color: var(--primary);
      color: var(--primary-foreground);
    }
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

  .PhoneInputInput:focus {
    outline: none;
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

interface CompleteProfileFormProps {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  existingData?: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    organization_name?: string;
  };
}

export default function CompleteProfileForm({ user, existingData }: CompleteProfileFormProps) {
  const [firstName, setFirstName] = useState(existingData?.first_name || user.firstName || "");
  const [lastName, setLastName] = useState(existingData?.last_name || user.lastName || "");
  const [organizationName, setOrganizationName] = useState(existingData?.organization_name || "");
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(
    existingData?.phone_number || undefined
  );
  const [phoneError, setPhoneError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const router = useRouter();

  // Validate Irish mobile number
  const isValidIrishMobile = (number: string) => {
    // Extract digits after country code
    const digits = number.startsWith("+353")
      ? number.replace("+353", "")
      : number.replace(/\D/g, "");

    // Irish mobile numbers typically start with 08 and are 10 digits total
    return digits.match(/^(083|085|086|087|089)\d{7}$/) || digits.match(/^8[3-9]\d{7}$/);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setPhoneError(false);
    setSubmitted(true);

    // Basic validation
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      setIsSubmitting(false);
      return;
    }

    if (!phoneNumber) {
      setPhoneError(true);
      setError("Phone number is required");
      setIsSubmitting(false);
      return;
    }

    // Validate phone number format using the same logic as the backend
    if (!isValidIrishMobile(phoneNumber)) {
      setPhoneError(true);
      setError("Please enter a valid mobile number");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          organizationName: organizationName.trim() || null,
          phoneNumber: phoneNumber, // Send full international format
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(data.redirectTo || "/");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="bg-gray-50 text-gray-500"
        />
        <p className="text-xs text-gray-500">This cannot be changed</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          placeholder="Enter your first name"
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization Name (Optional)</Label>
        <Input
          id="organizationName"
          type="text"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="Enter your organization name"
        />
        <p className="text-xs text-gray-500">
          Company, school, or team you&apos;re representing
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <StyledPhoneInputWrapper $hasError={phoneError}>
          <PhoneInput
            international
            defaultCountry="IE"
            value={phoneNumber}
            onChange={(value) => {
              setPhoneNumber(value);
              // Clear error if user changes the input after submission
              if (submitted) {
                setPhoneError(false);
                setError("");
              }
            }}
            placeholder="Enter phone number"
          />
        </StyledPhoneInputWrapper>
        <p className="text-xs text-gray-500">
          This number can be used by other players in the league for match coordination
        </p>
      </div>

      <blockquote className="mt-6 border-l-2 pl-4 text-xs">
        <p>
          By completing your profile, you agree to our{" "}
          <Link
            href="/privacy"
            className="text-primary hover:underline font-medium"
          >
            Privacy Policy
          </Link>
          . Your information will be shared with other league members to facilitate match coordination.
        </p>
      </blockquote>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? "Completing Profile..." : "Complete Profile"}
      </Button>
    </form>
  );
}