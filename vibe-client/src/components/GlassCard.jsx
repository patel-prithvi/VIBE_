import React from "react";

const GlassCard = ({ children, className = "", glow = false }) => {
  return (
    <div className={`relative group ${className}`}>
      <div
        className={`
        absolute inset-0 bg-[#1D3C5A]/0 group-hover:bg-[#1D3C5A]/5 transition-all duration-500 rounded-3xl blur-2xl
        ${glow ? "bg-[#1D3C5A]/10 scale-105" : ""}
      `}
      />
      <div
        className={`
        relative overflow-hidden bg-white/80 backdrop-blur-xl border border-[#C9D8E4] rounded-3xl p-8 h-full
        transition-all duration-500 hover:border-[#4B7EA3]/40 hover:shadow-[0_20px_50px_rgba(29,60,90,0.08)] shadow-sm
      `}
      >
        {/* Subtle top-left light leak */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#1D3C5A]/5 rounded-full blur-3xl group-hover:bg-[#1D3C5A]/10 transition-all" />
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
