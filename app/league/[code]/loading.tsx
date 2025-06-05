import React from "react";

export default function Loading() {
  return (
    <div className="min-h-svh flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
}