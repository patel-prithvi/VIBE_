import React from "react";
import {
  Home,
  Users,
  FileText,
  User,
  Bookmark,
  Briefcase,
  LogOut,
} from "lucide-react";

export const StudentLeftSidebar = ({ activeView, onNavigate, onLogout }) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "mentorship", label: "Mentorship", icon: Users },
    { id: "cv-analysis", label: "CV Analysis", icon: FileText },
    { id: "profile", label: "My Profile", icon: User },
    { id: "bookmarks", label: "My Bookmarks", icon: Bookmark },
    { id: "taskmania", label: "TaskMania", icon: Briefcase },
  ];

  return (
    <aside className="w-full lg:w-[260px] min-w-0 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sticky top-20">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeView === item.id ||
              (item.id === "home" && activeView === "posts") ||
              (item.id === "mentorship" && activeView === "requests") ||
              (item.id === "cv-analysis" && activeView === "virtual-cv");

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                  isActive
                    ? "bg-[#F3EEFF] text-[#6D3DF5] font-bold shadow-xs"
                    : "text-[#1E293B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-colors ${
                    isActive ? "text-[#6D3DF5]" : "text-[#475569]"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Logout Action Item */}
          <div className="pt-2 mt-2 border-t border-[#F1F5F9]">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-[#475569] hover:bg-red-50 hover:text-[#EF4444] transition-all text-left group"
            >
              <LogOut size={20} className="text-[#475569] group-hover:text-[#EF4444] transition-colors" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};
