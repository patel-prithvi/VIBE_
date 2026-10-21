import React from "react";
import {
  Settings,
  Home,
  Briefcase,
  Users,
  User,
  LogOut,
} from "lucide-react";

export const IndustryLeftSidebar = ({
  activeView,
  onNavigate,
  onLogout,
  isCollapsed = false,
}) => {
  const navItems = [
    { id: "overview", label: "Home", icon: Home },
    { id: "tasks", label: "My Tasks", icon: Briefcase },
    { id: "community", label: "Community", icon: Users },
    { id: "profile", label: "My Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:block sticky top-20 self-start z-30 transition-all duration-300 ease-in-out min-w-0 flex-shrink-0 ${
        isCollapsed ? "w-[76px]" : "w-[260px]"
      }`}
    >
      <div
        className={`vibe-sidebar-card vibe-sidebar-scroll max-h-[calc(100vh-6rem)] transition-all duration-300 ease-in-out ${
          isCollapsed ? "px-2 py-3 overflow-visible" : "p-3 overflow-y-auto"
        }`}
      >
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeView === item.id ||
              (item.id === "overview" && (activeView === "home" || activeView === "overview"));

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
                aria-label={item.label}
                className={
                  isCollapsed
                    ? `relative group w-full flex items-center justify-center p-3 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#F3EEFF] text-[#6D3DF5] shadow-xs"
                          : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                      }`
                    : `vibe-nav-item cursor-pointer ${
                        isActive
                          ? "vibe-nav-item-active shadow-xs"
                          : "vibe-nav-item-inactive"
                      }`
                }
              >
                <Icon
                  size={20}
                  className={`transition-colors flex-shrink-0 ${
                    isActive ? "text-[#6D3DF5]" : "text-[#475569] group-hover:text-[#0F172A]"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Floating tooltip in collapsed state */}
                {isCollapsed && (
                  <div
                    role="tooltip"
                    className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0F172A] text-white text-xs font-semibold rounded-lg shadow-xl pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 duration-150 drop-shadow-md"
                  >
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-[#0F172A]" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Logout Action Item */}
          <div className="pt-2 mt-2 border-t border-[#F1F5F9]">
            <button
              onClick={onLogout}
              title={isCollapsed ? "Logout" : undefined}
              aria-label="Logout"
              className={
                isCollapsed
                  ? "relative group w-full flex items-center justify-center p-3 rounded-xl text-[#475569] hover:bg-red-50 hover:text-[#EF4444] transition-all cursor-pointer"
                  : "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-[#475569] hover:bg-red-50 hover:text-[#EF4444] transition-all text-left group cursor-pointer"
              }
            >
              <LogOut size={20} className="text-[#475569] group-hover:text-[#EF4444] transition-colors flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}

              {/* Floating tooltip in collapsed state */}
              {isCollapsed && (
                <div
                  role="tooltip"
                  className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0F172A] text-white text-xs font-semibold rounded-lg shadow-xl pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 duration-150 drop-shadow-md"
                >
                  Logout
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-[#0F172A]" />
                </div>
              )}
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};
