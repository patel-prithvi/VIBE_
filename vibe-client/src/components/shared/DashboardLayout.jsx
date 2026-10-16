import React, { useState } from "react";
import {
  Home,
  LayoutDashboard,
  Users,
  Briefcase,
  Building,
  LogOut,
  Menu,
  X,
  GraduationCap,
  User,
  BookOpen,
  MessageSquare,
  UserCheck,
  Zap,
} from "lucide-react";
import { auth } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { NotificationBell } from "./NotificationBell";
import { Sidebar as StudentSidebar } from "../student/Sidebar";
import { Sidebar as FacultySidebar } from "../faculty/Sidebar";
import { useToast } from "../Toast";

const SidebarItem = ({
  icon: Icon,
  label,
  id,
  activeTab,
  onClick,
  color = "orange",
}) => {
  const isActive = activeTab === id;

  const colorClasses = {
    orange: {
      active: "bg-[#1D3C5A] text-white shadow-lg shadow-[#1D3C5A]/20",
      inactive: "text-[#5E6A76] hover:bg-[#E6EEF5] hover:text-[#1D3C5A]",
      iconActive: "text-white",
      iconInactive: "text-[#728494] group-hover:text-[#1D3C5A]",
    },
    purple: {
      active: "bg-[#1D3C5A] text-white shadow-lg shadow-[#1D3C5A]/20",
      inactive: "text-[#5E6A76] hover:bg-[#E6EEF5] hover:text-[#1D3C5A]",
      iconActive: "text-white",
      iconInactive: "text-[#728494] group-hover:text-[#1D3C5A]",
    },
    blue: {
      active: "bg-[#2F6DB5] text-white shadow-lg shadow-[#2F6DB5]/20",
      inactive: "text-[#5E6A76] hover:bg-[#E6EEF5] hover:text-[#2F6DB5]",
      iconActive: "text-white",
      iconInactive: "text-[#728494] group-hover:text-[#2F6DB5]",
    },
  };

  const colors = colorClasses[color] || colorClasses.orange;

  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive ? colors.active : colors.inactive
      }`}
    >
      <Icon
        size={20}
        className={isActive ? colors.iconActive : colors.iconInactive}
      />
      <span className={`font-medium ${isActive ? "text-white" : ""}`}>
        {label}
      </span>
    </button>
  );
};

export const DashboardLayout = ({
  children,
  activeTab,
  setActiveTab,
  role = "student",
  user,
  navigationItems = [],
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUser = user || auth.getCurrentUser();
  const navigate = useNavigate();
  const toast = useToast();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    const confirmed = await toast.confirm({
      title: "Logout?",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      danger: true,
    });
    if (confirmed) {
      await auth.logout();
      navigate("/");
      toast.success("You have been successfully logged out!");
    }
  };

  // Role-specific configurations
  const roleConfig = {
    student: {
      color: "orange",
      bgGradient: "from-[#E6EEF5] via-white to-[#D3E3EE]/40",
      borderColor: "border-[#C9D8E4]",
      hoverColor: "hover:text-[#1D3C5A]",
      profileTitle: "Student Profile",
      overviewTitle: "Dashboard Overview",
    },
    faculty: {
      color: "orange",
      bgGradient: "from-[#E6EEF5] via-white to-[#D3E3EE]/40",
      borderColor: "border-[#C9D8E4]",
      hoverColor: "hover:text-[#1D3C5A]",
      profileTitle: "Faculty Profile",
      overviewTitle: "Dashboard Overview",
    },
    industry: {
      color: "orange",
      bgGradient: "from-[#E6EEF5] via-white to-[#D3E3EE]/40",
      borderColor: "border-[#C9D8E4]",
      hoverColor: "hover:text-[#1D3C5A]",
      profileTitle: "Industry Profile",
      overviewTitle: "Dashboard Overview",
    },
  };

  const config = roleConfig[role];

  // Default navigation items based on role
  const getDefaultNavItems = () => {
    switch (role) {
      case "student":
        return [
          { icon: MessageSquare, label: "Community Posts", id: "posts" },
          { icon: Briefcase, label: "TaskMania", id: "taskmania" },
          { icon: BookOpen, label: "Virtual CV", id: "virtual-cv" },
          { icon: GraduationCap, label: "My Profile", id: "profile" },
        ];
      case "faculty":
        return [
          { icon: Home, label: "Faculty Home", id: "home" },
          { icon: MessageSquare, label: "Community Posts", id: "posts" },
          { icon: UserCheck, label: "Mentor Requests", id: "requests" },
          { icon: User, label: "My Profile", id: "profile" },
        ];
      case "industry":
        return [
          { icon: Building, label: "Industry Profile", id: "profile" },
          { icon: Users, label: "Community", id: "community" },
          { icon: Briefcase, label: "My Tasks", id: "tasks" },
          { icon: LayoutDashboard, label: "Overview", id: "overview" },
        ];
      default:
        return [];
    }
  };

  const navItems =
    navigationItems.length > 0 ? navigationItems : getDefaultNavItems();

  const getPageTitle = () => {
    const item = navItems.find((item) => item.id === activeTab);
    if (item) return item.label;

    // Fallback titles
    if (activeTab === "profile") return config.profileTitle;
    if (activeTab === "overview") return config.overviewTitle;
    return "Dashboard";
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex overflow-hidden`}
    >
      {/* Role-specific Sidebars */}
      {role === "student" && (
        <StudentSidebar
          user={currentUser}
          activeView={activeTab}
          onNavigate={setActiveTab}
        />
      )}
      {role === "faculty" && (
        <FacultySidebar
          user={currentUser}
          activeView={activeTab}
          onNavigate={setActiveTab}
        />
      )}

      {/* Default Sidebar for Industry and other roles */}
      {role !== "student" && role !== "faculty" && (
        <>
          {/* Sidebar for Desktop */}
          <aside
            className={`hidden md:flex flex-col w-64 bg-white border-r ${config.borderColor} h-screen sticky top-0 shadow-sm z-20`}
          >
            <div className="p-6 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg bg-${config.color}-500 flex items-center justify-center`}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-800">
                vibe.
              </span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
              {navItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  id={item.id}
                  activeTab={activeTab}
                  onClick={setActiveTab}
                  color={config.color}
                />
              ))}
            </nav>

            <div className={`p-4 border-t ${config.borderColor}`}>
              <div
                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-${config.color}-50 transition-colors cursor-pointer group`}
              >
                <Avatar
                  name={currentUser?.name || currentUser?.email?.split("@")[0] || "User"}
                  src={currentUser?.avatar}
                  className={`w-10 h-10 rounded-full border-2 border-${config.color}-200`}
                  initialsClassName="text-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {currentUser?.name ||
                      currentUser?.email?.split("@")[0] ||
                      "User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate capitalize">
                    {currentUser?.role || role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className={`text-slate-400 ${config.hoverColor} transition-colors p-1 rounded-lg hover:bg-red-50 hover:text-red-500 group-hover:scale-110`}
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Mobile Header & Content */}
      <div
        className={`flex-1 flex flex-col h-screen overflow-hidden ${role === "student" ? "lg:ml-80 xl:ml-96" : role === "faculty" ? "lg:ml-28 xl:ml-28" : ""}`}
      >
        {/* Mobile Header - Only show for non-student/faculty roles */}
        {role !== "student" && role !== "faculty" && (
          <header
            className={`md:hidden bg-white border-b ${config.borderColor} p-4 flex items-center justify-between sticky top-0 z-30`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg bg-${config.color}-500 flex items-center justify-center`}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">vibe.</span>
            </div>
            <button
              onClick={toggleMobileMenu}
              className={`text-slate-600 ${config.hoverColor}`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </header>
        )}

        {/* Mobile Menu Overlay - Only for non-student/faculty roles */}
        {role !== "student" && role !== "faculty" && isMobileMenuOpen && (
          <div className="absolute inset-0 z-40 bg-white pt-20 px-6 md:hidden">
            <nav className="space-y-4">
              {navItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  id={item.id}
                  activeTab={activeTab}
                  onClick={(id) => {
                    setActiveTab(id);
                    toggleMobileMenu();
                  }}
                  color={config.color}
                />
              ))}

              {/* Mobile Logout Button */}
              <div className="pt-4 mt-8 border-t border-gray-200">
                <button
                  onClick={() => {
                    toggleMobileMenu();
                    handleLogout();
                  }}
                  className="flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut
                    size={20}
                    className="text-slate-400 group-hover:text-red-500"
                  />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Desktop Topbar - Hidden for student/faculty on mobile */}
        <header
          className={`${role === "student" || role === "faculty" ? "hidden lg:flex" : "hidden md:flex"} items-center justify-between px-8 py-5 bg-transparent`}
        >
          <h1
            className={`text-2xl font-bold ${
              activeTab === "profile" || activeTab === "overview"
                ? "text-3xl"
                : "text-slate-800"
            }`}
          >
            {activeTab === "profile" || activeTab === "overview" ? (
              <span
                className={`bg-gradient-to-r from-${config.color}-600 via-${config.color}-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm font-black tracking-tight`}
              >
                {getPageTitle()}
              </span>
            ) : (
              <span className="capitalize text-slate-800">
                {getPageTitle()}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content Area - Extra bottom padding for student/faculty mobile navigation */}
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-8 pt-0 scroll-smooth ${
            role === "student" || role === "faculty"
              ? "pb-24 lg:pb-8"
              : "pb-20 md:pb-8"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
