import React, { useState } from "react";
import {
  Home,
  Users,
  FileText,
  Briefcase,
  Bookmark,
  User,
  LogOut,
  MoreHorizontal,
  X,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import { useScrollLock } from "../../hooks/useScrollLock";

export const MobileBottomNav = ({
  role = "student",
  activeView = "home",
  onNavigate,
  onLogout,
  onOpenCreatePost,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  useScrollLock(isMoreOpen);

  // Active view helper matching dashboard logic
  const isHomeActive =
    activeView === "home" || activeView === "posts" || activeView === "overview";
  const isMentorshipActive =
    activeView === "mentorship" || activeView === "requests";
  const isCvActive =
    activeView === "cv-analysis" || activeView === "virtual-cv";
  const isTaskManiaActive =
    activeView === "taskmania" || (role === "industry" && activeView === "tasks");
  const isTasksActive = activeView === "tasks";
  const isCommunityActive = activeView === "community";
  const isBookmarksActive = activeView === "bookmarks";
  const isProfileActive = activeView === "profile";

  // Check if active view is one of the secondary items inside "More"
  const isMoreActive =
    role === "student"
      ? isBookmarksActive || isProfileActive
      : false;

  const handleTabClick = (viewId) => {
    setIsMoreOpen(false);
    if (onNavigate) {
      onNavigate(viewId);
    }
  };

  const handleLogoutClick = () => {
    setIsMoreOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {/* Fixed Bottom Navigation Bar (Mobile only, hidden on md and up) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-4px_20px_rgba(15,23,42,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] select-none"
      >
        <div className="grid grid-cols-5 items-center justify-around h-16 px-1.5 max-w-lg mx-auto">
          {/* Tab 1: Home */}
          <button
            type="button"
            onClick={() => handleTabClick(role === "industry" ? "overview" : "home")}
            aria-label="Home Feed"
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              isHomeActive
                ? "text-[#6D3DF5] font-bold"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Home size={20} strokeWidth={isHomeActive ? 2.5 : 2} />
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[58px]">
              Home
            </span>
          </button>

          {/* Tab 2: Mentorship (Faculty/Student) or My Tasks (Industry) */}
          {role === "industry" ? (
            <button
              type="button"
              onClick={() => handleTabClick("tasks")}
              aria-label="My Tasks"
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isTasksActive
                  ? "text-[#6D3DF5] font-bold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Briefcase size={20} strokeWidth={isTasksActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[58px]">
                My Tasks
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTabClick("mentorship")}
              aria-label="Mentorship"
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isMentorshipActive
                  ? "text-[#6D3DF5] font-bold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Users size={20} strokeWidth={isMentorshipActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[58px]">
                {role === "faculty" ? "Requests" : "Mentors"}
              </span>
            </button>
          )}

          {/* Tab 3: Virtual CV (Student), Bookmarks (Faculty), or Community (Industry) */}
          {role === "industry" ? (
            <button
              type="button"
              onClick={() => handleTabClick("community")}
              aria-label="Community"
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isCommunityActive
                  ? "text-[#6D3DF5] font-bold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Users size={20} strokeWidth={isCommunityActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[58px]">
                Community
              </span>
            </button>
          ) : role === "student" ? (
            <button
              type="button"
              onClick={() => handleTabClick("cv-analysis")}
              aria-label="CV Analysis"
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isCvActive
                  ? "text-[#6D3DF5] font-bold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <FileText size={20} strokeWidth={isCvActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[58px]">
                Virtual CV
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTabClick("bookmarks")}
              aria-label="Bookmarks"
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isBookmarksActive
                  ? "text-[#6D3DF5] font-bold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Bookmark size={20} strokeWidth={isBookmarksActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[58px]">
                Bookmarks
              </span>
            </button>
          )}

          {/* Tab 4: TaskMania (Student), Profile (Faculty), or Profile (Industry) */}
          {role === "industry" ? (
            <button
              type="button"
              onClick={() => handleTabClick("profile")}
              aria-label="My Profile"
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isProfileActive
                  ? "text-[#6D3DF5] font-bold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <User size={20} strokeWidth={isProfileActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[58px]">
                Profile
              </span>
            </button>
          ) : role === "student" ? (
            <button
              type="button"
              onClick={() => handleTabClick("taskmania")}
              aria-label="TaskMania"
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isTaskManiaActive
                  ? "text-[#6D3DF5] font-bold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Briefcase size={20} strokeWidth={isTaskManiaActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[58px]">
                TaskMania
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTabClick("profile")}
              aria-label="My Profile"
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isProfileActive
                  ? "text-[#6D3DF5] font-bold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <User size={20} strokeWidth={isProfileActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[58px]">
                Profile
              </span>
            </button>
          )}

          {/* Tab 5: More Menu Button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            aria-label={isMoreOpen ? "Close menu" : "Open more options"}
            aria-expanded={isMoreOpen}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
              isMoreActive || isMoreOpen
                ? "text-[#6D3DF5] font-bold"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <MoreHorizontal
              size={20}
              strokeWidth={isMoreActive || isMoreOpen ? 2.5 : 2}
            />
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[58px]">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* "More" Slide-up Drawer Modal */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsMoreOpen(false)}
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity touch-none"
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div role="dialog" aria-modal="true" className="relative bg-white rounded-t-3xl border-t border-[#E2E8F0] shadow-2xl p-5 z-10 pb-[max(2rem,env(safe-area-inset-bottom,16px))] space-y-4 animate-in slide-in-from-bottom duration-200 overscroll-contain">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">
                  Navigation & Options
                </h3>
                <p className="text-xs text-[#64748B]">
                  {role === "industry"
                    ? "Access your profile, tasks, and account"
                    : "Access your profile, bookmarks, and account"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links List */}
            <div className="space-y-1.5">
              {/* If student, show Profile and Bookmarks in More drawer */}
              {role === "student" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleTabClick("profile")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                      isProfileActive
                        ? "bg-[#F3EEFF] text-[#6D3DF5] font-bold"
                        : "text-[#1E293B] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User size={18} className={isProfileActive ? "text-[#6D3DF5]" : "text-[#64748B]"} />
                      <span>My Profile</span>
                    </div>
                    <ChevronRight size={16} className="text-[#94A3B8]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick("bookmarks")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                      isBookmarksActive
                        ? "bg-[#F3EEFF] text-[#6D3DF5] font-bold"
                        : "text-[#1E293B] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bookmark size={18} className={isBookmarksActive ? "text-[#6D3DF5]" : "text-[#64748B]"} />
                      <span>My Bookmarks</span>
                    </div>
                    <ChevronRight size={16} className="text-[#94A3B8]" />
                  </button>
                </>
              )}

              {/* If industry, show quick navigation items in More drawer */}
              {role === "industry" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleTabClick("profile")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                      isProfileActive
                        ? "bg-[#F3EEFF] text-[#6D3DF5] font-bold"
                        : "text-[#1E293B] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User size={18} className={isProfileActive ? "text-[#6D3DF5]" : "text-[#64748B]"} />
                      <span>My Profile</span>
                    </div>
                    <ChevronRight size={16} className="text-[#94A3B8]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick("tasks")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                      isTasksActive
                        ? "bg-[#F3EEFF] text-[#6D3DF5] font-bold"
                        : "text-[#1E293B] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase size={18} className={isTasksActive ? "text-[#6D3DF5]" : "text-[#64748B]"} />
                      <span>My Tasks</span>
                    </div>
                    <ChevronRight size={16} className="text-[#94A3B8]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabClick("community")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                      isCommunityActive
                        ? "bg-[#F3EEFF] text-[#6D3DF5] font-bold"
                        : "text-[#1E293B] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={18} className={isCommunityActive ? "text-[#6D3DF5]" : "text-[#64748B]"} />
                      <span>Community</span>
                    </div>
                    <ChevronRight size={16} className="text-[#94A3B8]" />
                  </button>
                </>
              )}

              {/* Quick Action: Create Post */}
              {onOpenCreatePost && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenCreatePost();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-[#1E293B] hover:bg-[#F8FAFC] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <PlusCircle size={18} className="text-[#6D3DF5]" />
                    <span>Create New Post</span>
                  </div>
                  <ChevronRight size={16} className="text-[#94A3B8]" />
                </button>
              )}

              {/* Logout Button */}
              <div className="pt-2 mt-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-[#EF4444] hover:bg-red-50 transition-all text-left"
                >
                  <LogOut size={18} className="text-[#EF4444]" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
