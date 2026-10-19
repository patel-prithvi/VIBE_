import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  Loader2,
  CornerDownRight,
  ThumbsUp,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import { auth } from "../../utils/auth";
import api from "../../services/api";

export const StudentPostCard = ({
  post,
  currentUser,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const navigate = useNavigate();
  const user = currentUser || auth.getCurrentUser();
  const userId = user?._id?.toString() || user?.id?.toString();

  // Determine if post has been reacted to by the current user
  const hasUserVibed = Boolean(
    post.vibes &&
      ((typeof post.vibes.get === "function" && post.vibes.get(userId)) ||
        post.vibes[userId] === true)
  );

  const initialVibeCount = post.vibes
    ? typeof post.vibes === "number"
      ? post.vibes
      : typeof post.vibes.size === "number"
      ? post.vibes.size
      : Object.keys(post.vibes).length
    : post.vibeCount || 0;

  const [isLiked, setIsLiked] = useState(hasUserVibed);
  const [vibeCount, setVibeCount] = useState(initialVibeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(
    Array.isArray(post.comments) ? post.comments.length : post.commentCount || 0
  );

  // Handle reaction toggle
  const handleToggleVibe = async () => {
    if (!user) return;

    // Optimistic update
    const prevLiked = isLiked;
    const prevCount = vibeCount;
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? vibeCount + 1 : Math.max(0, vibeCount - 1);

    setIsLiked(nextLiked);
    setVibeCount(nextCount);

    try {
      await api.put("/posts/vibe", { postId: post.id || post._id });
    } catch (err) {
      console.error("Error toggling vibe reaction:", err);
      // Revert on failure
      setIsLiked(prevLiked);
      setVibeCount(prevCount);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const res = await api.post("/posts/comment", {
        content: newComment.trim(),
        parent: post.id || post._id,
      });

      if (res.data && res.data.data) {
        const commentData = res.data.data;
        const formattedComment = {
          _id: commentData._id,
          id: commentData._id,
          content: commentData.content,
          createdAt: commentData.createdAt || new Date().toISOString(),
          author: {
            name: user.name || "Student",
            accountType: user.accountType || user.role || "student",
            ImageUrl: user.ImageUrl || user.avatar || "",
          },
        };

        setComments((prev) => [...prev, formattedComment]);
        setCommentCount((prev) => prev + 1);
        setNewComment("");
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert(err.response?.data?.message || "Failed to submit comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const authorName = post.author?.name || "Anonymous";
  const authorAvatar = post.author?.ImageUrl || post.author?.avatar;
  const authorRole = post.author?.accountType || post.author?.role || "Student";
  const isFacultyAuthor = authorRole.toLowerCase() === "faculty";
  const authorDetails =
    post.author?.details ||
    (post.author?.Profile?.Branch
      ? `${post.author?.Profile?.YearOfStudy ? `${post.author.Profile.YearOfStudy} year` : "Student"}, ${post.author.Profile.Branch}`
      : isFacultyAuthor
      ? "Faculty Member"
      : "VIBE Student");
  const timestamp =
    post.time ||
    post.timestamp ||
    (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recently");

  return (
    <div className="vibe-card p-4 sm:p-5 transition-shadow hover:shadow-sm w-full overflow-hidden">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div
          onClick={(e) => {
            e.stopPropagation();
            const authorId = post.author?._id || post.author?.id || post.authorId || (typeof post.author === "string" ? post.author : null);
            if (authorId) navigate(`/profile/${authorId}`);
          }}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group/author"
        >
          <Avatar
            name={authorName}
            src={authorAvatar}
            className="w-10 h-10 rounded-full flex-shrink-0 object-cover ring-2 ring-[#F1F5F9] group-hover/author:ring-[#6D3DF5]/30 transition-all"
            initialsClassName="text-xs font-bold text-white"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-[#0F172A] leading-tight truncate group-hover/author:text-[#6D3DF5] transition-colors">
                {authorName}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${
                  isFacultyAuthor
                    ? "text-[#6D3DF5] bg-[#F3EEFF] border-[#E9D5FF]"
                    : "text-[#2563EB] bg-[#EFF6FF] border-[#DBEAFE]"
                }`}
              >
                {authorRole}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 truncate">
              {authorDetails} • {timestamp}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Options"
          className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* 2. Content */}
      <div className="mt-3.5 space-y-2 min-w-0">
        {post.title && (
          <h3 className="font-bold text-sm sm:text-base text-[#0F172A] leading-snug break-words">
            {post.title}
          </h3>
        )}
        <p className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line break-words overflow-hidden">
          {post.content}
        </p>

        {/* Tags */}
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium text-[#6D3DF5] bg-[#F3EEFF] px-2.5 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Media Attachments Preview */}
        {Array.isArray(post.attachments) && post.attachments.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl overflow-hidden">
            {post.attachments.map((att, idx) => {
              const url = typeof att === "string" ? att : att?.url;
              if (!url) return null;
              return (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden border border-[#E2E8F0] max-h-80 bg-[#F8FAFC]"
                >
                  <img
                    src={url}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Footer Reaction Bar */}
      <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#64748B]">
        <div className="flex items-center gap-1 sm:gap-4">
          {/* Vibe Reaction */}
          <button
            onClick={handleToggleVibe}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              isLiked
                ? "bg-[#F3EEFF] text-[#6D3DF5] font-bold"
                : "hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A]"
            }`}
            title={isLiked ? "Remove reaction" : "React"}
          >
            <span className="text-sm leading-none">🤘</span>
            <span className={`font-semibold ${isLiked ? "text-[#6D3DF5]" : "text-[#0F172A]"}`}>
              {vibeCount} vibe{vibeCount !== 1 ? 's' : ''}
            </span>
          </button>

          {/* Comments Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-all"
          >
            <MessageSquare size={16} />
            <span>{commentCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-all"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Bookmark Action */}
        <button
          onClick={() => onToggleBookmark && onToggleBookmark(post.id || post._id)}
          className={`p-1.5 rounded-xl transition-all ${
            isBookmarked
              ? "text-[#6D3DF5] bg-[#F3EEFF]"
              : "text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
          }`}
          title={isBookmarked ? "Remove bookmark" : "Save post"}
        >
          <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* 4. Expandable Comments Thread */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-[#F1F5F9] space-y-3">
          {/* New Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2.5 items-center">
            <Avatar
              name={user?.name || "Student"}
              src={user?.ImageUrl || user?.avatar}
              className="w-8 h-8 rounded-full flex-shrink-0"
              initialsClassName="text-[10px] font-bold text-white"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a supportive comment..."
                className="w-full pl-3 pr-10 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D3DF5] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6D3DF5] hover:text-[#5B2FD6] disabled:opacity-40 p-1"
              >
                {isSubmittingComment ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 pt-1">
              {comments.map((c, idx) => (
                <div
                  key={c._id || c.id || idx}
                  className="flex items-start gap-2.5 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#F1F5F9]"
                >
                  <Avatar
                    name={c.author?.name || "Member"}
                    src={c.author?.ImageUrl || c.author?.avatar}
                    className="w-7 h-7 rounded-full flex-shrink-0"
                    initialsClassName="text-[9px] font-bold text-white"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-[#0F172A] truncate">
                        {c.author?.name || "Member"}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-xs text-[#334155] mt-0.5 leading-relaxed break-words">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-[#94A3B8] py-2">
              No comments yet. Start the conversation!
            </p>
          )}
        </div>
      )}
    </div>
  );
};
