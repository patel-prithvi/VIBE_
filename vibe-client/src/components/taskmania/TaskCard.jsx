import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Lock,
  Globe,
  MapPin,
  FileText,
  UserPlus,
  Building2,
  Loader2,
  Clock,
  Bookmark,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { CATEGORY_ICONS } from "../constants";
import { auth } from "../../utils/auth";
import { isTaskExpired } from "../../utils/taskRelevance";

export const TaskCard = ({
  task,
  isAccepted,
  isSolutionSubmitted,
  isApplying,
  isBookmarked = false,
  onToggleBookmark,
  mentorRequest,
  onOpenInstructions,
  onApplyDirect,
  onOpenSubmitTask,
  onOpenMentorRequest,
  // Drag & Reorder props
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging = false,
  isDropTarget = false,
  onMoveTask,
}) => {
  const navigate = useNavigate();
  const isClosed = isTaskExpired(task);
  const taskId = task.id || task._id;
  const currentUser = auth.getCurrentUser();
  const rawRole = String(currentUser?.role || currentUser?.accountType || "").trim().toLowerCase();
  const isStudent = rawRole === "student";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      onClick={() => {
        if (taskId) navigate(`/tasks/${taskId}`);
      }}
      draggable={isStudent && Boolean(onDragStart)}
      onDragStart={(e) => {
        if (onDragStart) onDragStart(e, task);
      }}
      onDragOver={(e) => {
        if (onDragOver) onDragOver(e, task);
      }}
      onDragEnd={(e) => {
        if (onDragEnd) onDragEnd(e, task);
      }}
      onDrop={(e) => {
        if (onDrop) onDrop(e, task);
      }}
      className={`rounded-2xl p-4 sm:p-5 border transition-all relative overflow-hidden group flex flex-col h-full cursor-pointer ${
        isDragging
          ? "opacity-35 scale-[0.98] border-dashed border-[#6D3DF5] shadow-lg bg-[#FAF7FF]"
          : isDropTarget
          ? "border-2 border-[#6D3DF5] ring-4 ring-[#6D3DF5]/15 shadow-md bg-[#FAF7FF]"
          : isClosed
          ? "bg-slate-50/80 border-slate-200/90 hover:border-slate-300 shadow-2xs opacity-85"
          : "bg-white border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm"
      }`}
    >
      {/* Decorative Gradient Blob */}
      {!isClosed && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#F3EEFF] rounded-full blur-2xl group-hover:bg-[#EDE9FE] transition-colors duration-500 z-0 pointer-events-none" />
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Badges Row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Drag Handle & Touch/Keyboard Reorder Controls */}
            {isStudent && Boolean(onMoveTask) && (
              <div
                className="flex items-center text-slate-400 bg-slate-50 hover:bg-[#F3EEFF] rounded-lg p-0.5 border border-slate-200/80 transition-colors shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  title="Drag to reorder task"
                  aria-label="Drag to reorder task"
                  className="p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#6D3DF5] transition-colors"
                >
                  <GripVertical size={14} />
                </div>
                <div className="flex flex-col border-l border-slate-200/80 pl-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTask(task, -1);
                    }}
                    title="Move higher in priority"
                    aria-label="Move task up"
                    className="p-0.5 text-slate-400 hover:text-[#6D3DF5] hover:bg-white rounded transition-colors cursor-pointer"
                  >
                    <ChevronUp size={10} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTask(task, 1);
                    }}
                    title="Move lower in priority"
                    aria-label="Move task down"
                    className="p-0.5 text-slate-400 hover:text-[#6D3DF5] hover:bg-white rounded transition-colors cursor-pointer"
                  >
                    <ChevronDown size={10} />
                  </button>
                </div>
              </div>
            )}

            {/* Category Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border shrink-0 ${
              isClosed
                ? "text-slate-600 bg-slate-100 border-slate-200"
                : "text-[#6D3DF5] bg-[#F3EEFF] border-[#E9E1FF]"
            }`}>
              {CATEGORY_ICONS[task.category] || <Briefcase size={11} />}
              <span className="truncate">{task.category || "Development"}</span>
            </div>
          </div>

          {/* Status & Meta Badges + Bookmark */}
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {/* Deadline Passed Badge */}
            {isClosed && (
              <span className="inline-flex items-center gap-1 text-rose-700 text-[11px] font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <Clock size={11} className="text-rose-600" />
                <span>Deadline Passed</span>
              </span>
            )}

            {/* Mode Badge */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              isClosed
                ? "bg-slate-100 text-slate-600 border-slate-200"
                : "bg-[#F3EEFF] text-[#6D3DF5] border-[#E9E1FF]"
            }`}>
              {task.mode === "Remote" ? (
                <Globe size={11} />
              ) : (
                <MapPin size={11} />
              )}
              <span>{task.mode || "Remote"}</span>
            </span>

            {/* Paid Badge */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isClosed
                  ? "bg-slate-100 text-slate-500 border-slate-200"
                  : task.paid
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-gray-50 text-gray-600 border-gray-100"
              }`}
            >
              {task.paid ? "Paid" : "Unpaid"}
            </span>

            {/* Submission / Acceptance Status Badges */}
            {isSolutionSubmitted ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 size={11} className="text-emerald-600" />
                <span>Submitted</span>
              </span>
            ) : isAccepted ? (
              <span className="inline-flex items-center gap-1 text-[#6D3DF5] text-[11px] font-bold bg-[#F3EEFF] px-2 py-0.5 rounded-full border border-[#E9E1FF]">
                <Clock size={11} />
                <span>In Progress</span>
              </span>
            ) : null}

            {/* Task Bookmark Button (Students only) */}
            {isStudent && Boolean(onToggleBookmark) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof onToggleBookmark === "function") {
                    onToggleBookmark(taskId);
                  }
                }}
                title={isBookmarked ? "Remove from bookmarks" : "Save task to bookmarks"}
                aria-label={isBookmarked ? "Remove from bookmarks" : "Save task to bookmarks"}
                className={`p-1 rounded-full transition-all cursor-pointer ${
                  isBookmarked
                    ? "text-[#6D3DF5] bg-[#F3EEFF] hover:bg-[#EDE9FE]"
                    : "text-[#94A3B8] hover:text-[#6D3DF5] hover:bg-[#F8FAFC]"
                }`}
              >
                <Bookmark
                  size={13}
                  className={isBookmarked ? "fill-[#6D3DF5]" : ""}
                />
              </button>
            )}
          </div>
        </div>

        {/* Task Title */}
        <h3
          onClick={() => {
            if (taskId) navigate(`/tasks/${taskId}`);
          }}
          className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#6D3DF5] transition-colors line-clamp-2 cursor-pointer leading-snug"
          title={task.title}
        >
          {task.title}
        </h3>

        {/* Company Name */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            const companyId = task.companyId || task.createdBy?._id || task.createdBy;
            if (companyId) navigate(`/profile/${companyId}?view=company`);
          }}
          className={`inline-flex items-center gap-1.5 mt-1.5 mb-2.5 ${
            task.companyId || task.createdBy
              ? "cursor-pointer group/company"
              : ""
          }`}
        >
          <div className="p-1 bg-[#EDE9FE] text-[#6D3DF5] rounded group-hover/company:bg-[#6D3DF5] group-hover/company:text-white transition-colors">
            <Building2 size={13} />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-700 tracking-tight group-hover/company:text-[#6D3DF5] transition-colors">
            {task.company}
          </span>
        </div>

        {/* Subtle Skill Match Badge (Only on genuinely relevant tasks) */}
        {task.matchStrength && task.matchStrength !== "none" && task.matchReason && (
          <div
            className="inline-flex items-center gap-1.5 mb-2.5 px-2.5 py-1 rounded-lg bg-[#FAF5FF] border border-[#E9D5FF] text-[11px] font-medium text-[#6D3DF5] w-fit max-w-full"
            title={task.matchReason}
          >
            <Sparkles size={12} className="text-[#7C3AED] shrink-0" />
            <span className="font-bold text-[#6D3DF5] shrink-0">Skill Match:</span>
            <span className="text-[#475569] font-medium truncate">{task.matchReason}</span>
          </div>
        )}

        {/* Role */}
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-600 bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100">
          <Briefcase size={14} className="text-[#6D3DF5] shrink-0" />
          <span className="truncate">
            Role: <span className="text-gray-900 font-semibold">{task.role || "General"}</span>
          </span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-100 pt-3 mt-auto">
        {/* Deadline */}
        <div className="flex items-center justify-between mb-2.5">
          <div className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded border ${
            isClosed
              ? "text-rose-700 bg-rose-50 border-rose-200 font-semibold"
              : "text-gray-500 bg-gray-50 border-gray-100"
          }`}>
            <Calendar size={12} className={`mr-1 ${isClosed ? "text-rose-600" : "text-[#94A3B8]"}`} />
            <span>{isClosed ? "Deadline Passed: " : ""}Due {task.deadline}</span>
          </div>
        </div>

        {/* Action Controls: Instructions & Mentor */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onOpenInstructions === "function") {
                onOpenInstructions(task);
              } else if (taskId) {
                navigate(`/tasks/${taskId}`);
              }
            }}
            className={`h-9 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 group/btn cursor-pointer shadow-2xs ${
              isClosed
                ? "text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
                : "text-[#6D3DF5] bg-white border border-[#E9E1FF] hover:bg-[#6D3DF5] hover:text-white hover:border-[#6D3DF5]"
            }`}
          >
            <FileText
              size={14}
              className="group-hover/btn:scale-110 transition-transform"
            />
            <span>Instructions</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onOpenMentorRequest === "function") {
                onOpenMentorRequest(task);
              }
            }}
            className={`h-9 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 group/btn cursor-pointer shadow-2xs ${
              isClosed
                ? "text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
                : "text-[#6D3DF5] bg-white border border-[#E9E1FF] hover:bg-[#6D3DF5] hover:text-white hover:border-[#6D3DF5]"
            }`}
          >
            <UserPlus
              size={14}
              className="group-hover/btn:scale-110 transition-transform"
            />
            <span>Mentor</span>
          </button>
        </div>

        {/* Main CTA */}
        <div className="grid grid-cols-1">
          {isClosed ? (
            isSolutionSubmitted ? (
              <button
                disabled
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="h-9 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5 border border-emerald-200"
              >
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Solution Submitted</span>
              </button>
            ) : isAccepted ? (
              <button
                disabled
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="h-9 px-3 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <Lock size={14} className="text-slate-400" />
                <span>Submission Closed</span>
              </button>
            ) : (
              <button
                disabled
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="h-9 px-3 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <Lock size={14} className="text-slate-400" />
                <span>Application Closed</span>
              </button>
            )
          ) : isSolutionSubmitted ? (
            <button
              disabled
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="h-9 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5 border border-emerald-200"
            >
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Solution Submitted</span>
            </button>
          ) : isAccepted ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onOpenSubmitTask === "function") {
                  onOpenSubmitTask(task);
                }
              }}
              className="h-9 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText size={14} />
              <span>Submit Task</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onApplyDirect === "function") {
                  onApplyDirect(task);
                }
              }}
              disabled={isApplying}
              className="h-9 px-3 text-xs font-bold text-white bg-[#6D3DF5] hover:bg-[#5B2FD6] rounded-lg shadow-sm shadow-[#6D3DF5]/20 hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isApplying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Applying...</span>
                </>
              ) : (
                <>
                  <span>Apply Now</span>
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
