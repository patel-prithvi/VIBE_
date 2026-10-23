import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Users,
  MessageSquare,
  User,
  Loader2,
} from "lucide-react";
import Avatar from "../shared/Avatar";

export const IndustryRightPanel = ({
  applicants = [],
  onUpdateApplicantStatus,
  onNavigate,
  onPostTask,
}) => {
  const navigate = useNavigate();
  const [actionLoadingId, setActionLoadingId] = React.useState(null);

  // Show only applicants still awaiting review
  const pending = (Array.isArray(applicants) ? applicants : [])
    .filter((a) => {
      const s = String(a.status || "Pending").toUpperCase();
      return s === "PENDING" || s === "APPLIED";
    })
    .slice(0, 3);

  const handleAction = async (applicantId, newStatus) => {
    if (!onUpdateApplicantStatus) return;
    try {
      setActionLoadingId(applicantId);
      await onUpdateApplicantStatus(applicantId, newStatus);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <aside className="w-full min-w-0 space-y-4">
      {/* ======================================================== */}
      {/* A. Pending Applicants Card                               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] min-w-0">
          <h3 className="font-bold text-sm text-[#0F172A] tracking-tight truncate">
            Pending Applicants
          </h3>
          <button
            onClick={() => onNavigate && onNavigate("tasks")}
            className="text-xs font-semibold text-[#6D3DF5] hover:text-[#5B2FD6] flex items-center gap-1 transition-colors shrink-0 ml-2"
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Applicants List */}
        <div className="divide-y divide-[#F1F5F9] min-w-0">
          {pending.map((applicant) => (
            <div key={applicant.id} className="py-3.5 first:pt-3 last:pb-1 space-y-2.5 min-w-0">
              {/* Applicant Header */}
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div
                  onClick={() => {
                    const sid = applicant.studentId || applicant.userId || applicant.id;
                    if (sid) navigate(`/profile/${sid}`);
                  }}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group/applicant"
                >
                  <Avatar
                    name={applicant.name}
                    src={applicant.avatar}
                    className="w-9 h-9 rounded-full flex-shrink-0 object-cover ring-2 ring-[#F1F5F9] group-hover/applicant:ring-[#6D3DF5]/30 transition-all"
                    initialsClassName="text-xs font-bold text-[#172554]"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#0F172A] leading-tight truncate group-hover/applicant:text-[#6D3DF5] transition-colors">
                      {applicant.name}
                    </h4>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {applicant.college}, {applicant.branch}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-medium whitespace-nowrap shrink-0">
                  {applicant.submittedAt}
                </span>
              </div>

              {/* Task Pill */}
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-2.5 text-xs text-[#334155] leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
                Applied for{" "}
                <span className="font-bold text-[#0F172A]">{applicant.taskTitle}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-0.5">
                <button
                  onClick={() => handleAction(applicant.id, "REJECTED")}
                  disabled={actionLoadingId === applicant.id}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-all disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(applicant.id, "SHORTLISTED")}
                  disabled={actionLoadingId === applicant.id}
                  className="px-4 py-1.5 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoadingId === applicant.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Shortlist"
                  )}
                </button>
              </div>
            </div>
          ))}

          {pending.length === 0 && (
            <div className="py-8 px-4 text-center space-y-1.5">
              <p className="text-xs font-bold text-[#0F172A]">No pending applicants</p>
              <p className="text-[11px] text-[#64748B]">New submissions on your tasks will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* C. Quick Actions (2x2 Grid)                              */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-0">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#64748B] mb-3">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-2.5 min-w-0">
          {/* Action 1: Post Task */}
          <button
            onClick={() => (onPostTask ? onPostTask() : onNavigate && onNavigate("tasks"))}
            className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#FAF5FF]/50 hover:bg-[#FAF5FF] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] text-[#8B5CF6] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Briefcase size={16} />
            </div>
            <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#6D3DF5] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
              Post Task
            </span>
          </button>

          {/* Action 2: View Applicants */}
          <button
            onClick={() => onNavigate && onNavigate("tasks")}
            className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#EFF6FF]/50 hover:bg-[#EFF6FF] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
          >
            <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Users size={16} />
            </div>
            <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#2563EB] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
              View Applicants
            </span>
          </button>

          {/* Action 3: Community */}
          <button
            onClick={() => onNavigate && onNavigate("community")}
            className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#FEF2F2]/50 hover:bg-[#FEF2F2] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare size={16} />
            </div>
            <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#EF4444] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
              Community
            </span>
          </button>

          {/* Action 4: My Profile */}
          <button
            onClick={() => onNavigate && onNavigate("profile")}
            className="flex flex-col items-start justify-start gap-2 p-2.5 sm:p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#FFFBEB]/50 hover:bg-[#FFFBEB] text-left transition-all group min-w-0 w-full min-h-[84px] h-full"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <User size={16} />
            </div>
            <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#D97706] transition-colors leading-tight whitespace-normal break-words [overflow-wrap:anywhere] [text-overflow:clip]">
              My Profile
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
