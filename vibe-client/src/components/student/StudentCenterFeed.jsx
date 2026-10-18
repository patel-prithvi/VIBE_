import React, { useState, useRef, useEffect } from "react";
import {
  Image,
  Video,
  Calendar,
  BarChart2,
  FileText,
  Search,
  Loader2,
  Inbox,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../shared/Avatar";
import { PostCard } from "../posts/PostCard";

export const StudentCenterFeed = ({
  user,
  posts = [],
  activeTab = "for-you",
  onTabChange,
  onOpenCreatePost,
  loading = false,
  searchQuery = "",
  bookmarkedIds = new Set(),
  onToggleBookmark,
  onSearchChange,
}) => {
  const [composerText, setComposerText] = useState("");
  const [internalQuery, setInternalQuery] = useState(searchQuery || "");
  const [isSearchExpanded, setIsSearchExpanded] = useState(Boolean(searchQuery));
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync if external searchQuery changes
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== internalQuery) {
      setInternalQuery(searchQuery);
      if (searchQuery) setIsSearchExpanded(true);
    }
  }, [searchQuery]);

  // Click outside listener to collapse search if query is empty
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target) &&
        !internalQuery
      ) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [internalQuery]);

  const handleQueryChange = (val) => {
    setInternalQuery(val);
    if (onSearchChange) onSearchChange(val);
  };

  const handleOpenSearch = () => {
    setIsSearchExpanded(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 80);
  };

  const handleCloseSearch = () => {
    handleQueryChange("");
    setIsSearchExpanded(false);
  };

  const tabs = [
    { id: "for-you", label: "For You" },
    { id: "mentorship", label: "Mentorship" },
    { id: "resources", label: "Resources" },
  ];

  const currentAvatar = user?.ImageUrl || user?.avatar;
  const currentName = user?.name || "Student";

  const currentQuery = (internalQuery || "").trim().toLowerCase();

  const visiblePosts = posts.filter((p) => {
    let matchesTab = true;
    if (activeTab === "mentorship") {
      const category = (p.category || p.tag || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      const content = (p.content || "").toLowerCase();
      matchesTab =
        category.includes("mentor") ||
        title.includes("mentor") ||
        title.includes("guidance") ||
        content.includes("mentorship") ||
        content.includes("mentor session");
    } else if (activeTab === "resources") {
      const category = (p.category || p.tag || "").toLowerCase();
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const hasAttachments = Array.isArray(p.attachments) && p.attachments.length > 0;
      matchesTab =
        hasAttachments ||
        category === "knowledge base" ||
        category === "knowledge" ||
        tags.some((t) => typeof t === "string" && (t.includes("resource") || t.includes("notes") || t.includes("tool") || t.includes("book")));
    }
    if (!matchesTab) return false;
    if (!currentQuery) return true;
    const titleMatch = p.title && typeof p.title === "string" && p.title.toLowerCase().includes(currentQuery);
    const contentMatch = p.content && typeof p.content === "string" && p.content.toLowerCase().includes(currentQuery);
    const authorMatch = p.author?.name && typeof p.author.name === "string" && p.author.name.toLowerCase().includes(currentQuery);
    const tagMatch = Array.isArray(p.tags) && p.tags.some((t) => typeof t === "string" && t.toLowerCase().includes(currentQuery));
    const categoryMatch = p.category && typeof p.category === "string" && p.category.toLowerCase().includes(currentQuery);
    return Boolean(titleMatch || contentMatch || authorMatch || tagMatch || categoryMatch);
  });

  const isSearchActive = Boolean(currentQuery);

  return (
    <div className="flex-1 min-w-0 space-y-4">
      {/* 1. Top Post Composer Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-0">
        <div className="flex items-start gap-3.5 min-w-0">
          <Avatar
            name={currentName}
            src={currentAvatar}
            className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-[#F1F5F9]"
            initialsClassName="text-xs font-bold text-white"
          />
          <div className="flex-1 min-w-0">
            <textarea
              rows={2}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              placeholder="Share your thoughts, doubts, or an update with the VIBE community..."
              className="w-full text-sm text-[#0F172A] placeholder-[#94A3B8] resize-none bg-transparent focus:outline-none focus:ring-0 leading-relaxed cursor-pointer"
              readOnly
            />
          </div>
        </div>

        {/* Action Options Row + Post Button */}
        <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 text-[#475569] text-xs font-semibold overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0 flex-1">
            <button
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors shrink-0 cursor-pointer"
            >
              <Image size={15} className="text-[#3B82F6]" />
              <span>Photo</span>
            </button>
            <button
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors shrink-0 cursor-pointer"
            >
              <Video size={15} className="text-[#10B981]" />
              <span>Video</span>
            </button>
            <button
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors shrink-0 cursor-pointer"
            >
              <Calendar size={15} className="text-[#F59E0B]" />
              <span>Event</span>
            </button>
            <button
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors shrink-0 cursor-pointer"
            >
              <BarChart2 size={15} className="text-[#8B5CF6]" />
              <span>Poll</span>
            </button>
            <button
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors shrink-0 cursor-pointer"
            >
              <FileText size={15} className="text-[#EC4899]" />
              <span>Resource</span>
            </button>
          </div>

          <button
            onClick={() => onOpenCreatePost && onOpenCreatePost()}
            className="px-5 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
          >
            Post
          </button>
        </div>
      </div>

      {/* 2. Feed Navigation Tabs & Expandable Search Bar */}
      <div className="border-b border-[#E2E8F0] px-1 flex items-center justify-between gap-3 min-w-0">
        {/* Left: Feed tabs */}
        <div className="flex items-center space-x-6 overflow-x-auto select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`pb-3 text-sm font-bold tracking-tight whitespace-nowrap relative transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? "text-[#6D3DF5]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#6D3DF5] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Expandable Search Bar */}
        <div ref={searchContainerRef} className="pb-2 shrink-0">
          <AnimatePresence initial={false} mode="wait">
            {!isSearchExpanded ? (
              <motion.button
                key="collapsed-search-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                type="button"
                onClick={handleOpenSearch}
                aria-label="Search posts"
                title="Search posts"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#6D3DF5] bg-[#F8FAFC] hover:bg-[#F2ECFF] border border-[#E2E8F0] hover:border-[#D8B4FE] transition-all cursor-pointer shadow-2xs group"
              >
                <Search size={14} className="group-hover:scale-110 text-[#6D3DF5] transition-transform" />
                <span className="hidden sm:inline">Search</span>
              </motion.button>
            ) : (
              <motion.div
                key="expanded-search-input"
                initial={{ width: 60, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ width: 60, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative flex items-center w-48 sm:w-64 md:w-72"
              >
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D3DF5] pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={internalQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      if (!internalQuery) setIsSearchExpanded(false);
                      else handleQueryChange("");
                    }
                  }}
                  placeholder="Search posts, topics, people..."
                  className="w-full pl-8 pr-14 py-1.5 bg-white text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] rounded-xl border border-[#6D3DF5]/60 ring-2 ring-[#6D3DF5]/15 focus:outline-none transition-all shadow-xs"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  {internalQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        handleQueryChange("");
                        searchInputRef.current?.focus();
                      }}
                      className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                      title="Clear text"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseSearch}
                    className="p-1 text-[#64748B] hover:text-[#EF4444] rounded-lg hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                    title="Close search"
                  >
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active Search Results Indicator */}
      {currentQuery && (
        <div className="bg-[#F2ECFF]/70 border border-[#E9E1FF] px-3.5 py-2 rounded-xl flex items-center justify-between text-xs text-[#5B2FD6] animate-in fade-in duration-150">
          <div className="flex items-center gap-2 truncate">
            <Search size={14} className="text-[#6D3DF5] shrink-0" />
            <span className="truncate">
              Showing <strong>{visiblePosts.length}</strong> {visiblePosts.length === 1 ? "post" : "posts"} matching <strong>"{internalQuery}"</strong>
            </span>
          </div>
          <button
            onClick={() => handleQueryChange("")}
            className="text-xs font-bold text-[#6D3DF5] hover:text-[#5B2FD6] hover:underline shrink-0 ml-3 cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* 3. Feed State Views */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E1E8F2] p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#6D3DF5] animate-spin" />
          <p className="text-sm font-semibold text-[#64748B]">Loading community feed...</p>
        </div>
      ) : visiblePosts.length === 0 ? (
        isSearchActive ? (
          <div className="bg-white rounded-2xl border border-[#E1E8F2] p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F2ECFF] text-[#6D3DF5] flex items-center justify-center">
              <Search size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#172554]">No posts found</h3>
              <p className="text-xs text-[#64748B] max-w-md leading-relaxed">
                We couldn't find any posts matching "{internalQuery}". Try different keywords or tags.
              </p>
            </div>
            <button
              onClick={() => handleQueryChange("")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E1E8F2] p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] border border-[#E1E8F2] flex items-center justify-center">
              <Inbox size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#172554]">No posts yet</h3>
              <p className="text-xs text-[#64748B] max-w-md leading-relaxed">
                Be the first to share a doubt, idea, or learning resource with the VIBE community.
              </p>
            </div>
            <button
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer"
            >
              <span>Create Post</span>
            </button>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((post, index) => {
            const pId = post.id || post._id;
            return (
              <PostCard
                post={post}
                index={index}
                key={pId}
                isBookmarked={bookmarkedIds?.has ? bookmarkedIds.has(pId) : false}
                onToggleBookmark={onToggleBookmark}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
