import React from "react";

interface PingPongLogoProps {
  className?: string;
}

const PingPongLogo: React.FC<PingPongLogoProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Ping pong paddle */}
      <circle cx="8" cy="8" r="6" />
      <path d="M14 14l4.5 4.5" strokeWidth="3" />

      {/* Ping pong ball */}
      <circle cx="18" cy="6" r="2" fill="currentColor" />
    </svg>
  );
};

export default PingPongLogo; 