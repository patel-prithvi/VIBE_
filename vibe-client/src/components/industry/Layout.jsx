import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { CURRENT_USER } from "../constants";
import Avatar from "../shared/Avatar";

const SidebarItem = ({ icon: Icon, label, id, activeTab, onClick }) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive
          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
          : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
      }`}
    >
      <Icon
        size={20}
        className={
          isActive ? "text-white" : "text-slate-400 group-hover:text-orange-500"
        }
      />
      <span className={`font-medium ${isActive ? "text-white" : ""}`}>
        {label}
      </span>
    </button>
  );
};

export const Layout = ({ children, activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-orange-100 h-screen sticky top-0 shadow-sm z-20">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="w-5 h-5 text-white"
            >
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800">
            vibe.
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem
            icon={Building}
            label="Industry Profile"
            id="profile"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <SidebarItem
            icon={Users}
            label="Community"
            id="community"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <SidebarItem
            icon={Briefcase}
            label="My Tasks"
            id="tasks"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <SidebarItem
            icon={LayoutDashboard}
            label="Overview"
            id="overview"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
        </nav>

        <div className="p-4 border-t border-orange-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer">
            <Avatar
              name={CURRENT_USER.name}
              src={CURRENT_USER.avatarUrl}
              className="w-10 h-10 rounded-full border-2 border-orange-200"
              initialsClassName="text-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {CURRENT_USER.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {CURRENT_USER.companyName}
              </p>
            </div>
            <LogOut
              size={18}
              className="text-slate-400 hover:text-orange-500"
            />
          </div>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-orange-100 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="w-5 h-5 text-white"
              >
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800">vibe.</span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="text-slate-600 hover:text-orange-500"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-40 bg-white pt-20 px-6 md:hidden">
            <nav className="space-y-4">
              <SidebarItem
                icon={Building}
                label="Industry Profile"
                id="profile"
                activeTab={activeTab}
                onClick={(id) => {
                  setActiveTab(id);
                  toggleMobileMenu();
                }}
              />
              <SidebarItem
                icon={Users}
                label="Community"
                id="community"
                activeTab={activeTab}
                onClick={(id) => {
                  setActiveTab(id);
                  toggleMobileMenu();
                }}
              />
              <SidebarItem
                icon={Briefcase}
                label="My Tasks"
                id="tasks"
                activeTab={activeTab}
                onClick={(id) => {
                  setActiveTab(id);
                  toggleMobileMenu();
                }}
              />
              <SidebarItem
                icon={LayoutDashboard}
                label="Overview"
                id="overview"
                activeTab={activeTab}
                onClick={(id) => {
                  setActiveTab(id);
                  toggleMobileMenu();
                }}
              />
            </nav>
          </div>
        )}

        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-transparent">
          {activeTab === "tasks" ? (
            <div></div>
          ) : (
            <h1
              className={`text-2xl font-bold ${
                activeTab === "profile" || activeTab === "overview"
                  ? "text-3xl"
                  : "text-slate-800"
              }`}
            >
              {activeTab === "profile" ? (
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm font-black tracking-tight">
                  Industry Profile
                </span>
              ) : activeTab === "overview" ? (
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm font-black tracking-tight">
                  Dashboard Overview
                </span>
              ) : (
                <span className="capitalize">
                  {activeTab === "community" ? "Community Hub" : activeTab}
                </span>
              )}
            </h1>
          )}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-orange-500 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-2 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
            </button>
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-0 pb-20 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};
