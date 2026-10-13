import React from "react";
import { motion } from "framer-motion";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D3C5A] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#1D3C5A] text-white hover:bg-[#12283F] hover:shadow-[0_8px_20px_rgba(29,60,90,0.3)]",
    secondary:
      "bg-[#E6EEF5] text-[#12283F] hover:bg-[#D3E3EE] border border-[#C9D8E4]",
    outline:
      "border-2 border-[#1D3C5A] text-[#1D3C5A] hover:bg-[#1D3C5A] hover:text-white",
    ghost: "text-[#5E6A76] hover:text-[#12283F] hover:bg-[#E6EEF5]",
    faculty:
      "bg-white text-[#1D3C5A] border-2 border-[#1D3C5A] hover:bg-[#1D3C5A] hover:text-white active:bg-white active:text-[#1D3C5A]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
