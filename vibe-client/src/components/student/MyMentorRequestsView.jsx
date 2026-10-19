import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Award,
  Clock,
  Search,
  ExternalLink,
  AlertCircle,
  Loader2,
  Building2,
  Users,
  ArrowLeft,
  Video,
  Check,
  Send,
  X,
  ArrowRight,
  RefreshCw,
  Briefcase,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import api from "../../services/api";
import { useScrollLock } from "../../hooks/useScrollLock";

export const MyMentorRequestsView = ({ onBackToFeed, initialTab = "explore" }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab); // "explore" or "requests"
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters for Explore Mentors
  const [mentorSearch, setMentorSearch] = useState("");

  // Filters for My Requests
  const [requestFilter, setRequestFilter] = useState("all");
  const [requestSearch, setRequestSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Connect modal state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [connectMessage, setConnectMessage] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [connectError, setConnectError] = useState("");

  useScrollLock(Boolean((isConnectModalOpen && selectedMentor) || selectedRequest));

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
        const mappedRequests = reqsRes.value.data.data.map((req) => ({
          id: req._id,
          faculty: {
            id: req.faculty?._id || req.faculty?.id,
            name: req.faculty?.name || "Faculty Mentor",
            email: req.faculty?.email || "",
            avatar: req.faculty?.ImageUrl || req.faculty?.avatar,
            accountType: req.faculty?.accountType || "faculty",
            institute: req.faculty?.Profile?.InstituteName || "VIBE Faculty",
            expertise: Array.isArray(req.faculty?.Profile?.ExpertiseDomains)
              ? req.faculty.Profile.ExpertiseDomains.join(", ")
              : req.faculty?.Profile?.ExpertiseDomains || "Academic Mentorship",
          },
          task: {
            title: req.task?.title || "Mentorship Topic",
            company: req.task?.companyName || "VIBE Task",
            category: req.task?.category || "General",
            deadline: req.task?.lastDateToSubmit
              ? new Date(req.task.lastDateToSubmit).toLocaleDateString()
              : "Flexible",
            id: req.task?._id,
          },
          requestDate: new Date(req.createdAt).toLocaleDateString(),
          message: req.message,
          status: req.status || "pending",
          skills: req.skills || [],
          meetLink: req.meetLink || "",
        }));
        setRequests(mappedRequests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Error fetching mentorship data:", err);
      setError("Failed to load mentorship data. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Open Connect Modal
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

  // Submit Mentor Connection Request
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
        const mappedRequests = reqsRes.data.data.map((req) => ({
          id: req._id,
          faculty: {
            id: req.faculty?._id || req.faculty?.id,
            name: req.faculty?.name || "Faculty Mentor",
            email: req.faculty?.email || "",
            avatar: req.faculty?.ImageUrl || req.faculty?.avatar,
            accountType: req.faculty?.accountType || "faculty",
            institute: req.faculty?.Profile?.InstituteName || "VIBE Faculty",
            expertise: Array.isArray(req.faculty?.Profile?.ExpertiseDomains)
              ? req.faculty.Profile.ExpertiseDomains.join(", ")
              : req.faculty?.Profile?.ExpertiseDomains || "Academic Mentorship",
          },
          task: {
            title: req.task?.title || "Mentorship Topic",
            company: req.task?.companyName || "VIBE Task",
            category: req.task?.category || "General",
            deadline: req.task?.lastDateToSubmit
              ? new Date(req.task.lastDateToSubmit).toLocaleDateString()
              : "Flexible",
            id: req.task?._id,
          },
          requestDate: new Date(req.createdAt).toLocaleDateString(),
          message: req.message,
          status: req.status || "pending",
          skills: req.skills || [],
          meetLink: req.meetLink || "",
        }));
        setRequests(mappedRequests);
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
    const found = requests.find(
      (r) =>
        (r.faculty?.id === mentorId || r.faculty?._id === mentorId || r.faculty === mentorId)
    );
    if (!found) return null;
    return found.status; // "pending", "accepted", "rejected"
  };

  // Helper to parse expertise domains into an array of pills
  const getExpertiseList = (mentor) => {
    const domains = mentor.Profile?.ExpertiseDomains;
    if (Array.isArray(domains)) return domains;
    if (typeof domains === "string" && domains.trim()) {
      return domains
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  // Filter mentors
  const filteredMentors = mentors.filter((m) => {
    const query = mentorSearch.toLowerCase();
    const nameMatch = m.name?.toLowerCase().includes(query);
    const instMatch = m.Profile?.InstituteName?.toLowerCase().includes(query);
    const posMatch = m.Profile?.position?.toLowerCase().includes(query);
    const expList = getExpertiseList(m);
    const expMatch = expList.some((e) => e.toLowerCase().includes(query));
    return Boolean(nameMatch || instMatch || posMatch || expMatch);
  });

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesFilter = requestFilter === "all" || req.status === requestFilter;
    const query = requestSearch.toLowerCase();
    const matchesSearch =
      req.faculty.name.toLowerCase().includes(query) ||
      req.task.title.toLowerCase().includes(query) ||
      req.task.company.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]";
      case "accepted":
        return "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]";
      case "rejected":
        return "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]";
      default:
        return "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#172554] tracking-tight">Mentorship</h1>
        <p className="text-xs md:text-sm text-[#64748B] font-medium">Find faculty mentors and track your requests</p>
      </div>

      {/* 2. Top Tabs: Find Mentors vs My Requests */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] px-4 pt-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-2">
        <button
          onClick={() => setActiveTab("explore")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "explore"
              ? "border-[#6D3DF5] text-[#6D3DF5]"
              : "border-transparent text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          <Users size={16} />
          <span>Find Mentors</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              activeTab === "explore"
                ? "bg-[#F3EEFF] text-[#6D3DF5]"
                : "bg-[#F1F5F9] text-[#64748B]"
            }`}
          >
            {mentors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "requests"
              ? "border-[#6D3DF5] text-[#6D3DF5]"
              : "border-transparent text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          <Clock size={16} />
          <span>My Requests</span>
          {requests.length > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                activeTab === "requests"
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB A: FIND MENTORS (Real database faculty members)                 */}
      {/* ==================================================================== */}
      {activeTab === "explore" && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                type="text"
                placeholder="Search mentors by name, institute, department, or expertise..."
                value={mentorSearch}
                onChange={(e) => setMentorSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D3DF5] focus:bg-white transition-all"
              />
            </div>

            <div className="text-xs font-semibold text-[#64748B] shrink-0 hidden sm:block">
              {filteredMentors.length} {filteredMentors.length === 1 ? "mentor" : "mentors"} available
            </div>
          </div>

          {/* Mentors Grid / UI States */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#6D3DF5] animate-spin" />
              <p className="text-xs font-semibold text-[#64748B]">Loading mentors from database...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-[#FEE2E2] p-8 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#EF4444]">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172554]">Error Loading Mentors</h3>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm">{error}</p>
              </div>
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Try Again</span>
              </button>
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0] flex items-center justify-center mx-auto">
                <Users size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">No mentors found</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 leading-relaxed">
                  {mentorSearch
                    ? `No faculty mentors match your search "${mentorSearch}". Try searching for another name, subject, or department.`
                    : "There are currently no verified faculty mentors available in the database."}
                </p>
              </div>
              {mentorSearch && (
                <button
                  onClick={() => setMentorSearch("")}
                  className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-bold text-[#0F172A] rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => {
                const status = getMentorStatus(mentor._id);
                const expertise = getExpertiseList(mentor);
                const position = mentor.Profile?.position || "Faculty Mentor";
                const institute = mentor.Profile?.InstituteName;
                const experience = mentor.Profile?.YearOfExperience;

                return (
                  <motion.div
                    layout
                    key={mentor._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Mentor Profile Row */}
                      <div
                        onClick={() => navigate(`/profile/${mentor._id}`)}
                        className="flex items-start gap-3.5 cursor-pointer group/mentor"
                      >
                        <Avatar
                          name={mentor.name}
                          src={mentor.ImageUrl || mentor.avatar}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#F1F5F9] group-hover/mentor:ring-[#6D3DF5]/30 transition-all flex-shrink-0"
                          initialsClassName="text-sm font-bold text-white"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-[#0F172A] truncate group-hover/mentor:text-[#6D3DF5] transition-colors">
                              {mentor.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-[#F3EEFF] text-[#6D3DF5] text-[10px] font-bold uppercase tracking-wider">
                              Faculty
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] truncate mt-0.5">
                            {position}
                          </p>
                          {institute && (
                            <p className="text-xs text-[#475569] flex items-center gap-1.5 mt-1 truncate">
                              <Building2 size={13} className="text-[#94A3B8] shrink-0" />
                              <span className="truncate">{institute}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Experience pill if available */}
                      {experience && (
                        <div className="mt-2.5">
                          <span className="text-[11px] font-medium text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-md inline-block">
                            {experience}+ years experience
                          </span>
                        </div>
                      )}

                      {/* Expertise domains / skills */}
                      <div className="mt-3.5 pt-3 border-t border-[#F1F5F9]">
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                          Expertise Domains
                        </p>
                        {expertise.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {expertise.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] rounded-lg text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#94A3B8] italic">
                            Academic guidance & research
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="mt-5 pt-3.5 border-t border-[#F1F5F9]">
                      {status === "accepted" ? (
                        <div className="w-full py-2.5 px-3 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                          <Check size={14} />
                          <span>Connected</span>
                        </div>
                      ) : status === "pending" ? (
                        <div className="w-full py-2.5 px-3 bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                          <Clock size={14} />
                          <span>Request Pending</span>
                        </div>
                      ) : status === "rejected" ? (
                        <button
                          onClick={() => handleOpenConnect(mentor)}
                          className="w-full py-2.5 px-3 bg-white hover:bg-[#6D3DF5] text-[#6D3DF5] hover:text-white border border-[#E2E8F0] hover:border-[#6D3DF5] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Re-request Guidance</span>
                          <Send size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenConnect(mentor)}
                          className="w-full py-2.5 px-4 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 group cursor-pointer"
                        >
                          <span>Connect</span>
                          <ArrowRight
                            size={14}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB B: MY REQUESTS (Existing requests tracking & details)           */}
      {/* ==================================================================== */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Controls: Search & Status Filters */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                type="text"
                placeholder="Search by mentor name, topic, or institution..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D3DF5] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 [scrollbar-width:none]">
              {["all", "pending", "accepted", "rejected"].map((f) => {
                const isActive = requestFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setRequestFilter(f)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#6D3DF5] text-white shadow-xs"
                        : "bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Requests Content */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#6D3DF5] animate-spin" />
              <p className="text-xs font-semibold text-[#64748B]">Loading mentor requests...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-[#FEE2E2] p-8 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#EF4444]">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172554]">Error Loading Requests</h3>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm">{error}</p>
              </div>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0] flex items-center justify-center mx-auto">
                <MessageSquare size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">No requests found</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 leading-relaxed">
                  {requestFilter === "all"
                    ? "You haven't sent any mentorship requests yet. Browse verified faculty mentors and request a session."
                    : `No requests with status '${requestFilter}' were found.`}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("explore")}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Users size={14} />
                <span>Explore Faculty Mentors</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((request) => (
                <motion.div
                  layout
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 border-b border-[#F1F5F9] flex justify-between items-start gap-3">
                    <div
                      onClick={() => {
                        const fid = request.faculty?.id || request.faculty?._id;
                        if (fid) navigate(`/profile/${fid}`);
                      }}
                      className="flex items-center gap-3 min-w-0 cursor-pointer group/faculty"
                    >
                      <Avatar
                        name={request.faculty.name}
                        src={request.faculty.avatar}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-[#F1F5F9] flex-shrink-0"
                        initialsClassName="text-xs font-bold text-white"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-[#0F172A] truncate">
                          {request.faculty.name}
                        </h3>
                        <p className="text-xs text-[#64748B] truncate">
                          {request.faculty.institute}
                        </p>
                        <p className="text-[11px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                          <Clock size={11} />
                          <span>{request.requestDate}</span>
                        </p>
                      </div>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider shrink-0 ${getStatusBadge(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3 flex-1">
                    <div>
                      <span className="text-[10px] font-bold text-[#6D3DF5] uppercase tracking-wider">
                        Topic
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] line-clamp-1 mt-0.5">
                        {request.task.title}
                      </h4>
                      <p className="text-xs text-[#64748B]">{request.task.company}</p>
                    </div>

                    {request.status === "accepted" && request.meetLink && (
                      <div className="bg-[#ECFDF5] rounded-xl p-3 border border-[#A7F3D0]">
                        <p className="text-[10px] font-bold text-[#059669] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <CheckCircle size={12} /> Session Link
                        </p>
                        <a
                          href={request.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#059669] font-bold hover:underline flex items-center gap-1.5 truncate"
                        >
                          <Video size={13} />
                          <span className="truncate">{request.meetLink}</span>
                          <ExternalLink size={12} className="shrink-0" />
                        </a>
                      </div>
                    )}

                    {request.message && (
                      <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#F1F5F9]">
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1 flex items-center gap-1">
                          <MessageSquare size={11} /> Your Message
                        </p>
                        <p className="text-xs text-[#334155] italic line-clamp-2">
                          "{request.message}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="p-3.5 bg-[#F8FAFC] border-t border-[#F1F5F9]">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="w-full py-2 px-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* CONNECT WITH MENTOR MODAL                                            */}
      {/* ==================================================================== */}
      {isConnectModalOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 touch-none">
          <div role="dialog" aria-modal="true" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-md w-full p-6 relative overscroll-contain">
            <button
              onClick={() => setIsConnectModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {connectSuccess ? (
              <div className="p-5 space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center mx-auto">
                  <Check size={20} strokeWidth={3} />
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
                    className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-xl text-xs font-bold hover:bg-[#F8FAFC] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={connecting || !selectedTaskId}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
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

      {/* ==================================================================== */}
      {/* REQUEST DETAILS MODAL                                                */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs touch-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden overscroll-contain"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F3EEFF]/60">
                <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                        selectedRequest.status,
                    )} mx-4`}
                >
                    {selectedRequest.status.toUpperCase()}
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-white cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto overscroll-contain">
                {/* Faculty Info */}
                <div className="flex gap-3.5 items-center p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <Avatar
                    name={selectedRequest.faculty.name}
                    src={selectedRequest.faculty.avatar}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs"
                    initialsClassName="text-sm font-bold text-white"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#0F172A] truncate">
                      {selectedRequest.faculty.name}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">{selectedRequest.faculty.accountType}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Building2 size={12} className="text-[#6D3DF5]" /> {selectedRequest.faculty.institute}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Award size={12} className="text-[#6D3DF5]" /> {selectedRequest.faculty.expertise}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Task Info */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={18} className="text-[#6D3DF5]" /> Task Information
                  </h4>
                  <div className="border border-gray-100 rounded-2xl p-4">
                    <h5 className="font-bold text-gray-800">{selectedRequest.task.title}</h5>
                    <p className="text-sm text-gray-500 mb-3">{selectedRequest.task.company}</p>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="px-2 py-1 bg-[#F3EEFF] text-[#6D3DF5] rounded-md capitalize">
                        {selectedRequest.task.category}
                      </span>
                      <span className="text-[#94A3B8]">
                        Requested: {selectedRequest.requestDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meeting Link */}
                {selectedRequest.status === "accepted" && selectedRequest.meetLink && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <ExternalLink size={18} className="text-[#6D3DF5]" /> Meeting Link
                    </h4>
                    <div className="border border-[#A7F3D0] bg-[#ECFDF5] rounded-xl p-3.5">
                      <a
                        href={selectedRequest.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#059669] font-bold hover:underline flex items-center gap-2 truncate"
                      >
                        <span className="truncate">{selectedRequest.meetLink}</span>
                        <ExternalLink size={13} className="shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare size={18} className="text-[#6D3DF5]" /> Your Message
                  </h4>
                  <div className="bg-[#F3EEFF]/40 rounded-2xl p-4 border border-[#EDE9FE]/50">
                    <p className="text-gray-700 leading-relaxed italic">
                      "{selectedRequest.message || "No message provided."}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#F1F5F9] bg-[#F8FAFC] flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-xs font-bold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-all shadow-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
