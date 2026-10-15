import React from "react";

export const VibeLogo = ({ className = "", size = "md" }) => {
  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* Bold Navy VIBE Wordmark (Text-Only Brand Logo) */}
      <span
        className={`font-black tracking-tight text-[#111B5E] uppercase font-sans leading-none ${
          textSizes[size] || textSizes.md
        }`}
      >
        VIBE
      </span>
    </div>
  );
};

export const ButterflyLogo = VibeLogo;
export default VibeLogo;
