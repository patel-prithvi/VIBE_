import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Users, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "../shared/Avatar";
import api from "../../services/api";
import { REACTION_TYPES } from "./PostCard";

export const ReactionsModal = ({
  isOpen,
  onClose,
  postId,
  initialReactionType = "all",
  refreshTrigger,
}) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(initialReactionType);
  const [reactions, setReactions] = useState([]);
  const [breakdown, setBreakdown] = useState({ all: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReactions = useCallback(
    async (typeToFetch = selectedTab) => {
      if (!postId) return;
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/posts/${postId}/reactions`, {
          params: { type: typeToFetch },
        });
        if (res.data?.data) {
          setReactions(res.data.data.reactions || []);
          if (res.data.data.breakdown) {
            setBreakdown(res.data.data.breakdown);
          }
        }
      } catch (err) {
        console.error("Error fetching post reactions:", err);
        setError(
          err.response?.data?.message ||
            "Could not load reactions. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [postId, selectedTab]
  );

  useEffect(() => {
    if (isOpen) {
      fetchReactions(selectedTab);
    }
  }, [isOpen, postId, refreshTrigger]);

  // Reset to initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedTab(initialReactionType || "all");
    }
  }, [isOpen, initialReactionType]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleTabChange = (type) => {
    setSelectedTab(type);
    fetchReactions(type);
  };

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  if (!isOpen) return null;

  // Build filter tabs: "All" first, then any reaction types with reactions
  const availableTabs = [
    { id: "all", label: "All", count: breakdown.all || 0, emoji: "✨" },
    ...REACTION_TYPES.map((r) => ({
      ...r,
      count: breakdown[r.id] || 0,
    })),
  ].filter((t) => t.id === "all" || t.count > 0);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden text-[#0F172A]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#0F172A]">Reactions</h3>
              {breakdown.all > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F3EEFF] text-[#6D3DF5] border border-[#E9E1FF]">
                  {breakdown.all}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Reaction Type Filter Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-[#F1F5F9] overflow-x-auto select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 bg-[#FAF9FF]/60">
            {availableTabs.map((tab) => {
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#6D3DF5] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-white"
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-[#64748B]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 [scrollbar-width:thin]">
            {loading ? (
              <div className="py-14 text-center flex flex-col items-center justify-center space-y-2.5">
                <Loader2 size={26} className="text-[#6D3DF5] animate-spin" />
                <p className="text-xs font-semibold text-[#64748B]">
                  Loading reactions...
                </p>
              </div>
            ) : error ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
                <p className="text-xs font-medium text-red-600 max-w-xs">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchReactions(selectedTab)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0F172A] transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Retry</span>
                </button>
              </div>
            ) : reactions.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center mb-1">
                  <Users size={22} />
                </div>
                <h4 className="font-bold text-sm text-[#0F172A]">No reactions yet</h4>
                <p className="text-xs text-[#64748B] max-w-xs">
                  {selectedTab === "all"
                    ? "Be the first person to vibe with this post!"
                    : `No one has given the ${selectedTab} reaction yet.`}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {reactions.map((item) => (
                  <div
                    key={item.userId}
                    onClick={() => handleUserClick(item.userId)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF9FF] border border-transparent hover:border-[#E9E1FF] transition-all cursor-pointer group"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl bg-[#6D3DF5] p-0.5 shrink-0 overflow-hidden shadow-2xs">
                        <Avatar
                          name={item.name}
                          src={item.imageUrl}
                          variant="purple"
                          className="w-full h-full rounded-[10px] object-cover"
                          initialsClassName="text-sm font-bold text-white"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-[#0F172A] group-hover:text-[#6D3DF5] transition-colors truncate">
                            {item.name}
                          </span>
                          {/* Role Badge */}
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              item.role === "Student"
                                ? "bg-[#F3EEFF] text-[#6D3DF5] border-[#E9E1FF]"
                                : item.role === "Faculty"
                                ? "bg-[#EDE9FE] text-[#6D3DF5] border-[#DDD6FE]"
                                : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                            }`}
                          >
                            {item.role}
                          </span>
                        </div>
                        {item.profileSubtitle && (
                          <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                            {item.profileSubtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reaction Badge */}
                    <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF9FF] border border-[#E9E1FF] text-xs font-semibold text-[#0F172A] shadow-2xs">
                      <span>{item.reactionEmoji}</span>
                      <span className="hidden sm:inline font-bold text-[11px] text-[#475569]">
                        {item.reactionLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReactionsModal;
