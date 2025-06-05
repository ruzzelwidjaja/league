"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { handleSignOut } from "./actions";

interface UserDropdownProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    profilePictureUrl?: string | null;
  };
  dbUser: {
    first_name: string | null;
    last_name: string | null;
    profile_picture_url: string | null;
  };
}

export default function UserDropdown({ user, dbUser }: UserDropdownProps) {
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Use database user data if available, fallback to WorkOS user data
  const displayFirstName = dbUser.first_name || user.firstName;
  const displayLastName = dbUser.last_name || user.lastName;
  const displayProfilePicture = dbUser.profile_picture_url || user.profilePictureUrl;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center">
          <Avatar className="size-8">
            <AvatarImage
              src={displayProfilePicture || undefined}
              alt={`${displayFirstName} ${displayLastName}`}
            />
            <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
              {getInitials(displayFirstName, displayLastName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-24" align="end">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <form action={handleSignOut} className="w-full">
            <button type="submit" className="flex items-center w-full">
              Sign Out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 