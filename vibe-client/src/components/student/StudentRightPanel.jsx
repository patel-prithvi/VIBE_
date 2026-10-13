import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Send,
  X,
  Users,
  ArrowRight,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import api from "../../services/api";

export const StudentRightPanel = ({ onNavigate }) => {
  const [mentors, setMentors] = useState([]);
  const [existingRequests, setExistingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Connect modal state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [connectMessage, setConnectMessage] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [connectError, setConnectError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [facultyRes, reqsRes] = await Promise.allSettled([
        api.get("/mentor-requests/all-faculty"),
        api.get("/mentor-requests/my-requests"),
      ]);

      if (facultyRes.status === "fulfilled" && facultyRes.value?.data?.data) {
        setMentors(facultyRes.value.data.data);
      } else {
        setMentors([]);
        if (facultyRes.status === "rejected") {
          throw facultyRes.reason;
        }
      }

      if (reqsRes.status === "fulfilled" && reqsRes.value?.data?.data) {
        setExistingRequests(reqsRes.value.data.data);
      }
    } catch (err) {
      console.error("Error fetching recommended mentors:", err);
      setError("Failed to load mentor recommendations. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch tasks when opening connect modal
  const handleOpenConnect = async (mentor) => {
    setSelectedMentor(mentor);
    setConnectError("");
    setConnectSuccess(false);
    setConnectMessage("");
    setIsConnectModalOpen(true);

    try {
      const res = await api.get("/tasks");
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTasks(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedTaskId(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error("Error fetching tasks for mentor request:", err);
      setConnectError("Could not fetch available task topics.");
    }
  };

  const handleSendConnect = async (e) => {
    e.preventDefault();
    if (!selectedMentor) return;

    if (!selectedTaskId) {
      setConnectError("Please select a task topic to connect on.");
      return;
    }

    try {
      setConnecting(true);
      setConnectError("");

      await api.post("/mentor-requests/request", {
        facultyId: selectedMentor._id,
        taskId: selectedTaskId,
        message: connectMessage.trim() || `Hello ${selectedMentor.name}, I would love to connect for guidance.`,
      });

      setConnectSuccess(true);
      // Refresh requests to update button state
      const reqsRes = await api.get("/mentor-requests/my-requests");
      if (reqsRes.data?.data) {
        setExistingRequests(reqsRes.data.data);
      }

      setTimeout(() => {
        setIsConnectModalOpen(false);
        setConnectSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Error sending mentor request:", err);
      setConnectError(
        err.response?.data?.message || "Failed to send connection request. Please try again."
      );
    } finally {
      setConnecting(false);
    }
  };

  // Helper to determine status for a mentor
  const getMentorStatus = (mentorId) => {
    const found = existingRequests.find(
      (r) =>
        (r.faculty?._id === mentorId || r.faculty?.id === mentorId || r.faculty === mentorId)
    );
    if (!found) return null;
    return found.status; // "pending", "accepted", "rejected"
  };

  // Helper to parse expertise domains into an array of pills
  const getExpertiseList = (mentor) => {
    const domains = mentor.Profile?.ExpertiseDomains;
    if (Array.isArray(domains)) return domains.slice(0, 3);
    if (typeof domains === "string" && domains.trim()) {
      return domains
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
    }
    return ["Academic Mentorship", "Career Guidance"];
  };

  return (
    <aside className="w-full lg:w-[280px] xl:w-[300px] min-w-0 flex-shrink-0 space-y-4">
      {/* ======================================================== */}
      {/* 1. Recommended Mentors Card                              */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-[#0F172A] tracking-tight">
            Recommended Mentors
          </h3>
          <button
            onClick={() => onNavigate && onNavigate("mentorship")}
            className="text-xs font-bold text-[#6D3DF5] hover:text-[#5B2FD6] flex items-center gap-0.5 transition-colors"
          >
            <span>View all</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#6D3DF5] animate-spin" />
            <p className="text-xs font-medium text-[#64748B]">Loading mentors...</p>
          </div>
        ) : error ? (
          <div className="py-4 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-[#EF4444] mx-auto" />
            <p className="text-xs text-[#64748B]">{error}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          </div>
        ) : mentors.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0] flex items-center justify-center mx-auto">
              <Users size={18} />
            </div>
            <p className="text-xs text-[#64748B]">No recommended mentors available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mentors.slice(0, 4).map((mentor) => {
              const status = getMentorStatus(mentor._id);
              const expertise = getExpertiseList(mentor);
              const subtitle =
                mentor.Profile?.position ||
                mentor.Profile?.InstituteName ||
                "Faculty";

              return (
                <div
                  key={mentor._id}
                  className="pb-3.5 border-b border-[#F1F5F9] last:border-0 last:pb-0 min-w-0"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Avatar
                        name={mentor.name}
                        src={mentor.ImageUrl || mentor.avatar}
                        className="w-10 h-10 rounded-full flex-shrink-0 object-cover ring-2 ring-[#F1F5F9]"
                        initialsClassName="text-xs font-bold text-white"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-[#0F172A] truncate">
                          {mentor.name}
                        </h4>
                        <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                          Faculty • {subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Connect / Status Action */}
                    <div className="flex-shrink-0">
                      {status === "accepted" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] rounded-lg text-[11px] font-bold">
                          <Check size={12} />
                          <span>Connected</span>
                        </span>
                      ) : status === "pending" ? (
                        <span className="inline-flex items-center px-2.5 py-1 bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] rounded-lg text-[11px] font-bold">
                          Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenConnect(mentor)}
                          className="px-3 py-1 bg-white hover:bg-[#6D3DF5] text-[#6D3DF5] hover:text-white border border-[#E2E8F0] hover:border-[#6D3DF5] rounded-lg text-xs font-bold transition-all shadow-xs"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expertise Tags */}
                  {expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pl-12.5">
                      {expertise.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] rounded-md text-[10px] font-medium truncate max-w-[120px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. AI-Powered CV Analysis Card                           */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} />
          </div>
          <h3 className="font-bold text-sm text-[#0F172A] tracking-tight">
            AI-Powered CV Analysis
          </h3>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed mt-1 mb-4">
          Get personalized feedback on your resume, improve your skills, and stand out with AI-driven suggestions.
        </p>

        <button
          onClick={() => onNavigate && onNavigate("cv-analysis")}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#172554] hover:bg-[#0F172A] text-white rounded-xl text-xs font-bold transition-all shadow-sm group"
        >
          <span>Analyze My CV</span>
          <ArrowRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>

        {/* Feature Checkpoints */}
        <div className="mt-4 pt-4 border-t border-[#F1F5F9] space-y-2.5">
          {[
            "Instant AI feedback",
            "Skill gap analysis",
            "Personalized improvement tips",
            "Tailored for students and job opportunities",
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={11} strokeWidth={3} />
              </div>
              <span className="text-xs font-medium text-[#334155] leading-snug">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* Connect with Mentor Modal                                */}
      {/* ======================================================== */}
      {isConnectModalOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsConnectModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Avatar
                name={selectedMentor.name}
                src={selectedMentor.ImageUrl || selectedMentor.avatar}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#F1F5F9]"
                initialsClassName="text-sm font-bold text-white"
              />
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Connect with {selectedMentor.name}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {selectedMentor.Profile?.InstituteName || "Faculty Mentor"}
                </p>
              </div>
            </div>

            {connectSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#0F172A]">Request Sent!</h4>
                <p className="text-xs text-[#64748B]">
                  Your connection request has been forwarded to {selectedMentor.name}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendConnect} className="space-y-4">
                {connectError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#EF4444] flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{connectError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    Select Mentorship Topic / Task
                  </label>
                  {tasks.length > 0 ? (
                    <select
                      value={selectedTaskId}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#6D3DF5] focus:bg-white transition-all"
                    >
                      {tasks.map((task) => (
                        <option key={task._id} value={task._id}>
                          {task.title} ({task.companyName || "VIBE Task"})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-[#64748B]">
                      Loading available topics...
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    Message to Mentor (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={connectMessage}
                    onChange={(e) => setConnectMessage(e.target.value)}
                    placeholder="Briefly describe what guidance you are seeking..."
                    className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D3DF5] focus:bg-white resize-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(false)}
                    className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-xl text-xs font-bold hover:bg-[#F8FAFC] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={connecting || !selectedTaskId}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    {connecting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>{connecting ? "Sending..." : "Send Request"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
