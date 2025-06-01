// app/complete-profile/CompleteProfileForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import styled from "styled-components";
import "react-phone-number-input/style.css";

const StyledPhoneInputWrapper = styled.div<{ $hasError: boolean }>`
  .PhoneInput {
    display: flex;
    align-items: center;
    border: 1px solid ${props => props.$hasError ? 'rgb(239, 68, 68)' : 'rgb(209, 213, 219)'};
    border-radius: 0.375rem;
    padding: 0.75rem;
    background-color: white;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .PhoneInput:focus-within {
    border-color: ${props => props.$hasError ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'};
    box-shadow: 0 0 0 1px ${props => props.$hasError ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'};
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
  };
}

export default function CompleteProfileForm({ user, existingData }: CompleteProfileFormProps) {
  const [firstName, setFirstName] = useState(existingData?.first_name || user.firstName || "");
  const [lastName, setLastName] = useState(existingData?.last_name || user.lastName || "");
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
          phoneNumber: phoneNumber, // Send full international format
        }),
      });

      if (response.ok) {
        router.push("/"); // Redirect to home page
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">This cannot be changed</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First Name
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Enter your first name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Last Name
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Enter your last name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
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
        <p className="text-xs text-gray-500 mt-1">
          This number can be used by other players in the league for match coordination
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Completing Profile..." : "Complete Profile"}
      </button>
    </form>
  );
}