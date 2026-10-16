import React, { useState } from "react";
import {
  Image,
  Video,
  Calendar,
  BarChart2,
  FileText,
  Search,
  Loader2,
  Inbox,
} from "lucide-react";
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
}) => {
  const [composerText, setComposerText] = useState("");

  const tabs = [
    { id: "for-you", label: "For You" },
    { id: "mentorship", label: "Mentorship" },
    { id: "resources", label: "Resources" },
  ];

  const currentAvatar = user?.ImageUrl || user?.avatar;
  const currentName = user?.name || "Student";

  const query = (searchQuery || "").trim().toLowerCase();

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
        tags.some((t) => t.includes("resource") || t.includes("notes") || t.includes("tool") || t.includes("book"));
    }
    if (!matchesTab) return false;
    if (!query) return true;
    const titleMatch = p.title && p.title.toLowerCase().includes(query);
    const contentMatch = p.content && p.content.toLowerCase().includes(query);
    const authorMatch = p.author?.name && p.author.name.toLowerCase().includes(query);
    return Boolean(titleMatch || contentMatch || authorMatch);
  });

  const isSearchActive = Boolean(query);

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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors shrink-0"
            >
              <Image size={15} className="text-[#3B82F6]" />
              <span>Photo</span>
            </button>
            <button
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors shrink-0"
            >
              <Video size={15} className="text-[#10B981]" />
              <span>Video</span>
            </button>
            <button
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors shrink-0"
            >
              <Calendar size={15} className="text-[#F59E0B]" />
              <span>Event</span>
            </button>
            <button
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors shrink-0"
            >
              <BarChart2 size={15} className="text-[#8B5CF6]" />
              <span>Poll</span>
            </button>
            <button
              onClick={() => onOpenCreatePost && onOpenCreatePost()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors shrink-0"
            >
              <FileText size={15} className="text-[#EC4899]" />
              <span>Resource</span>
            </button>
          </div>

          <button
            onClick={() => onOpenCreatePost && onOpenCreatePost()}
            className="px-5 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0"
          >
            Post
          </button>
        </div>
      </div>

      {/* 2. Feed Navigation Tabs */}
      <div className="border-b border-[#E2E8F0] px-1 flex items-center space-x-6 overflow-x-auto select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`pb-3 text-sm font-bold tracking-tight whitespace-nowrap relative transition-colors shrink-0 ${
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
                We couldn't find any posts matching your search. Try different keywords.
              </p>
            </div>
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2"
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
