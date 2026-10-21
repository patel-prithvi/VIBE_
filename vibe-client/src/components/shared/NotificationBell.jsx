import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  UserPlus,
  CheckCircle2,
  XCircle,
  FileText,
  Star,
  MessageSquare,
  Briefcase,
  PartyPopper,
  Info,
  Repeat2,
  Heart,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

const TYPE_ICON = {
  mentor_request: UserPlus,
  request_accepted: CheckCircle2,
  request_rejected: XCircle,
  submission_received: FileText,
  submission_reviewed: Star,
  comment: MessageSquare,
  repost: Repeat2,
  reaction: Heart,
  hired: PartyPopper,
  task_posted: Briefcase,
  system: Info,
};

const timeAgo = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/**
 * Live notification bell with dropdown. Drop-in replacement for the
 * decorative bells in the dashboard headers.
 */
export const NotificationBell = ({ iconClassName = "text-[#64748B]" }) => {
  const navigate = useNavigate();
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const handleOpen = async (note) => {
    if (!note.isRead) await markRead(note._id);
    setOpen(false);
    if (note.link) navigate(note.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors"
      >
        <Bell size={20} className={iconClassName} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full ring-2 ring-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
            <p className="text-sm font-bold text-[#0F172A]">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-bold text-[#6D3DF5] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-[#64748B]">
                No notifications yet.
              </p>
            ) : (
              items.slice(0, 10).map((note) => {
                const Icon = TYPE_ICON[note.type] || Info;
                return (
                  <button
                    key={note._id}
                    onClick={() => handleOpen(note)}
                    className={`w-full text-left px-4 py-3 flex gap-3 border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors ${
                      note.isRead ? "" : "bg-[#F5F1FF]/60"
                    }`}
                  >
                    <span className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#6D3DF5] flex items-center justify-center flex-shrink-0">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-[#0F172A] truncate">
                        {note.title}
                      </span>
                      <span className="block text-xs text-[#64748B] line-clamp-2">
                        {note.message}
                      </span>
                      <span className="block text-[10px] text-[#94A3B8] mt-0.5">
                        {timeAgo(note.createdAt)}
                      </span>
                    </span>
                    {!note.isRead && (
                      <span className="w-2 h-2 mt-1.5 bg-[#6D3DF5] rounded-full flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
