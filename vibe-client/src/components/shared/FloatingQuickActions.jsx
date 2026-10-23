import React, { useState, useEffect } from "react";
import {
  Zap,
  Plus,
  Calendar,
  BookOpen,
  MessageSquare,
  Bookmark,
  Briefcase,
  Users,
  FileText,
} from "lucide-react";

/**
 * Floating Quick Actions button for mobile/tablet screens (< lg).
 * - position: fixed near bottom-right, above the mobile bottom navigation bar.
 * - Icon-only button with large touch target and subtle shadow.
 * - Toggles an elevated 2x2 actions panel matching student/faculty dashboard actions.
 * - Hidden on desktop (lg:hidden) where right sidebar panels are displayed.
 */
export const FloatingQuickActions = ({
  role = "student",
  onNavigate,
  onOpenCreatePost,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Actions configuration per role
  const actions =
    role === "faculty"
      ? [
          {
            id: "create-event",
            label: "Create Event",
            icon: Calendar,
            bgIcon: "bg-[#F3E8FF]",
            textIcon: "text-[#8B5CF6]",
            textHover: "group-hover:text-[#6D3DF5]",
            bgCard: "bg-[#FAF5FF]/50 hover:bg-[#FAF5FF]",
            onClick: () => onOpenCreatePost && onOpenCreatePost(),
          },
          {
            id: "share-resource",
            label: "Share Resource",
            icon: BookOpen,
            bgIcon: "bg-[#DBEAFE]",
            textIcon: "text-[#2563EB]",
            textHover: "group-hover:text-[#2563EB]",
            bgCard: "bg-[#EFF6FF]/50 hover:bg-[#EFF6FF]",
            onClick: () => onOpenCreatePost && onOpenCreatePost(),
          },
          {
            id: "post-guidance",
            label: "Post Guidance",
            icon: MessageSquare,
            bgIcon: "bg-[#FEE2E2]",
            textIcon: "text-[#EF4444]",
            textHover: "group-hover:text-[#EF4444]",
            bgCard: "bg-[#FEF2F2]/50 hover:bg-[#FEF2F2]",
            onClick: () => onOpenCreatePost && onOpenCreatePost(),
          },
          {
            id: "view-bookmarks",
            label: "View Bookmarks",
            icon: Bookmark,
            bgIcon: "bg-[#FEF3C7]",
            textIcon: "text-[#D97706]",
            textHover: "group-hover:text-[#D97706]",
            bgCard: "bg-[#FFFBEB]/50 hover:bg-[#FFFBEB]",
            onClick: () => onNavigate && onNavigate("bookmarks"),
          },
        ]
      : [
          {
            id: "create-post",
            label: "Create Post",
            icon: Plus,
            bgIcon: "bg-[#F3E8FF]",
            textIcon: "text-[#8B5CF6]",
            textHover: "group-hover:text-[#6D3DF5]",
            bgCard: "bg-[#FAF5FF]/50 hover:bg-[#FAF5FF]",
            onClick: () => onOpenCreatePost && onOpenCreatePost(),
          },
          {
            id: "browse-tasks",
            label: "Browse Tasks",
            icon: Briefcase,
            bgIcon: "bg-[#DBEAFE]",
            textIcon: "text-[#2563EB]",
            textHover: "group-hover:text-[#2563EB]",
            bgCard: "bg-[#EFF6FF]/50 hover:bg-[#EFF6FF]",
            onClick: () => onNavigate && onNavigate("taskmania"),
          },
          {
            id: "my-requests",
            label: "My Requests",
            icon: Users,
            bgIcon: "bg-[#FEE2E2]",
            textIcon: "text-[#EF4444]",
            textHover: "group-hover:text-[#EF4444]",
            bgCard: "bg-[#FEF2F2]/50 hover:bg-[#FEF2F2]",
            onClick: () => onNavigate && onNavigate("requests"),
          },
          {
            id: "virtual-cv",
            label: "Virtual CV",
            icon: FileText,
            bgIcon: "bg-[#FEF3C7]",
            textIcon: "text-[#D97706]",
            textHover: "group-hover:text-[#D97706]",
            bgCard: "bg-[#FFFBEB]/50 hover:bg-[#FFFBEB]",
            onClick: () => onNavigate && onNavigate("virtual-cv"),
          },
        ];

  return (
    <>
      {/* Light Backdrop when Panel is open (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40 lg:hidden animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Panel Popup (mobile only) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Quick Actions"
          className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:bottom-20 right-4 left-4 sm:left-auto sm:w-80 bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_12px_36px_rgba(15,23,42,0.16)] z-50 lg:hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Zap size={14} className="text-[#6D3DF5]" />
              Quick Actions
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#F3EEFF] text-[#64748B] hover:text-[#6D3DF5] border border-[#E2E8F0] flex items-center justify-center transition-all cursor-pointer"
              title="Close Quick Actions"
              aria-label="Close Quick Actions"
            >
              <Plus size={16} className="rotate-45" />
            </button>
          </div>

          {/* 2x2 Actions Grid */}
          <div className="grid grid-cols-2 gap-2.5 min-w-0">
            {actions.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  act.onClick();
                }}
                className={`flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] ${act.bgCard} text-left transition-all group min-w-0 w-full min-h-[84px] h-full cursor-pointer`}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${act.bgIcon} ${act.textIcon} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <act.icon size={16} />
                </div>
                <span
                  className={`text-xs font-bold text-[#1E293B] ${act.textHover} transition-colors leading-tight whitespace-normal break-words`}
                >
                  {act.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button (Mobile view only: lg:hidden) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 md:right-6 z-30 lg:hidden w-12 h-12 rounded-2xl bg-white hover:bg-[#F3EEFF] active:scale-95 border border-[#E2E8F0] hover:border-[#6D3DF5] text-[#6D3DF5] shadow-[0_4px_16px_rgba(109,61,245,0.18)] hover:shadow-[0_6px_20px_rgba(109,61,245,0.25)] flex items-center justify-center transition-all cursor-pointer group shrink-0 select-none ${
          isOpen ? "ring-2 ring-[#6D3DF5] bg-[#F3EEFF]" : ""
        }`}
        title={isOpen ? "Close Quick Actions" : "Open Quick Actions"}
        aria-label={isOpen ? "Close Quick Actions" : "Open Quick Actions"}
        aria-expanded={isOpen}
      >
        <Zap
          size={20}
          className={`transition-transform duration-200 ${
            isOpen ? "scale-110 fill-[#6D3DF5]/20" : "group-hover:scale-110"
          }`}
        />
      </button>
    </>
  );
};

export default FloatingQuickActions;
