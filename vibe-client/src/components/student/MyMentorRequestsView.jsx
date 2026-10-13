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
  Filter,
  Search,
  ExternalLink,
  AlertCircle,
  Loader2,
  Building2,
} from "lucide-react";
import api from '../../services/api';

export const MyMentorRequestsView = () => {
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
      const response = await api.get("/mentor-requests/my-requests");
      if (response.data && response.data.data) {
        // Map backend data to frontend structure
        const mappedRequests = response.data.data.map(req => ({
          id: req._id,
          faculty: {
            name: req.faculty.name,
            email: req.faculty.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.faculty.name)}&background=random`,
            accountType: req.faculty.accountType,
            institute: req.faculty.Profile?.InstituteName || "N/A",
            expertise: Array.isArray(req.faculty.Profile?.ExpertiseDomains) 
                ? req.faculty.Profile.ExpertiseDomains.join(", ") 
                : req.faculty.Profile?.ExpertiseDomains || "N/A",
          },
          task: {
            title: req.task.title,
            company: req.task.companyName,
            category: req.task.category,
            deadline: new Date(req.task.lastDateToSubmit).toLocaleDateString(),
            id: req.task._id,
          },
          requestDate: new Date(req.createdAt).toLocaleDateString(),
          message: req.message,
          status: req.status,
          skills: req.skills || [],
          meetLink: req.meetLink || "",
        }));
        setRequests(mappedRequests);
      }
    } catch (err) {
      console.error("Error fetching my mentor requests:", err);
      setError("Failed to fetch mentor requests. Please try again.");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "accepted":
        return "bg-green-50 text-green-600 border-green-100";
      case "rejected":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Mentor Requests</h1>
          <p className="text-gray-500">Track and view the status of your mentorship requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
            {["all", "pending", "accepted", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by mentor name, task or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading requests...</p>
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
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500">
            {filter === "all"
              ? "You haven't requested any mentors yet."
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
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                <div className="flex gap-4">
                  <img
                    src={request.faculty.avatar}
                    alt={request.faculty.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-orange-100"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{request.faculty.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
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
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                    Task Details
                  </p>
                  <h4 className="font-bold text-gray-800 line-clamp-1">
                    {request.task.title}
                  </h4>
                  <p className="text-sm text-gray-500">{request.task.company}</p>
                </div>

                {request.status === "accepted" && request.meetLink && (
                  <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle size={14} /> Meeting Link
                    </p>
                    <a href={request.meetLink} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 font-medium hover:underline flex items-center gap-2">
                      {request.meetLink} <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {!request.meetLink && (
                  <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MessageSquare size={12} /> Your Message
                  </p>
                  <p className="text-sm text-gray-700 italic line-clamp-3">
                    "{request.message || "No message provided."}"
                  </p>
                </div>
                )}
                
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex gap-3">
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={16} /> Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-orange-50/50">
                <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        selectedRequest.status,
                    )} mx-4`}
                >
                    {selectedRequest.status.toUpperCase()}
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-auto"
                >
                  <XCircle size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Faculty Info */}
                <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-2xl">
                  <img
                    src={selectedRequest.faculty.avatar}
                    alt={selectedRequest.faculty.name}
                    className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedRequest.faculty.name}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">{selectedRequest.faculty.accountType}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Building2 size={12} className="text-orange-500" /> {selectedRequest.faculty.institute}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Award size={12} className="text-orange-500" /> {selectedRequest.faculty.expertise}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Task Info */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={18} className="text-orange-500" /> Task Information
                  </h4>
                  <div className="border border-gray-100 rounded-2xl p-4">
                    <h5 className="font-bold text-gray-800">{selectedRequest.task.title}</h5>
                    <p className="text-sm text-gray-500 mb-3">{selectedRequest.task.company}</p>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-md capitalize">
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
                      <ExternalLink size={18} className="text-orange-500" /> Meeting Link
                    </h4>
                    <div className="border border-green-100 bg-green-50/30 rounded-2xl p-4">
                      <a href={selectedRequest.meetLink} target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline flex items-center gap-2">
                        {selectedRequest.meetLink} <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare size={18} className="text-orange-500" /> Your Message
                  </h4>
                  <div className="bg-orange-50/30 rounded-2xl p-4 border border-orange-100/50">
                    <p className="text-gray-700 leading-relaxed italic">
                      "{selectedRequest.message || "No message provided."}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all"
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
