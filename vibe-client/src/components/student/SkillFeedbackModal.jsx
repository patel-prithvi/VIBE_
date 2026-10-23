import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Calendar,
  UserCheck,
} from "lucide-react";

export const SkillFeedbackModal = ({ isOpen, onClose, attempt, onRetry }) => {
  if (!isOpen || !attempt) return null;

  const review = attempt.review || attempt.reviewResult || {};
  const isApproved = review.decision === "approved" || (typeof review.score === "number" && review.score >= 70);
  const score = typeof review.score === "number" ? review.score : attempt.score || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-8"
        >
          {/* Header */}
          <div
            className={`p-6 border-b ${
              isApproved
                ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-100"
                : "bg-gradient-to-r from-amber-50 via-rose-50 to-white border-amber-100"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    isApproved
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  }`}
                >
                  {isApproved ? <ShieldCheck size={26} /> : <AlertTriangle size={26} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#0F172A]">
                      {attempt.skillName || "Skill"} Verification
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isApproved ? "Verified ✓" : "Needs Revision"}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Double-blind assessment by Verified Faculty Reviewer
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Score Ring / Card */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#64748B]">Evaluation Score</span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-extrabold ${
                      isApproved ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {score}%
                  </span>
                  <span className="text-xs font-medium text-[#94A3B8]">/ 100%</span>
                </div>
                <span className="text-[11px] text-[#64748B] block">
                  Passing threshold: <strong className="text-[#0F172A]">70%</strong>
                </span>
              </div>

              <div
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  isApproved
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {isApproved ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Credentials Unlocked</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    <span>Below 70% Benchmark</span>
                  </>
                )}
              </div>
            </div>

            {/* Pros (Strengths) */}
            {review.pros && review.pros.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <ThumbsUp size={14} className="text-emerald-600" />
                  Key Strengths Observed
                </span>
                <div className="space-y-1.5">
                  {review.pros.map((pro, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-[#334155] p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-2"
                    >
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cons (Areas for Improvement) */}
            {review.cons && review.cons.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600" />
                  Areas for Improvement
                </span>
                <div className="space-y-1.5">
                  {review.cons.map((con, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-[#334155] p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 flex items-start gap-2"
                    >
                      <XCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Qualitative Comments */}
            {review.feedbackComments && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                <span className="text-xs font-bold text-[#0F172A] block">
                  Reviewer Notes:
                </span>
                <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-line">
                  {review.feedbackComments}
                </p>
              </div>
            )}

            {/* Double Blind Footer Note */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-purple-900">
              <UserCheck size={14} className="text-[#6D3DF5] shrink-0" />
              <span>
                This review was conducted anonymously through VIBE's double-blind evaluation engine.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#F1F5F9]">
              {!isApproved && onRetry && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRetry(attempt.skillName, attempt.difficulty);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D3DF5] text-white text-xs font-bold hover:shadow-md hover:shadow-[#6D3DF5]/20 transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Request Alternate Task & Retry</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
