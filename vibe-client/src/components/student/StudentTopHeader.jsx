import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, ChevronDown, LogOut, User, Menu, Bookmark, Settings } from "lucide-react";
import VibeLogo from "../public/VibeLogo";
import Avatar from "../shared/Avatar";
import { NotificationBell } from "../shared/NotificationBell";

export const StudentTopHeader = ({
  user,
  onLogout,
  onNavigate,
  onSearch,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
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

  const displayName = user?.name || "Student";
  const displayRole = user?.accountType || user?.role || "Student";
  const displayAvatar = user?.ImageUrl || user?.avatar;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Sidebar Toggle & VIBE Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:inline-flex items-center justify-center p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#6D3DF5]/30 cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <div 
            onClick={() => onNavigate && onNavigate("home")} 
            className="flex items-center cursor-pointer flex-shrink-0 select-none hover:opacity-90 transition-opacity"
          >
            <VibeLogo size="md" />
          </div>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Notifications with live unread badge + dropdown */}
          <NotificationBell />

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
              className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 hover:bg-[#F8FAFC] rounded-xl transition-all cursor-pointer"
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
              <div className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-[#F1F5F9]">
                  <p className="text-xs font-bold text-[#0F172A] truncate">{displayName}</p>
                  <p className="text-[11px] text-[#64748B] truncate">{user?.email || "student@vibe.dev"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onNavigate) onNavigate("profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] hover:text-[#6D3DF5] transition-colors text-left cursor-pointer"
                >
                  <User size={15} />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onNavigate) onNavigate("bookmarks");
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] hover:text-[#6D3DF5] transition-colors text-left cursor-pointer"
                >
                  <Bookmark size={15} />
                  My Bookmarks
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onNavigate) onNavigate("settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] hover:text-[#6D3DF5] transition-colors text-left cursor-pointer"
                >
                  <Settings size={15} />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors text-left border-t border-[#F1F5F9] cursor-pointer"
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
