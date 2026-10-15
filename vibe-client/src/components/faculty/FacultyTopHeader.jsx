import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, MessageSquare, ChevronDown, Check, LogOut, User } from "lucide-react";
import VibeLogo from "../public/VibeLogo";
import Avatar from "../shared/Avatar";

export const FacultyTopHeader = ({ user, onLogout, onNavigate, onSearch }) => {
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const displayName = user?.name || "Dr. Meera Sharma";
  const displayRole = user?.role || "Faculty";
  const displayAvatar = user?.ImageUrl || user?.avatar;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: VIBE Logo & Wordmark */}
        <div 
          onClick={() => onNavigate && onNavigate("home")} 
          className="flex items-center cursor-pointer flex-shrink-0 select-none hover:opacity-90 transition-opacity"
        >
          <VibeLogo size="md" />
        </div>

        {/* Center: Search Field */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <div className="relative w-full">
            <Search 
              size={18} 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" 
            />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search posts, students, resources, topics..."
              className="vibe-search-input"
            />
          </div>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Notifications Icon with unread badge */}
          <button 
            type="button"
            aria-label="Notifications"
            className="relative p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
          </button>

          {/* Messages Icon */}
          <button 
            type="button"
            aria-label="Messages"
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors"
          >
            <MessageSquare size={20} />
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 hover:bg-[#F8FAFC] rounded-xl transition-all"
            >
              <div className="relative flex-shrink-0">
                <Avatar
                  name={displayName}
                  src={displayAvatar}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#E2E8F0]"
                  initialsClassName="text-xs font-bold text-white"
                />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#0F172A] leading-tight truncate max-w-[130px]">
                  {displayName}
                </p>
                <p className="text-[11px] text-[#64748B] font-medium leading-none capitalize">
                  {displayRole}
                </p>
              </div>
              <ChevronDown size={14} className="text-[#64748B] hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-[#F1F5F9]">
                  <p className="text-xs font-bold text-[#0F172A] truncate">{displayName}</p>
                  <p className="text-[11px] text-[#64748B] truncate">{user?.email || "faculty@vibe.dev"}</p>
                </div>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onNavigate) onNavigate("profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] hover:text-[#6D3DF5] transition-colors text-left"
                >
                  <User size={15} />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors text-left border-t border-[#F1F5F9]"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
