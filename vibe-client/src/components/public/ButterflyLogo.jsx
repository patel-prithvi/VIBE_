import React from "react";

export const ButterflyLogo = ({ className = "", iconOnly = false, size = "md" }) => {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Butterfly SVG Emblem */}
      <svg
        className={`${iconSizes[size] || iconSizes.md} flex-shrink-0`}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="vibeButterflyGrad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9660FF" />
            <stop offset="100%" stopColor="#7540F5" />
          </linearGradient>
        </defs>

        {/* Left Upper Wing */}
        <path
          d="M17 17C17 17 15 7 7 6C3 5.5 1.5 9 3 13C4.8 17.8 13.5 17.8 17 17Z"
          fill="url(#vibeButterflyGrad)"
        />
        {/* Right Upper Wing */}
        <path
          d="M19 17C19 17 21 7 29 6C33 5.5 34.5 9 33 13C31.2 17.8 22.5 17.8 19 17Z"
          fill="url(#vibeButterflyGrad)"
        />
        {/* Left Lower Wing */}
        <path
          d="M17 18.5C17 18.5 13.5 20.5 8 22C4 23 4.5 28 8.5 29C13 30 16 23 17 18.5Z"
          fill="url(#vibeButterflyGrad)"
          opacity="0.92"
        />
        {/* Right Lower Wing */}
        <path
          d="M19 18.5C19 18.5 22.5 20.5 28 22C32 23 31.5 28 27.5 29C23 30 20 23 19 18.5Z"
          fill="url(#vibeButterflyGrad)"
          opacity="0.92"
        />
        {/* Center Slender Body */}
        <ellipse cx="18" cy="18" rx="1.5" ry="6" fill="#111B5E" />
      </svg>

      {/* Bold Navy VIBE Wordmark */}
      {!iconOnly && (
        <span
          className={`font-black tracking-tight text-[#111B5E] uppercase font-sans ${
            textSizes[size] || textSizes.md
          }`}
        >
          VIBE
        </span>
      )}
    </div>
  );
};

export default ButterflyLogo;
