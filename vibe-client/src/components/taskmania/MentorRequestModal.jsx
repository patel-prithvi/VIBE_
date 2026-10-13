import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Search, Check, Send, AlertCircle } from "lucide-react";
import api from "../../services/api";

export const MentorRequestModal = ({ isOpen, onClose, task }) => {
  const [mentors, setMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMentors();
      setSelectedMentor(null);
      setMessage("");
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/mentor-requests/all-faculty");
      console.log("Mentors fetched successfully:", response.data);
      if (response.data && response.data.data) {
        setMentors(response.data.data);
      }
    } catch (err) {
      console.error("Detailed error fetching mentors:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || "Failed to fetch mentors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMentor) {
      setError("Please select a mentor");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/mentor-requests/request", {
        facultyId: selectedMentor._id,
        taskId: task.id,
        message: message,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error sending mentor request:", err);
      setError(
        err.response?.data?.message || "Failed to send request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(
    (m) =>
      m.accountType === "faculty" && (
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof m.Profile?.ExpertiseDomains === 'string' && 
       m.Profile.ExpertiseDomains.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (Array.isArray(m.Profile?.ExpertiseDomains) && 
       m.Profile.ExpertiseDomains.some((d) =>
        d.toLowerCase().includes(searchQuery.toLowerCase())
      )))
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-orange-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Request Mentor</h2>
                <p className="text-sm text-gray-500 line-clamp-1">For: {task?.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {success ? (
              <div className="py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check size={32} />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                <p className="text-gray-500">
                  Your request for mentorship has been sent to {selectedMentor?.name}.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search & Mentor Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select a Mentor
                  </label>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by name or expertise..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                    {loading && mentors.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-gray-500">Loading mentors...</div>
                    ) : filteredMentors.length > 0 ? (
                      filteredMentors.map((mentor) => (
                        <div
                          key={mentor._id}
                          onClick={() => setSelectedMentor(mentor)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                            selectedMentor?._id === mentor._id
                              ? "bg-orange-50 border-orange-500 shadow-sm"
                              : "bg-white border-gray-100 hover:border-orange-200"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                            {mentor.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900 truncate">{mentor.name}</p>
                              <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full font-bold uppercase tracking-wider">
                                {mentor.accountType}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {Array.isArray(mentor.Profile?.ExpertiseDomains) 
                                ? mentor.Profile.ExpertiseDomains.join(", ") 
                                : mentor.Profile?.ExpertiseDomains || "General Expert"}
                            </p>
                          </div>
                          {selectedMentor?._id === mentor._id && (
                            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-gray-500">No mentors found.</div>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    placeholder="Briefly describe what help you need from the mentor..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedMentor}
                className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-orange-600 rounded-2xl hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Send Request
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
