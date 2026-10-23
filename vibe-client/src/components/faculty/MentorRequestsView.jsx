import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Award,
  Clock,
  Filter,
  Search,
  ExternalLink,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";
import api from '../../services/api';
import { useToast } from '../Toast';
import Avatar from '../shared/Avatar';
import { useScrollLock } from '../../hooks/useScrollLock';

export const MentorRequestsView = ({ onBackToFeed }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState(() => {
    return sessionStorage.getItem("vibe_faculty_requests_filter") || "all";
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return sessionStorage.getItem("vibe_faculty_requests_search") || "";
  });
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    sessionStorage.setItem("vibe_faculty_requests_filter", newFilter);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    sessionStorage.setItem("vibe_faculty_requests_search", val);
  };

  const handleOpenTaskDetails = (taskId) => {
    if (!taskId) {
      toast.error("This task is no longer available or was removed.");
      return;
    }
    try {
      localStorage.setItem("vibe_faculty_tab", "mentorship");
    } catch (e) {
      // ignore
    }
    navigate(`/tasks/${taskId}`, {
      state: {
        from: "/dashboard/faculty?view=mentorship",
        fromTab: "mentorship",
      },
    });
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingRequestId, setAcceptingRequestId] = useState(null);
  useScrollLock(Boolean(selectedRequest || acceptingRequestId));
  const [meetLink, setMeetLink] = useState("");
  const [resources, setResources] = useState([{ label: "", url: "" }]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/mentor-requests/faculty-requests");
      if (response.data && response.data.data) {
        // Map backend data to frontend structure
        const mappedRequests = response.data.data.map(req => ({
          id: req._id,
          student: {
            id: req.student?._id || req.student?.id,
            _id: req.student?._id || req.student?.id,
            name: req.student?.name || "Student",
            email: req.student?.email || "",
            avatar: req.student?.ImageUrl || req.student?.avatar || req.student?.Profile?.ImageUrl || "",
            college: req.student?.Profile?.InstituteName || "N/A",
            year: req.student?.Profile?.YearOfStudy || "N/A",
            branch: req.student?.Profile?.Branch || "N/A",
          },
          task: {
            title: req.task?.title || "Mentorship Session",
            company: req.task?.companyName || "VIBE Task",
            category: req.task?.category || "General",
            deadline: req.task?.lastDateToSubmit ? new Date(req.task.lastDateToSubmit).toLocaleDateString() : "Flexible",
            id: req.task?._id || req.task?.id || (typeof req.task === "string" ? req.task : null),
          },
          requestDate: new Date(req.createdAt).toLocaleDateString(),
          message: req.message,
          status: req.status,
          skills: req.skills || [],
          meetLink: req.meetLink || "",
          resources: req.resources || [],
        }));
        setRequests(mappedRequests);
      }
    } catch (err) {
      console.error("Error fetching mentor requests:", err);
      setError("Failed to fetch mentor requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClick = (requestId) => {
    setAcceptingRequestId(requestId);
    setMeetLink(""); // Reset for new entry
    setResources([{ label: "", url: "" }]); // Reset resources
  };

  const handleAcceptSubmit = async () => {
    if (!meetLink.trim()) {
      toast.error("Please provide a meeting link.");
      return;
    }

    // Filter out empty resources
    const filteredResources = resources.filter(r => r.label.trim() && r.url.trim());

    try {
      await api.patch(`/mentor-requests/update-status/${acceptingRequestId}`, { 
        status: "accepted", 
        meetLink,
        resources: filteredResources 
      });
      setRequests(
        requests.map((req) =>
          req.id === acceptingRequestId ? { ...req, status: "accepted", meetLink, resources: filteredResources } : req,
        ),
      );
      toast.success("Request accepted! Student will be notified.");
      setAcceptingRequestId(null);
      setSelectedRequest(null);
    } catch (err) {
      console.error("Error accepting request:", err);
      toast.error(err.response?.data?.message || "Failed to accept request. Please try again.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.patch(`/mentor-requests/update-status/${requestId}`, { status: "rejected" });
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, status: "rejected" } : req,
        ),
      );
      toast.info("Request rejected. Student will be notified.");
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast.error(err.response?.data?.message || "Failed to reject request. Please try again.");
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesFilter = filter === "all" || req.status === filter;
    const matchesSearch =
      req.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.task.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]";
      case "accepted":
        return "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]";
      case "rejected":
        return "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Header Card with Filter Buttons */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Mentorship Requests
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Review, accept, and schedule sessions with student mentees
            </p>
          </div>

          {onBackToFeed && (
            <button
              onClick={onBackToFeed}
              className="self-start sm:self-auto text-xs font-bold text-[#6D3DF5] hover:underline"
            >
              Back to Feed
            </button>
          )}
        </div>

        {/* Filter Pills and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {["all", "pending", "accepted", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? "bg-[#6D3DF5] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#6D3DF5] hover:bg-[#F2ECFF]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            <input
              type="text"
              placeholder="Search by student name or topic..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D3DF5] focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#6D3DF5] animate-spin mb-4" />
          <p className="text-[#64748B] font-medium text-sm">Loading requests...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Requests</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchRequests}
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] shadow-sm">
          <div className="w-20 h-20 bg-[#F2ECFF] rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} className="text-[#6D3DF5]" />
          </div>
          <h3 className="text-xl font-bold text-[#172554] mb-2">No requests found</h3>
          <p className="text-[#64748B]">
            {filter === "all"
              ? "You haven't received any mentor requests yet."
              : `No ${filter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => (
            <motion.div
              layout
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#E1E8F2] shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-[#E1E8F2] flex justify-between items-start">
                <div
                  onClick={() => {
                    const sid = request.student.id || request.student._id;
                    if (sid) navigate(`/profile/${sid}`);
                  }}
                  className="flex gap-4 items-center cursor-pointer group/student"
                >
                  <Avatar
                    name={request.student.name}
                    src={request.student.avatar}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E2E8F0] group-hover/student:ring-[#6D3DF5]/30 transition-all flex-shrink-0"
                    initialsClassName="text-sm font-bold text-white"
                  />
                  <div>
                    <h3 className="font-bold text-[#172554] group-hover/student:text-[#6D3DF5] transition-colors">{request.student.name}</h3>
                    <p className="text-xs text-[#64748B] flex items-center gap-1">
                      <Clock size={12} /> {request.requestDate}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                    request.status,
                  )}`}
                >
                  {request.status.toUpperCase()}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-bold text-[#6D3DF5] uppercase tracking-wider mb-1">
                    Task Details
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenTaskDetails(request.task.id);
                    }}
                    className="group/task text-left font-bold text-[#172554] hover:text-[#6D3DF5] transition-colors cursor-pointer line-clamp-1 hover:underline decoration-[#6D3DF5]/40 underline-offset-2 flex items-center gap-1.5 focus:outline-none"
                    title={`View full details for "${request.task.title}"`}
                  >
                    <span>{request.task.title}</span>
                    <ExternalLink
                      size={13}
                      className="text-[#94A3B8] group-hover/task:text-[#6D3DF5] opacity-70 group-hover/task:opacity-100 transition-all flex-shrink-0"
                    />
                  </button>
                  <p className="text-sm text-[#64748B] mt-0.5">{request.task.company}</p>
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E1E8F2]">
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MessageSquare size={12} /> Student Message
                  </p>
                  <p className="text-sm text-[#172554] italic line-clamp-3">
                    "{request.message || "No message provided."}"
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {request.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-[#F2ECFF] border border-[#E1E8F2] text-[#6D3DF5] text-[10px] font-bold rounded-md uppercase"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-[#F8FAFC] border-t border-[#E1E8F2] flex gap-3">
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="flex-1 px-4 py-2 bg-white border border-[#E1E8F2] text-[#172554] rounded-xl text-sm font-bold hover:bg-[#F2ECFF] hover:text-[#6D3DF5] transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={16} /> Details
                </button>
                {request.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                      title="Reject Request"
                    >
                      <XCircle size={20} />
                    </button>
                    <button
                      onClick={() => handleAcceptClick(request.id)}
                      className="px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> Accept
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm touch-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden overscroll-contain"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F3EEFF]/60">
                <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XCircle size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto overscroll-contain">
                {/* Student Info */}
                <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-2xl">
                  <Avatar
                    name={selectedRequest.student.name}
                    src={selectedRequest.student.avatar}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                    initialsClassName="text-base font-bold text-white"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedRequest.student.name}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedRequest.student.email}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Award size={12} className="text-[#6D3DF5]" /> {selectedRequest.student.college}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <User size={12} className="text-[#6D3DF5]" /> {selectedRequest.student.year} • {selectedRequest.student.branch}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Task Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Calendar size={18} className="text-[#6D3DF5]" /> Task Information
                    </h4>
                    {selectedRequest.task.id && (
                      <button
                        type="button"
                        onClick={() => handleOpenTaskDetails(selectedRequest.task.id)}
                        className="text-xs font-bold text-[#6D3DF5] hover:text-[#5B2FD6] flex items-center gap-1 hover:underline"
                      >
                        View Full Task <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                  <div className="border border-gray-100 rounded-2xl p-4">
                    <button
                      type="button"
                      onClick={() => handleOpenTaskDetails(selectedRequest.task.id)}
                      className="group/modaltask text-left font-bold text-gray-800 hover:text-[#6D3DF5] transition-colors cursor-pointer flex items-center gap-1.5 hover:underline decoration-[#6D3DF5]/40 underline-offset-2 focus:outline-none"
                      title={`View full details for "${selectedRequest.task.title}"`}
                    >
                      <span>{selectedRequest.task.title}</span>
                      <ExternalLink size={13} className="text-[#94A3B8] group-hover/modaltask:text-[#6D3DF5] transition-colors" />
                    </button>
                    <p className="text-sm text-gray-500 mb-3 mt-0.5">{selectedRequest.task.company}</p>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="px-2 py-1 bg-[#F3EEFF] text-[#6D3DF5] rounded-md capitalize">
                        {selectedRequest.task.category}
                      </span>
                      <span className="text-gray-400">Deadline: {selectedRequest.task.deadline}</span>
                    </div>
                  </div>
                </div>

                {/* Meet Link */}
                {selectedRequest.status === "accepted" && selectedRequest.meetLink && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <ExternalLink size={18} className="text-[#6D3DF5]" /> Meeting Link
                    </h4>
                    <div className="border border-green-100 bg-green-50/30 rounded-2xl p-4">
                      <a href={selectedRequest.meetLink} target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline flex items-center gap-2">
                        {selectedRequest.meetLink} <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Shared Resources */}
                {selectedRequest.status === "accepted" && selectedRequest.resources && selectedRequest.resources.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <FileText size={18} className="text-[#6D3DF5]" /> Shared Resources
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedRequest.resources.map((res, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg text-gray-400">
                              <FileText size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{res.label}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{res.url}</p>
                            </div>
                          </div>
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 text-[#6D3DF5] hover:bg-[#F3EEFF] rounded-lg transition-all">
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare size={18} className="text-[#6D3DF5]" /> Message
                  </h4>
                  <div className="bg-[#F3EEFF]/40 rounded-2xl p-4 border border-[#EDE9FE]/50">
                    <p className="text-gray-700 leading-relaxed italic">
                      "{selectedRequest.message || "No message provided."}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
                {selectedRequest.status === "pending" && (
                  <button
                    onClick={() => {
                      handleAcceptClick(selectedRequest.id);
                    }}
                    className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-[#6D3DF5] rounded-2xl hover:bg-[#5B2FD6] transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Accept Request
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Accept Request Modal */}
      <AnimatePresence>
        {acceptingRequestId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAcceptingRequestId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm touch-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden overscroll-contain"
            >
              <div className="p-6 border-b border-gray-100 bg-[#F2ECFF]">
                <h2 className="text-xl font-bold text-gray-900">Accept Request</h2>
                <p className="text-sm text-[#64748B] mt-1">Provide meeting links and resources for the student.</p>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto overscroll-contain">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meeting Link (Google Meet, Zoom, etc.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6D3DF5] outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Additional Resources (Optional)
                    </label>
                    <button
                      onClick={() => setResources([...resources, { label: "", url: "" }])}
                      className="p-1.5 text-[#6D3DF5] hover:bg-[#F2ECFF] rounded-lg transition-all"
                      title="Add Resource"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {resources.map((resource, index) => (
                      <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Resource Label (e.g. Study Material)"
                            value={resource.label}
                            onChange={(e) => {
                              const newRes = [...resources];
                              newRes[index].label = e.target.value;
                              setResources(newRes);
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6D3DF5] outline-none"
                          />
                          <input
                            type="url"
                            placeholder="Resource URL"
                            value={resource.url}
                            onChange={(e) => {
                              const newRes = [...resources];
                              newRes[index].url = e.target.value;
                              setResources(newRes);
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6D3DF5] outline-none"
                          />
                        </div>
                        {resources.length > 1 && (
                          <button
                            onClick={() => setResources(resources.filter((_, i) => i !== index))}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all mt-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                <button
                  onClick={() => setAcceptingRequestId(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptSubmit}
                  disabled={!meetLink.trim()}
                  className="flex-[2] px-4 py-2.5 text-sm font-bold text-white bg-[#6D3DF5] rounded-xl hover:bg-[#5B2FD6] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm & Accept
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
