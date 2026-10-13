import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import ButterflyLogo from "./public/ButterflyLogo";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Features", path: "/features" },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo on Left */}
          <Link to="/" className="flex items-center group">
            <ButterflyLogo size="md" />
          </Link>

          {/* Desktop Nav Links in Center */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "text-[#111B5E]"
                      : "text-slate-600 hover:text-[#7540F5]"
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7540F5] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth CTA Buttons on Right */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login"
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#111B5E] border border-slate-200 hover:border-[#7540F5] hover:text-[#7540F5] transition-all"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-[#7540F5] hover:bg-[#6025EB] flex items-center gap-1.5 shadow-sm hover:shadow transition-all group"
            >
              <span>Join VIBE</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-[#7540F5] hover:bg-slate-50 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                    active
                      ? "bg-[#F5F1FF] text-[#7540F5]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              to="/login"
              className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-[#111B5E] border border-slate-200 hover:border-[#7540F5]"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-white bg-[#7540F5] hover:bg-[#6025EB] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Join VIBE</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
