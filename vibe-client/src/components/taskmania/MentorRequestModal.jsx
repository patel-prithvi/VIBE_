import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Search, Check, Send, AlertCircle } from "lucide-react";
import api from "../../services/api";
import { useScrollLock } from "../../hooks/useScrollLock";

export const MentorRequestModal = ({ isOpen, onClose, task }) => {
  useScrollLock(isOpen);
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

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop - single layer scoped to this wrapper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px] touch-none"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-2xl vibe-modal-dialog !rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F3EEFF]/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#EDE9FE] text-[#6D3DF5] rounded-xl">
                <UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Request Mentor</h2>
                <p className="text-xs text-[#64748B] line-clamp-1">For: {task?.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto overscroll-contain">
            {success ? (
              <div className="py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-14 h-14 bg-[#ECFDF5] text-[#059669] rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <Check size={28} />
                </motion.div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-1">Request Sent!</h3>
                <p className="text-xs text-[#64748B]">
                  Your request for mentorship has been sent to {selectedMentor?.name}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search & Mentor Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-2">
                    Select a Mentor
                  </label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search by name or expertise..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6D3DF5] outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {loading && mentors.length === 0 ? (
                      <div className="col-span-2 text-center py-6 text-xs text-gray-500">Loading mentors...</div>
                    ) : filteredMentors.length > 0 ? (
                      filteredMentors.map((mentor) => (
                        <div
                          key={mentor._id}
                          onClick={() => setSelectedMentor(mentor)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            selectedMentor?._id === mentor._id
                              ? "bg-[#F3EEFF] border-[#6D3DF5] shadow-sm"
                              : "bg-white border-gray-100 hover:border-[#E9E1FF]"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#6D3DF5] font-bold">
                            {mentor.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900 truncate">{mentor.name}</p>
                              <span className="text-[10px] px-1.5 py-0.5 bg-[#EDE9FE] text-[#6D3DF5] rounded-full font-bold uppercase tracking-wider">
                                {mentor.accountType}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748B] truncate">
                              {Array.isArray(mentor.Profile?.ExpertiseDomains) 
                                ? mentor.Profile.ExpertiseDomains.join(", ") 
                                : mentor.Profile?.ExpertiseDomains || "General Expert"}
                            </p>
                          </div>
                          {selectedMentor?._id === mentor._id && (
                            <div className="w-5 h-5 bg-[#6D3DF5] rounded-full flex items-center justify-center text-white">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-6 text-xs text-gray-500">No mentors found.</div>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    Message (Optional)
                  </label>
                  <textarea
                    placeholder="Briefly describe what help you need from the mentor..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#6D3DF5] outline-none transition-all resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
                    <AlertCircle size={15} />
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="px-4 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC] flex gap-2.5 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedMentor}
                className="px-4 py-2.5 text-sm font-bold text-white bg-[#6D3DF5] rounded-xl hover:bg-[#5B2FD6] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={13} />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
