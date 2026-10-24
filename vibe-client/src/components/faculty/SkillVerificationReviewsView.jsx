import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  ExternalLink,
  Code2,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  Loader2,
  Send,
  Plus,
  Trash2,
  ShieldAlert,
  UserCheck,
  CheckCircle,
  UserX,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";
import { useToast } from "../Toast";

const COMMON_PROS = [
  "Clean modular component design",
  "Effective state management & hook usage",
  "Good error handling and boundary safety",
  "Clean Git commit history & conventional syntax",
  "Responsive layout & accessible markup",
  "Efficient algorithmic time/space complexity",
];

const COMMON_CONS = [
  "Missing client-side schema/input validation",
  "Incomplete test coverage / missing assertions",
  "Hardcoded configuration secrets or URLs",
  "Suboptimal DOM re-renders or performance drops",
  "Incomplete responsive design on mobile viewports",
  "Lacks error feedback on failed network calls",
];

export const SkillVerificationReviewsView = () => {
  const toast = useToast();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkload, setActiveWorkload] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Decline Assignment State
  const [decliningSubmission, setDecliningSubmission] = useState(null);
  const [declineReasonCategory, setDeclineReasonCategory] = useState("Workload / Time constraints");
  const [declineReasonNotes, setDeclineReasonNotes] = useState("");
  const [declining, setDeclining] = useState(false);

  // Review Form State
  const [score, setScore] = useState(85);
  const [pros, setPros] = useState([]);
  const [newProInput, setNewProInput] = useState("");
  const [cons, setCons] = useState([]);
  const [newConInput, setNewConInput] = useState("");
  const [feedbackComments, setFeedbackComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get("/skill-verification/mentor/queue");
      if (res.data?.success) {
        setQueue(res.data.data?.queue || []);
        setActiveWorkload(res.data.data?.activeWorkload || 0);
      }
    } catch (err) {
      console.error("Fetch queue error:", err);
      toast.error(err.response?.data?.message || "Failed to load verification review queue");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (item) => {
    setSelectedSubmission(item);
    setScore(80);
    setPros([]);
    setCons([]);
    setNewProInput("");
    setNewConInput("");
    setFeedbackComments("");
  };

  const handleOpenDeclineModal = (item) => {
    setDecliningSubmission(item);
    setDeclineReasonCategory("Workload / Time constraints");
    setDeclineReasonNotes("");
  };

  const handleConfirmDecline = async (e) => {
    e.preventDefault();
    if (!decliningSubmission) return;

    const fullReason = declineReasonNotes.trim()
      ? `${declineReasonCategory}: ${declineReasonNotes.trim()}`
      : declineReasonCategory;

    try {
      setDeclining(true);
      const res = await api.post(
        `/skill-verification/mentor/decline/${decliningSubmission.attemptId}`,
        { reason: fullReason }
      );

      if (res.data?.success) {
        const isReassigned = res.data.data?.reassigned;
        toast.success(
          isReassigned
            ? "Assignment declined. Deliverable reassigned to another available faculty mentor."
            : "Assignment declined. Request placed in unassigned queue."
        );
        // Immediate local state update to remove declined item
        setQueue((prev) => prev.filter((q) => q.attemptId !== decliningSubmission.attemptId));
        setActiveWorkload((prev) => Math.max(0, prev - 1));
        setDecliningSubmission(null);
        fetchQueue();
      }
    } catch (err) {
      console.error("Decline error:", err);
      toast.error(err.response?.data?.message || "Failed to decline assignment");
    } finally {
      setDeclining(false);
    }
  };

  const handleAddPro = (text) => {
    const trimmed = text.trim();
    if (!trimmed || pros.includes(trimmed)) return;
    setPros([...pros, trimmed]);
    setNewProInput("");
  };

  const handleRemovePro = (index) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleAddCon = (text) => {
    const trimmed = text.trim();
    if (!trimmed || cons.includes(trimmed)) return;
    setCons([...cons, trimmed]);
    setNewConInput("");
  };

  const handleRemoveCon = (index) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      toast.error("Please enter a valid score between 0 and 100");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(
        `/skill-verification/mentor/evaluate/${selectedSubmission.attemptId}`,
        {
          score: numericScore,
          pros,
          cons,
          feedbackComments: feedbackComments.trim(),
        }
      );

      if (res.data?.success) {
        const isApproved = res.data.data?.isApproved;
        toast.success(
          isApproved
            ? `Submission APPROVED (${numericScore}%). Skill verified on candidate's Virtual CV!`
            : `Submission REJECTED (${numericScore}% < 70%). Feedback routed to candidate.`
        );
        setSelectedSubmission(null);
        fetchQueue();
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      toast.error(err.response?.data?.message || "Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#FAF5FF] via-white to-[#F0FDF4] border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#6D3DF5] text-white shadow-md shadow-[#6D3DF5]/20">
            <Award size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#0F172A]">
                Skill Verification Queue
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-[#6D3DF5]">
                Double Blind
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Review anonymous student submissions to certify proof-of-work skills for their Virtual CV
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-xs text-center">
            <span className="text-[11px] font-semibold text-[#64748B] block">Active Workload</span>
            <span className="text-base font-bold text-[#6D3DF5]">{activeWorkload} Pending</span>
          </div>
        </div>
      </div>

      {/* Queue Content */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-[#E2E8F0]">
          <Loader2 size={30} className="animate-spin text-[#6D3DF5]" />
          <p className="text-xs text-[#64748B]">Loading assigned submissions...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A]">All Caught Up!</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            You have no pending skill verification reviews assigned. Submissions are load-balanced and will appear here when assigned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queue.map((item) => (
            <div
              key={item.attemptId}
              className="p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#6D3DF5]/40 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-[#334155] font-mono">
                    {item.candidateCode}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5FF] text-[#6D3DF5] border border-purple-100">
                    <span>{item.skillName}</span>
                    <span>•</span>
                    <span className="uppercase">{item.difficulty}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] line-clamp-1">
                    {item.task?.title || "Skill Challenge Submission"}
                  </h4>
                  <p className="text-xs text-[#64748B] line-clamp-2 mt-1">
                    {item.task?.problemStatement}
                  </p>
                </div>

                {/* Deliverables summary */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] font-medium flex items-center gap-1">
                      <Code2 size={13} /> Repository:
                    </span>
                    <a
                      href={item.submissionData?.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6D3DF5] font-semibold hover:underline flex items-center gap-1 max-w-[200px] truncate"
                    >
                      <span className="truncate">{item.submissionData?.repoUrl}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                  </div>
                  {item.submissionData?.liveDemoUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] font-medium">Live Demo:</span>
                      <a
                        href={item.submissionData?.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#10B981] font-semibold hover:underline flex items-center gap-1 max-w-[200px] truncate"
                      >
                        <span className="truncate">{item.submissionData?.liveDemoUrl}</span>
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-[#F1F5F9]">
                <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                  <Clock size={12} /> Double-blind review
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDeclineModal(item)}
                    className="px-3 py-2 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Decline this review assignment and reassign to another faculty mentor"
                  >
                    <UserX size={13} />
                    <span>Decline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenReviewModal(item)}
                    className="px-4 py-2 rounded-xl bg-[#6D3DF5] text-white text-xs font-bold hover:shadow-md hover:shadow-[#6D3DF5]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Evaluate Deliverable</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {decliningSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#F1F5F9] bg-[#FFF5F5]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
                  <UserX size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    Decline Review Assignment
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {decliningSubmission.candidateCode} • {decliningSubmission.skillName} ({decliningSubmission.difficulty})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDecliningSubmission(null)}
                className="p-2 text-[#94A3B8] hover:text-[#0F172A] rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDecline} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle size={14} />
                  Important Note on Declining:
                </p>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Declining releases this task from your queue and automatically reassigns it to another eligible faculty mentor.
                  It <strong>does not reject</strong> the student's skill or penalize the candidate.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0F172A] block">
                  Reason for Declining:
                </label>
                <select
                  value={declineReasonCategory}
                  onChange={(e) => setDeclineReasonCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#6D3DF5] cursor-pointer"
                >
                  <option value="Workload / Time constraints">High current workload / Schedule constraints</option>
                  <option value="Out of primary domain expertise">Out of primary domain expertise</option>
                  <option value="Unforeseen unavailability / On leave">Unforeseen unavailability / On leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] flex items-center justify-between">
                  <span>Additional Notes</span>
                  <span className="text-[10px] text-[#94A3B8]">Optional</span>
                </label>
                <textarea
                  rows={2}
                  value={declineReasonNotes}
                  onChange={(e) => setDeclineReasonNotes(e.target.value)}
                  placeholder="Provide context for the assignment transfer..."
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#6D3DF5] resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  disabled={declining}
                  onClick={() => setDecliningSubmission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer disabled:opacity-50"
                >
                  Keep Assignment
                </button>
                <button
                  type="submit"
                  disabled={declining}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-60"
                >
                  {declining ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Reassigning Task...</span>
                    </>
                  ) : (
                    <>
                      <UserX size={13} />
                      <span>Confirm Decline & Reassign</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#F1F5F9] bg-[#FAF5FF]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#6D3DF5] text-white">
                  <UserCheck size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0F172A]">
                      Evaluating {selectedSubmission.candidateCode}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-[#6D3DF5]">
                      {selectedSubmission.skillName} • {selectedSubmission.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Double-blind assessment: candidate personal data is protected
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-[#94A3B8] hover:text-[#0F172A] rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {/* Deliverable Links */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <span className="text-xs font-bold text-[#0F172A] block">Deliverables Submitted:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={selectedSubmission.submissionData?.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] hover:border-[#6D3DF5] hover:text-[#6D3DF5] transition-all shadow-xs"
                  >
                    <Code2 size={14} />
                    <span>Inspect Code Repository</span>
                    <ExternalLink size={12} />
                  </a>
                  {selectedSubmission.submissionData?.liveDemoUrl && (
                    <a
                      href={selectedSubmission.submissionData?.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#10B981] hover:border-[#10B981] transition-all shadow-xs"
                    >
                      <Sparkles size={14} />
                      <span>View Live Demo</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                {selectedSubmission.submissionData?.notes && (
                  <p className="text-xs text-[#64748B] pt-1">
                    <strong className="text-[#334155]">Candidate Notes: </strong>
                    {selectedSubmission.submissionData.notes}
                  </p>
                )}
              </div>

              {/* Score Slider & Passing Rule */}
              <div className="p-5 rounded-2xl bg-[#FDFBFF] border border-[#E9E1FF] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block">
                      Evaluation Score (0 - 100)
                    </label>
                    <span className="text-[11px] text-[#64748B]">
                      Passing threshold: <strong className="text-[#0F172A]">70%</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-2xl font-extrabold ${
                        score >= 70 ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {score}%
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        score >= 70
                           ? "bg-emerald-100 text-emerald-800"
                           : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {score >= 70 ? "PASS (Verified)" : "REJECT (Needs Revision)"}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full accent-[#6D3DF5] cursor-pointer"
                />
              </div>

              {/* Strengths (Pros) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0F172A] flex items-center justify-between">
                  <span>Key Strengths (Pros)</span>
                  <span className="text-[11px] font-normal text-[#64748B]">Optional</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_PROS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPro(chip)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-[#E2E8F0] text-[#475569] transition-all cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                {pros.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pros.map((p, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {p}
                        <button
                          type="button"
                          onClick={() => handleRemovePro(i)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newProInput}
                    onChange={(e) => setNewProInput(e.target.value)}
                    placeholder="Add custom strength..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#6D3DF5]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPro(newProInput)}
                    className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-bold text-[#334155] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Areas for Improvement (Cons) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0F172A] flex items-center justify-between">
                  <span>Areas for Improvement (Cons)</span>
                  <span className="text-[11px] font-normal text-[#64748B]">Optional</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CONS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddCon(chip)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-[#E2E8F0] text-[#475569] transition-all cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                {cons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cons.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => handleRemoveCon(i)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newConInput}
                    onChange={(e) => setNewConInput(e.target.value)}
                    placeholder="Add custom improvement area..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#6D3DF5]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCon(newConInput)}
                    className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-bold text-[#334155] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Feedback Comments */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0F172A]">
                  Constructive Feedback for Candidate
                </label>
                <textarea
                  rows={3}
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  placeholder="Provide constructive actionable feedback to help the student learn..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#6D3DF5] resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60 ${
                    score >= 70
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                      : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Evaluation...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>
                        {score >= 70
                          ? `Approve & Verify (${score}%)`
                          : `Reject & Send Feedback (${score}%)`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
