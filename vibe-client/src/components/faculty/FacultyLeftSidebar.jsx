import React from "react";
import {
  Home,
  Users,
  User,
  Bookmark,
  LogOut,
} from "lucide-react";

export const FacultyLeftSidebar = ({ activeView, onNavigate, onLogout }) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "mentorship", label: "Mentorship", icon: Users },
    { id: "profile", label: "My Profile", icon: User },
    { id: "bookmarks", label: "My Bookmarks", icon: Bookmark },
  ];

  return (
    <aside className="w-full lg:w-[260px] min-w-0 flex-shrink-0">
      <div className="vibe-sidebar-card sticky top-20">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (item.id === "home" && activeView === "posts");

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`vibe-nav-item ${
                  isActive
                    ? "vibe-nav-item-active shadow-xs"
                    : "vibe-nav-item-inactive"
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-colors ${
                    isActive ? "text-[#6D3DF5]" : "text-[#475569]"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Logout Action Item */}
          <div className="pt-2 mt-2 border-t border-[#F1F5F9]">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-[#475569] hover:bg-red-50 hover:text-[#EF4444] transition-all text-left"
            >
              <LogOut size={20} className="text-[#475569] group-hover:text-[#EF4444]" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};
