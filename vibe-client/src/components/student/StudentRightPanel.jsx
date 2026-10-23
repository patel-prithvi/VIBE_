import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Users,
  FileText,
  Plus,
  Loader2,
  Zap,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import api from "../../services/api";

const statusStyles = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  accepted: "bg-green-50 text-green-600 border-green-100",
  rejected: "bg-red-50 text-red-600 border-red-100",
};

export const StudentRightPanel = ({ onNavigate, onOpenCreatePost }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/mentor-requests/my-requests");
        if (res.data && res.data.data) {
          setRequests(res.data.data.slice(0, 3));
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
    fetchRequests();
  }, []);

  return (
    <aside className="w-full min-w-0 space-y-4">
      {/* ======================================================== */}
      {/* A. My Mentor Requests Card                              */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] min-w-0">
          <h3 className="font-bold text-sm text-[#0F172A] tracking-tight truncate">
            My Mentor Requests
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
          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 size={18} className="text-[#6D3DF5] animate-spin" />
            </div>
          ) : (
            requests.map((req) => {
              const facultyName = req.faculty?.name || "Mentor";
              const status = (req.status || "pending").toLowerCase();
              const style = statusStyles[status] || statusStyles.pending;
              return (
                <div key={req._id} className="py-3.5 first:pt-3 last:pb-1 space-y-2 min-w-0">
                  <div
                    onClick={() => {
                      const fid = req.faculty?._id || req.faculty?.id;
                      if (fid) navigate(`/profile/${fid}`);
                    }}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer group/mentor"
                  >
                    <Avatar
                      name={facultyName}
                      src={req.faculty?.ImageUrl}
                      className="w-9 h-9 rounded-full flex-shrink-0 object-cover ring-2 ring-[#F1F5F9]"
                      initialsClassName="text-xs font-bold text-[#172554]"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0F172A] leading-tight truncate">
                        {facultyName}
                      </h4>
                      <p className="text-[11px] text-[#64748B] truncate">
                        {req.task?.title || "Mentorship session"}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${style}`}>
                      {status}
                    </span>
                  </div>
                  {req.meetLink && status === "accepted" && (
                    <a
                      href={req.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6D3DF5] hover:text-[#5B2FD6] transition-colors"
                    >
                      Join session <ArrowRight size={11} />
                    </a>
                  )}
                </div>
              );
            })
          )}

          {!loading && requests.length === 0 && (
            <div className="py-8 px-4 text-center space-y-1.5">
              <p className="text-xs font-bold text-[#0F172A]">No mentor requests yet</p>
              <p className="text-[11px] text-[#64748B]">Request guidance from faculty mentors on tasks you solve.</p>
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
            {/* Action 1: Create Post */}
            <button
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#FAF5FF]/50 hover:bg-[#FAF5FF] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] text-[#8B5CF6] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Plus size={16} />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#6D3DF5] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
                Create Post
              </span>
            </button>

            {/* Action 2: Browse Tasks */}
            <button
              onClick={() => onNavigate && onNavigate("taskmania")}
              className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#EFF6FF]/50 hover:bg-[#EFF6FF] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
            >
              <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Briefcase size={16} />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
                Browse Tasks
              </span>
            </button>

            {/* Action 3: My Requests */}
            <button
              onClick={() => onNavigate && onNavigate("requests")}
              className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#FEF2F2]/50 hover:bg-[#FEF2F2] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Users size={16} />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#EF4444] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
                My Requests
              </span>
            </button>

            {/* Action 4: Virtual CV */}
            <button
              onClick={() => onNavigate && onNavigate("virtual-cv")}
              className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#FFFBEB]/50 hover:bg-[#FFFBEB] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText size={16} />
              </div>
              <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#D97706] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
                Virtual CV
              </span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
