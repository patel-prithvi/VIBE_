import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Avatar from "../shared/Avatar";
import api from "../../services/api";

export const MyMentorRequestsView = ({ onBackToFeed }) => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/mentor-requests/my-requests");
      if (response.data && response.data.data) {
        const mappedRequests = response.data.data.map((req) => ({
          id: req._id,
          faculty: {
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
      console.error("Error fetching my mentor requests:", err);
      setError("Failed to fetch mentor requests. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesFilter = filter === "all" || req.status === filter;
    const matchesSearch =
      req.faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.task.company.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="w-full min-w-0 space-y-5">
      {/* 1. Page Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center flex-shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Mentorship Requests
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Track your connections, guidance sessions, and mentor updates
            </p>
          </div>
        </div>

        {onBackToFeed && (
          <button
            onClick={onBackToFeed}
            className="flex items-center gap-1.5 text-xs font-bold text-[#6D3DF5] hover:text-[#5B2FD6] transition-colors self-start sm:self-auto"
          >
            <ArrowLeft size={14} />
            <span>Back to Feed</span>
          </button>
        )}
      </div>

      {/* 2. Controls: Search & Status Filters */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            placeholder="Search by mentor name, topic, or institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D3DF5] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 [scrollbar-width:none]">
          {["all", "pending", "accepted", "rejected"].map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
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

      {/* 3. Content */}
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
            onClick={fetchRequests}
            className="px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
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
              {filter === "all"
                ? "You haven't sent any mentorship requests yet. Connect with recommended faculty mentors from your dashboard feed."
                : `No requests with status '${filter}' were found.`}
            </p>
          </div>
          {onBackToFeed && (
            <button
              onClick={onBackToFeed}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#172554] hover:bg-[#0F172A] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Explore Mentors on Home Feed
            </button>
          )}
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
                <div className="flex items-center gap-3 min-w-0">
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
                  className="w-full py-2 px-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Eye size={14} />
                  <span>View Details</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden"
            >
              <div className="p-5 border-b border-[#F1F5F9] flex justify-between items-center bg-[#F8FAFC]">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-[#0F172A]">Request Details</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(
                      selectedRequest.status
                    )}`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-white"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
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
                    <p className="text-xs text-[#64748B]">
                      {selectedRequest.faculty.institute}
                    </p>
                    <p className="text-[11px] text-[#6D3DF5] font-medium mt-0.5">
                      Expertise: {selectedRequest.faculty.expertise}
                    </p>
                  </div>
                </div>

                {/* Topic Info */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#6D3DF5]" /> Mentorship Topic
                  </h4>
                  <div className="border border-[#E2E8F0] rounded-xl p-3.5 bg-white">
                    <h5 className="font-bold text-xs sm:text-sm text-[#0F172A]">
                      {selectedRequest.task.title}
                    </h5>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {selectedRequest.task.company}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-medium mt-2 pt-2 border-t border-[#F1F5F9]">
                      <span className="px-2 py-0.5 bg-[#F3EEFF] text-[#6D3DF5] rounded-md font-semibold capitalize">
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
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                      <Video size={14} className="text-[#059669]" /> Online Session Link
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
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-[#6D3DF5]" /> Your Message
                  </h4>
                  <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]">
                    <p className="text-xs text-[#334155] leading-relaxed italic">
                      "{selectedRequest.message || "No message provided."}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#F1F5F9] bg-[#F8FAFC] flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-xs font-bold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-all shadow-xs"
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
