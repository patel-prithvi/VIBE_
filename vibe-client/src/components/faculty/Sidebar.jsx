import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  User,
  Inbox,
  LogOut,
  Zap,
} from "lucide-react";
import { auth } from "../../utils/auth";
import Avatar from "../shared/Avatar";

const menuItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "posts", label: "Community Posts", icon: MessageSquare },
  { id: "requests", label: "Mentor Requests", icon: Inbox },
  { id: "profile", label: "Profile", icon: User },
];

export const Sidebar = ({ user, activeView, onNavigate }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  const handleNavigation = (id) => {
    onNavigate(id);

    // Scroll to top when navigating to a new section
    setTimeout(() => {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        mainContent.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  return (
    <>
      {/* Mobile Icon Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl border border-[#C9D8E4] rounded-2xl px-3 py-2 shadow-xl">
        <div className="flex items-center justify-around">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              aria-label={item.label}
              title={item.label}
              className={`
                p-2.5 rounded-xl transition-all duration-200 outline-none
                ${
                  activeView === item.id
                    ? "bg-[#1D3C5A] text-white shadow-md shadow-[#1D3C5A]/20"
                    : "text-[#5E6A76] hover:text-[#1D3C5A] hover:bg-[#E6EEF5]"
                }
              `}
            >
              <item.icon
                size={22}
                strokeWidth={activeView === item.id ? 2.5 : 2}
              />
            </button>
          ))}

          <button
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            className="p-2.5 rounded-xl text-[#728494] hover:text-red-500 hover:bg-red-50 transition-all duration-200 outline-none"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>

      {/* Desktop Collapsed Icon-Only Navigation Rail */}
      <aside className="hidden lg:block fixed left-4 top-6 bottom-6 w-20 z-50">
        <div className="h-[calc(100vh-3rem)] bg-white border border-[#C9D8E4] rounded-3xl shadow-xl flex flex-col justify-between items-center py-6 px-3">
          
          {/* Top Brand Logo Icon */}
          <div
            onClick={() => handleNavigation("home")}
            className="w-11 h-11 bg-[#1D3C5A] rounded-2xl flex items-center justify-center text-white shadow-md shadow-[#1D3C5A]/20 cursor-pointer hover:scale-105 transition-transform"
            title="VIBE Home"
          >
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>

          {/* Icon Navigation Items */}
          <nav className="flex-1 flex flex-col items-center justify-center space-y-4 my-6">
            {menuItems.map((item) => (
              <div key={item.id} className="group relative flex items-center justify-center">
                <button
                  onClick={() => handleNavigation(item.id)}
                  aria-label={item.label}
                  title={item.label}
                  className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 outline-none
                    ${
                      activeView === item.id
                        ? "bg-[#1D3C5A] text-white shadow-lg shadow-[#1D3C5A]/25 scale-105"
                        : "text-[#5E6A76] hover:bg-[#D3E3EE]/60 hover:text-[#1D3C5A]"
                    }
                  `}
                >
                  <item.icon
                    size={22}
                    strokeWidth={activeView === item.id ? 2.5 : 2}
                  />
                </button>

                {/* Floating Tooltip */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#12283F] text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-all duration-200 z-50 flex items-center gap-1.5 transform -translate-x-1 group-hover:translate-x-0">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#12283F]" />
                  {item.label}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Logout Action */}
          <div className="group relative flex items-center justify-center">
            <button
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              className="w-12 h-12 rounded-2xl text-[#728494] hover:bg-red-50 hover:text-red-500 transition-all duration-200 flex items-center justify-center outline-none"
            >
              <LogOut size={22} />
            </button>

            {/* Logout Tooltip */}
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#12283F] text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-all duration-200 z-50 flex items-center gap-1.5 transform -translate-x-1 group-hover:translate-x-0">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#12283F]" />
              Logout
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};
