import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  BookOpen,
  MessageSquare,
  Bookmark,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  Plus,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import api from "../../services/api";
import { useToast } from "../Toast";

export const FacultyRightPanel = ({
  onNavigate,
  onOpenCreatePost,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);


  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/mentor-requests/faculty-requests");
      if (res.data && res.data.data) {
        // Filter only pending requests for the Home dashboard preview
        const pending = res.data.data.filter((r) => r.status === "pending" || !r.status);
        const mapped = pending.map((req) => ({
          id: req._id,
          student: {
            id: req.student?._id || req.student?.id,
            name: req.student?.name || "Student",
            avatar: req.student?.ImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.student?.name || "Student")}&background=random`,
            year: req.student?.Profile?.YearOfStudy ? `${req.student.Profile.YearOfStudy} year` : "Student",
            branch: req.student?.Profile?.Branch || req.task?.category || "Computer Science",
          },
          timeAgo: new Date(req.createdAt).toLocaleDateString(),
          message: req.message || (req.task ? `Requesting mentorship on "${req.task.title}"` : "Requesting mentorship session."),
          status: req.status || "pending",
        }));
        setRequests(mapped.slice(0, 3));
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.warn("Could not fetch mentor requests:", err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setActionLoadingId(requestId);
      await api.patch(`/mentor-requests/update-status/${requestId}`, {
        status: "accepted",
        meetLink: "https://meet.google.com/vibe-session",
        resources: [],
      });
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success("Mentorship request accepted!");
    } catch (err) {
      console.error("Error accepting request:", err);
      toast.error(err.response?.data?.message || "Failed to update request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      setActionLoadingId(requestId);
      await api.patch(`/mentor-requests/update-status/${requestId}`, {
        status: "rejected",
      });
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.info("Mentorship request declined.");
    } catch (err) {
      console.error("Error declining request:", err);
      toast.error(err.response?.data?.message || "Failed to decline request");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <aside className="w-full min-w-0 space-y-4">
      {/* ======================================================== */}
      {/* A. Student Mentorship Requests Card                      */}
      {/* ======================================================== */}
      <div className="vibe-card p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] min-w-0">
          <h3 className="font-bold text-sm text-[#0F172A] tracking-tight truncate">
            Student Mentorship Requests
          </h3>
          <button
            onClick={() => onNavigate && onNavigate("requests")}
            className="text-xs font-semibold text-[#6D3DF5] hover:text-[#5B2FD6] flex items-center gap-1 transition-colors shrink-0 ml-2"
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-[#F1F5F9] min-w-0">
          {requests.map((req) => (
            <div key={req.id} className="py-3.5 first:pt-3 last:pb-1 space-y-2.5 min-w-0">
              {/* Student Header */}
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div
                  onClick={() => {
                    const sid = req.student?.id;
                    if (sid) navigate(`/profile/${sid}`);
                  }}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group/student"
                >
                  <Avatar
                    name={req.student.name}
                    src={req.student.avatar}
                    className="w-9 h-9 rounded-full flex-shrink-0 object-cover ring-2 ring-[#F1F5F9] group-hover/student:ring-[#6D3DF5]/30 transition-all"
                    initialsClassName="text-xs font-bold text-[#172554]"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#0F172A] leading-tight truncate group-hover/student:text-[#6D3DF5] transition-colors">
                      {req.student.name}
                    </h4>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {req.student.year}, {req.student.branch}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-medium whitespace-nowrap shrink-0">
                  {req.timeAgo}
                </span>
              </div>

              {/* Message Pill */}
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-2.5 text-xs text-[#334155] leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
                {req.message}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-0.5">
                <button
                  onClick={() => handleDecline(req.id)}
                  disabled={actionLoadingId === req.id}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-all disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={actionLoadingId === req.id}
                  className="px-4 py-1.5 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoadingId === req.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Accept"
                  )}
                </button>
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="py-8 px-4 text-center space-y-1.5">
              <p className="text-xs font-bold text-[#0F172A]">No pending mentorship requests</p>
              <p className="text-[11px] text-[#64748B]">You'll see student requests here when someone reaches out.</p>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* C. Quick Actions (Small Square Button which opens up)    */}
      {/* ======================================================== */}
      {!isQuickActionsOpen ? (
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setIsQuickActionsOpen(true)}
            className="w-10 h-10 rounded-xl bg-white hover:bg-[#F3EEFF] border border-[#E2E8F0] hover:border-[#6D3DF5] text-[#6D3DF5] shadow-xs flex items-center justify-center transition-all cursor-pointer group shrink-0"
            title="Open Quick Actions"
            aria-label="Open Quick Actions"
          >
            <Zap size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <span
            onClick={() => setIsQuickActionsOpen(true)}
            className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-[#64748B] hover:text-[#6D3DF5] cursor-pointer transition-colors select-none"
          >
            Quick Actions
          </span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-0 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Zap size={14} className="text-[#6D3DF5]" />
              Quick Actions
            </h3>
            <button
              type="button"
              onClick={() => setIsQuickActionsOpen(false)}
              className="w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#F3EEFF] text-[#64748B] hover:text-[#6D3DF5] border border-[#E2E8F0] flex items-center justify-center transition-all cursor-pointer"
              title="Close Quick Actions"
              aria-label="Close Quick Actions"
            >
              <Plus size={16} className="rotate-45" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 min-w-0">
          {/* Action 1: Create Event */}
          <button
            onClick={() => onOpenCreatePost && onOpenCreatePost()}
            className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#FAF5FF]/50 hover:bg-[#FAF5FF] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] text-[#8B5CF6] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Calendar size={16} />
            </div>
            <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#6D3DF5] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
              Create Event
            </span>
          </button>

          {/* Action 2: Share Resource */}
          <button
            onClick={() => onOpenCreatePost && onOpenCreatePost()}
            className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#EFF6FF]/50 hover:bg-[#EFF6FF] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
          >
            <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen size={16} />
            </div>
            <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
              Share Resource
            </span>
          </button>

          {/* Action 3: Post Guidance */}
          <button
            onClick={() => onOpenCreatePost && onOpenCreatePost()}
            className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#FEF2F2]/50 hover:bg-[#FEF2F2] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare size={16} />
            </div>
            <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#EF4444] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
              Post Guidance
            </span>
          </button>

          {/* Action 4: View Bookmarks */}
          <button
            onClick={() => onNavigate && onNavigate("bookmarks")}
            className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#FFFBEB]/50 hover:bg-[#FFFBEB] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Bookmark size={16} />
            </div>
            <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#D97706] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
              View Bookmarks
            </span>
          </button>
        </div>
      </div>
      )}
    </aside>
  );
};
