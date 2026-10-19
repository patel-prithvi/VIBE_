import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  GraduationCap,
  Users,
  Briefcase,
  Building2,
} from "lucide-react";
import VibeLogo from "./public/VibeLogo";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Scroll detection to add soft shadow (ClassDojo behavior)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setRolesDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setRolesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Features", path: "/features" },
  ];

  const roleItems = [
    {
      title: "Students",
      desc: "Verified tasks, mentorship & Virtual CV",
      path: "/signup/student",
      icon: <GraduationCap size={18} className="text-[#7540F5]" />,
    },
    {
      title: "Faculty Mentors",
      desc: "Guide cohorts & verify student projects",
      path: "/signup/faculty",
      icon: <Users size={18} className="text-[#0284C7]" />,
    },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(17,27,94,0.06)] border-b border-slate-200"
          : "bg-white/90 backdrop-blur-sm border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-20">
          {/* Logo on Left */}
          <Link to="/" className="flex items-center group">
            <VibeLogo size="md" />
          </Link>

          {/* Desktop Nav Links in Center */}
          <div className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative py-2 text-sm font-semibold transition-colors duration-200 ${
                    active
                      ? "text-[#111B5E]"
                      : "text-[#5A6482] hover:text-[#7540F5]"
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7540F5] rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Dropdown Menu for Roles (ClassDojo style) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
                onMouseEnter={() => setRolesDropdownOpen(true)}
                className={`flex items-center gap-1.5 py-2 text-sm font-semibold transition-colors duration-200 ${
                  rolesDropdownOpen
                    ? "text-[#7540F5]"
                    : "text-[#5A6482] hover:text-[#7540F5]"
                }`}
                aria-expanded={rolesDropdownOpen}
              >
                <span>For You</span>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${
                    rolesDropdownOpen ? "rotate-180 text-[#7540F5]" : ""
                  }`}
                />
              </button>

              {/* Dropdown Panel */}
              {rolesDropdownOpen && (
                <div
                  onMouseLeave={() => setRolesDropdownOpen(false)}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-1 transition-all duration-200 animate-in fade-in slide-in-from-top-1 z-50"
                >
                  {roleItems.map((role) => (
                    <Link
                      key={role.title}
                      to={role.path}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F5F1FF] group transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:scale-105 transition-all">
                        {role.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111B5E] group-hover:text-[#7540F5] transition-colors">
                          {role.title}
                        </p>
                        <p className="text-[11px] text-[#5A6482] line-clamp-1">
                          {role.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Auth CTA Buttons on Right */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#111B5E] border border-slate-200 hover:border-[#7540F5] hover:text-[#7540F5] hover:bg-[#F5F1FF]/50 transition-all duration-200"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#7540F5] hover:bg-[#6025EB] flex items-center gap-1.5 shadow-sm hover:shadow-[0_6px_20px_rgba(117,64,245,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
            >
              <span>Sign up</span>
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-700 hover:text-[#7540F5] hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-1">
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

          {/* Mobile Role Quicklinks */}
          <div className="pt-2 border-t border-slate-100">
            <p className="px-4 text-[11px] font-bold uppercase tracking-wider text-[#5A6482] mb-2">
              Explore by Role
            </p>
            <div className="grid grid-cols-2 gap-2 px-2">
              {roleItems.map((role) => (
                <Link
                  key={role.title}
                  to={role.path}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#F5F1FF] border border-slate-100 flex items-center gap-2 transition-colors"
                >
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {role.icon}
                  </div>
                  <span className="text-xs font-bold text-[#111B5E]">
                    {role.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              to="/login"
              className="w-full text-center py-3 rounded-full text-sm font-semibold text-[#111B5E] border border-slate-200 hover:border-[#7540F5]"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="w-full text-center py-3 rounded-full text-sm font-semibold text-white bg-[#7540F5] hover:bg-[#6025EB] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Sign up</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
