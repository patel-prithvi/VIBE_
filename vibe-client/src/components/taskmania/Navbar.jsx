import React from "react";
import { Flame } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fff5eb]/90 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-default">
            <div className="text-brand-500 transform group-hover:scale-110 transition-transform duration-300">
              <Flame size={26} fill="currentColor" />
            </div>
            <span className="font-extrabold text-3xl tracking-tighter text-gray-900">
              vibe<span className="text-brand-500">.</span>
            </span>
          </div>

          {/* Profile */}
          <button className="h-11 w-11 rounded-full bg-white border-2 border-brand-100 flex items-center justify-center text-brand-900 font-bold text-sm shadow-sm hover:border-brand-400 hover:shadow-md transition-all duration-300">
            JD
          </button>
        </div>
      </div>
    </nav>
  );
};
