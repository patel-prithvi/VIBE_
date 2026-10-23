import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  ExternalLink,
  Code2,
  Clock,
  Award,
  AlertCircle,
  Loader2,
  Send,
  FileCode,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";
import { useToast } from "../Toast";

export const SkillVerificationModal = ({
  isOpen,
  onClose,
  activeAttempt,
  onSubmissionSuccess,
}) => {
  const toast = useToast();
  const [repoUrl, setRepoUrl] = useState(activeAttempt?.submissionData?.repoUrl || "");
  const [liveDemoUrl, setLiveDemoUrl] = useState(activeAttempt?.submissionData?.liveDemoUrl || "");
  const [notes, setNotes] = useState(activeAttempt?.submissionData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activeAttempt) return null;

  const task = activeAttempt.task || {};
  const isAlreadySubmitted = ["submitted", "under_review", "approved", "rejected"].includes(
    activeAttempt.status
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      toast.error("Please provide a valid GitHub or GitLab repository URL");
      return;
    }

    try {
      new URL(repoUrl.trim());
    } catch {
      toast.error("Please enter a valid URL (including https://)");
      return;
    }

    if (liveDemoUrl.trim()) {
      try {
        new URL(liveDemoUrl.trim());
      } catch {
        toast.error("Live demo URL must be a valid URL (including https://)");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await api.post(`/skill-verification/submit/${activeAttempt.attemptId}`, {
        repoUrl: repoUrl.trim(),
        liveDemoUrl: liveDemoUrl.trim(),
        notes: notes.trim(),
      });

      if (res.data?.success) {
        toast.success("Deliverable submitted! Your task has been routed for double-blind mentor evaluation.");
        if (onSubmissionSuccess) {
          onSubmissionSuccess(res.data.data);
        }
        onClose();
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.message || "Failed to submit deliverable");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#F1F5F9] bg-gradient-to-r from-[#FAF5FF] via-white to-[#F0FDF4]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#6D3DF5]/10 text-[#6D3DF5]">
                <Award size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Verify Skill: {activeAttempt.skillName}
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#6D3DF5] text-white uppercase tracking-wider">
                    {activeAttempt.difficulty}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Complete the proof-of-work task below to earn your verified credential
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
            {/* Task Card */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D3DF5] flex items-center gap-1.5">
                    <FileCode size={14} /> Assigned Verification Task
                  </span>
                  <h4 className="text-base font-bold text-[#0F172A]">
                    {task.title || "Skill Proficiency Challenge"}
                  </h4>
                </div>
                {task.estimatedTimeHours && (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B]">
                    <Clock size={13} className="text-[#6D3DF5]" />
                    ~{task.estimatedTimeHours} hrs
                  </span>
                )}
              </div>

              <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-line">
                {task.problemStatement}
              </p>

              {/* Requirements Checklist */}
              {task.requirements && task.requirements.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                  <span className="text-xs font-bold text-[#0F172A] block">
                    Implementation Requirements:
                  </span>
                  <ul className="space-y-1.5">
                    {task.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#475569]">
                        <CheckCircle2 size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Starter Repo Link */}
              {task.starterRepositoryUrl && (
                <div className="pt-2">
                  <a
                    href={task.starterRepositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#CBD5E1] text-[#334155] hover:border-[#6D3DF5] hover:text-[#6D3DF5] transition-all shadow-xs"
                  >
                    <Code2 size={14} />
                    <span>Starter Repository Template</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Rubric Info Card */}
            {task.rubric && task.rubric.length > 0 && (
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                <span className="text-xs font-bold text-[#6D3DF5] flex items-center gap-1.5">
                  <Sparkles size={14} /> Evaluation Rubric (Passing Score: 70%)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {task.rubric.map((r, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-white border border-purple-100 flex flex-col justify-between"
                    >
                      <span className="text-[11px] font-medium text-[#475569]">{r.criterion}</span>
                      <span className="text-xs font-bold text-[#6D3DF5] mt-1">{r.maxPoints} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Section */}
            {isAlreadySubmitted ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle size={16} className="text-amber-600" />
                  <span>Submission Under Evaluation</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your work is currently undergoing double-blind evaluation by an assigned faculty mentor.
                  Neither your identity nor the reviewer's identity is disclosed during this audit.
                </p>
                <div className="pt-2 space-y-1 text-xs">
                  <div>
                    <span className="font-semibold">Repository: </span>
                    <a
                      href={activeAttempt.submissionData?.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6D3DF5] underline"
                    >
                      {activeAttempt.submissionData?.repoUrl}
                    </a>
                  </div>
                  {activeAttempt.submissionData?.liveDemoUrl && (
                    <div>
                      <span className="font-semibold">Live Demo: </span>
                      <a
                        href={activeAttempt.submissionData?.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6D3DF5] underline"
                      >
                        {activeAttempt.submissionData?.liveDemoUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0F172A] flex items-center justify-between">
                    <span>GitHub / GitLab Repository URL *</span>
                    <span className="text-[11px] font-normal text-[#64748B]">Required</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/your-username/task-solution"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0F172A] flex items-center justify-between">
                    <span>Live Demo / Preview URL</span>
                    <span className="text-[11px] font-normal text-[#64748B]">Optional</span>
                  </label>
                  <input
                    type="url"
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    placeholder="https://your-demo.vercel.app"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0F172A]">
                    Implementation Notes for Reviewer
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe your approach, technical decisions, or how to run tests..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/20 transition-all resize-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D3DF5] to-[#8B5CF6] text-white text-xs font-bold hover:shadow-lg hover:shadow-[#6D3DF5]/25 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Submit for Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
