"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import styled from "styled-components";
import "react-phone-number-input/style.css";

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

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    profilePictureUrl?: string | null;
    organizationName?: string | null;
    image?: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [organizationName, setOrganizationName] = useState(user.organizationName || "");
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(
    user.phoneNumber || undefined
  );
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.profilePictureUrl || user.image || null
  );
  const [phoneError, setPhoneError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const isValidIrishMobile = (number: string) => {
    const digits = number.startsWith("+353")
      ? number.replace("+353", "")
      : number.replace(/\D/g, "");
    return digits.match(/^(083|085|086|087|089)\d{7}$/) || digits.match(/^8[3-9]\d{7}$/);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPhoneError(false);

    // Validation
    if (!firstName?.trim() || !lastName?.trim()) {
      toast.error("First name and last name are required");
      setIsSubmitting(false);
      return;
    }

    if (phoneNumber && !isValidIrishMobile(phoneNumber)) {
      setPhoneError(true);
      toast.error("Please enter a valid mobile number");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      if (organizationName?.trim()) {
        formData.append('organizationName', organizationName.trim());
      }
      if (phoneNumber) {
        formData.append('phoneNumber', phoneNumber);
      }
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await fetch("/api/profile/update", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");

        // Check if user is in a league and redirect back to it
        try {
          const leagueResponse = await fetch(`/api/user/league-status?userId=${user.id}`);
          if (leagueResponse.ok) {
            const leagueData = await leagueResponse.json();
            if (leagueData.inLeague && leagueData.leagueCode) {
              router.push(`/league/${leagueData.leagueCode}`);
              return;
            }
          }
        } catch (error) {
          console.error("Error checking league status:", error);
        }

        // Fallback to refresh if no league found
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Picture Section */}
      <div className="flex items-center gap-6 mb-10">
        <Avatar className="size-14">
          <AvatarImage src={previewUrl || undefined} alt="Profile picture" />
          <AvatarFallback className="text-lg font-medium bg-primary text-primary-foreground">
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            Change Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG up to 5MB
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-muted text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">This cannot be changed</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName || ""}
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
              value={lastName || ""}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name (Optional)</Label>
          <Input
            id="organizationName"
            type="text"
            value={organizationName || ""}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="Enter your organization name"
          />
          <p className="text-xs text-muted-foreground">
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
                setPhoneError(false);
              }}
              placeholder="Enter phone number"
            />
          </StyledPhoneInputWrapper>
          <p className="text-xs text-muted-foreground">
            This number can be used by other players for match coordination
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="gap-2 w-full sm:w-auto"
          size="lg"
        >
          {isSubmitting ? (
            "Updating..."
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Update Profile
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 