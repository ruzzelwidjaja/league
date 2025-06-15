import React from "react";

export default function LoadingAnimation() {
  return (
    <div className="min-h-svh flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-secondary inline-block animate-spin rounded-full border-solid border-r-transparent" role="status"></div>
    </div>
  );
}