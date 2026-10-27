import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Building2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Paperclip,
  Clock,
  Briefcase,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { useScrollLock } from "../../hooks/useScrollLock";
import { isTaskExpired } from "../../utils/taskRelevance";

export const InstructionModal = ({
  isOpen,
  onClose,
  task,
  isAccepted,
  isSolutionSubmitted,
  isApplying,
  onViewDetails,
  onApplyDirect,
  onOpenSubmitTask,
}) => {
  useScrollLock(Boolean(isOpen && task));

  if (!isOpen || !task) return null;

  // Normalize instructions into an array of strings
  const getInstructionsList = () => {
    if (!task.instructions) return [];
    if (Array.isArray(task.instructions)) {
      return task.instructions.filter(Boolean);
    }
    if (typeof task.instructions === "string") {
      try {
        const parsed = JSON.parse(task.instructions);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        // Not JSON
      }
      return [task.instructions];
    }
    if (task.instructions.steps && Array.isArray(task.instructions.steps)) {
      return task.instructions.steps.filter(Boolean);
    }
    return [];
  };

  const instructionsList = getInstructionsList();
  const hasMaterials = Array.isArray(task.materials) && task.materials.length > 0;
  const isClosed = isTaskExpired(task);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 z-10"
        >
          {/* Header */}
          <div className="bg-[#F8FAFC] p-6 border-b border-slate-100 flex justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[#6D3DF5] mb-2 font-bold text-xs uppercase tracking-wider">
                <BookOpen size={16} />
                <span>Task Instructions & Requirements</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight leading-snug truncate">
                {task.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#64748B]">
                <span className="flex items-center gap-1 font-semibold text-[#334155]">
                  <Building2 size={13} className="text-[#6D3DF5]" />
                  {task.company}
                </span>
                {task.role && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} />
                      {task.role}
                    </span>
                  </>
                )}
                {task.deadline && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Due {task.deadline}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs shrink-0"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-6">
            {/* Deadline Passed Notice */}
            {isClosed && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 leading-relaxed">
                <Clock size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider text-rose-900">Deadline Passed</p>
                  <p className="text-xs text-rose-700 mt-0.5 font-medium">
                    This task's submission deadline has passed. New applications and submissions are closed.
                  </p>
                </div>
              </div>
            )}
            {/* Overview Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2.5">
                Overview & Objective
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-line bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100">
                {task.description || "No overview provided for this challenge."}
              </p>
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2.5">
                Steps to Complete
              </h3>

              {instructionsList.length > 0 ? (
                <div className="space-y-2.5">
                  {instructionsList.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#6D3DF5]/30 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#F3EEFF] text-[#6D3DF5] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#E9E1FF]">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-medium text-[#1E293B] leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#6D3DF5] shrink-0" />
                  <span>
                    Follow the objective and guidelines detailed in the overview above to complete this challenge.
                  </span>
                </div>
              )}
            </div>

            {/* Attached Materials Notice */}
            {hasMaterials && (
              <div className="p-4 rounded-2xl bg-[#F3EEFF]/60 border border-[#E9E1FF] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-[#5B2FD6]">
                  <Paperclip size={18} className="text-[#6D3DF5] shrink-0" />
                  <div>
                    <p className="font-bold">Required Task Materials Included</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      {task.materials.length} {task.materials.length === 1 ? "file" : "files"} (datasets, logos, briefs) available for direct ZIP download upon accepting the task.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Note & Guidelines */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-800 leading-relaxed">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                Make sure to review all requirements before submitting your solution. Once accepted, you can build your project and upload your GitHub repository and demo link.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 border-t border-slate-100 bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2">
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(task)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F3EEFF] text-[#6D3DF5] text-xs font-bold border border-[#E9E1FF] transition-colors cursor-pointer shadow-xs"
                >
                  <ExternalLink size={13} />
                  <span>Full Task Page</span>
                </button>
              )}

              {isClosed ? (
                <button
                  disabled
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border cursor-not-allowed ${isSolutionSubmitted ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}
                >
                  {isSolutionSubmitted ? "Solution Submitted" : isAccepted ? "Submission Closed" : "Application Closed"}
                </button>
              ) : isSolutionSubmitted ? (
                <button
                  disabled
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 cursor-not-allowed flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Solution Submitted</span>
                </button>
              ) : isAccepted ? (
                <button
                  onClick={() => onOpenSubmitTask(task)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <FileText size={14} />
                  <span>Submit Task</span>
                </button>
              ) : (
                <button
                  onClick={() => onApplyDirect(task)}
                  disabled={isApplying}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold shadow-md shadow-[#6D3DF5]/20 transition-all cursor-pointer disabled:opacity-60"
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
      </div>
    </AnimatePresence>
  );
};

export default InstructionModal;
