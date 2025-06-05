import React from "react";

export default function Loading() {
  return (
    <div className="min-h-svh flex items-center justify-center">
      <div className="h-20 w-20 border-8 border-border-200 text-secondary inline-block animate-spin rounded-full border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
    </div>
  );
}