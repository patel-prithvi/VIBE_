import React, { useState } from "react";
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  CheckCircle2,
  Send,
  Loader2,
  CornerDownRight,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import { auth } from "../../utils/auth";
import api from "../../services/api";

export const FacultyPostCard = ({
  post,
  currentUser,
  isBookmarked = false,
  onToggleBookmark,
}) => {
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
            name: user.name || "Faculty Member",
            accountType: user.accountType || user.role || "faculty",
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
  const authorDetails =
    post.author?.details ||
    (post.author?.Profile?.Branch
      ? `${post.author?.Profile?.YearOfStudy ? `${post.author.Profile.YearOfStudy} year` : "Student"}, ${post.author.Profile.Branch}`
      : "VIBE Member");
  const timestamp = post.time || post.timestamp || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recently");

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm w-full min-w-0 overflow-hidden">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar
            name={authorName}
            src={authorAvatar}
            className="w-10 h-10 rounded-full flex-shrink-0 object-cover ring-2 ring-[#F1F5F9]"
            initialsClassName="text-xs font-bold text-white"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-[#0F172A] leading-tight truncate">
                {authorName}
              </span>
              <CheckCircle2 size={14} className="text-[#3B82F6] fill-[#3B82F6] text-white flex-shrink-0" />
              <span className="text-[10px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#DBEAFE] capitalize flex-shrink-0">
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
          className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-lg transition-colors flex-shrink-0"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* 2. Post Content */}
      <div className="mt-3.5 text-sm text-[#1E293B] leading-relaxed min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word]">
        {post.title && (
          <h3 className="font-bold text-base text-[#0F172A] mb-1.5 leading-snug break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {post.title}
          </h3>
        )}
        <p className="whitespace-pre-line text-sm text-[#334155] leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
          {post.content}
        </p>
      </div>

      {/* Optional Attachments / Previews */}
      {post.hasCustomPreview === "project-tips" && (
        <div className="mt-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col sm:flex-row gap-4 p-3 sm:p-4 min-w-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80"
            alt="Project desk"
            className="w-full sm:w-48 h-32 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 text-xs min-w-0 break-words [overflow-wrap:anywhere]">
            <h4 className="font-bold text-[#0F172A] text-xs mb-2">Key Takeaways</h4>
            <ul className="space-y-1.5 text-[#475569] list-disc list-inside">
              <li>Choose a real-world problem</li>
              <li>Keep your first version simple</li>
              <li>Focus on clean code and documentation</li>
              <li>Iterate and improve</li>
            </ul>
          </div>
        </div>
      )}

      {post.hasCustomPreview === "taskflow" && (
        <div className="mt-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-4 min-w-0">
          <div className="w-full sm:w-44 h-24 bg-white border border-[#E2E8F0] rounded-lg p-2 shadow-xs flex flex-col justify-center flex-shrink-0">
            <div className="h-2 w-12 bg-[#6D3DF5] rounded mb-1.5" />
            <div className="h-1.5 w-full bg-[#E2E8F0] rounded mb-1" />
            <div className="h-1.5 w-3/4 bg-[#E2E8F0] rounded mb-1" />
            <div className="h-1.5 w-1/2 bg-[#E2E8F0] rounded" />
          </div>
          <div className="flex-1 min-w-0 break-words [overflow-wrap:anywhere]">
            <h4 className="font-bold text-xs text-[#0F172A]">
              TaskFlow – A Simple Task Management App
            </h4>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Manage tasks, set priorities, and stay productive.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] rounded">React</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#F0FDF4] text-[#16A34A] rounded">Node.js</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FEF3C7] text-[#D97706] rounded">MongoDB</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#F3E8FF] text-[#7C3AED] rounded">Express.js</span>
            </div>
          </div>
        </div>
      )}

      {post.hasCustomPreview === "workshop-notes" && (
        <div className="mt-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 sm:p-4 flex items-center gap-4 min-w-0">
          <div className="w-20 h-16 bg-gradient-to-tr from-[#1E1B4B] to-[#3B82F6] rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-xs">
            <span className="font-black text-xs tracking-wider">AI</span>
          </div>
          <div className="flex-1 min-w-0 break-words [overflow-wrap:anywhere]">
            <h4 className="font-bold text-xs text-[#0F172A]">
              Workshop Notes – AI in Web Development
            </h4>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Key concepts, tools, and use cases discussed in the session.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#EEF2FF] text-[#4F46E5] rounded">AI</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] rounded">Web Development</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#F5F3FF] text-[#7C3AED] rounded">LLMs</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#F0FDF4] text-[#16A34A] rounded">Productivity</span>
            </div>
          </div>
        </div>
      )}

      {/* Attachments if any */}
      {Array.isArray(post.attachments) && post.attachments.length > 0 && (
        <div
          className={`mt-3.5 gap-2.5 overflow-hidden rounded-xl border border-[#E2E8F0] ${
            post.attachments.length === 1
              ? "grid grid-cols-1"
              : "grid grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {post.attachments.map((url, i) => (
            <div key={i} className="relative overflow-hidden bg-[#F8FAFC]">
              <img
                src={url}
                alt={`Attachment ${i + 1}`}
                className="w-full max-h-80 object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* 3. Engagement Bar */}
      <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Working VIBE Reaction (🤘) */}
          <button
            onClick={handleToggleVibe}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              isLiked
                ? "bg-[#F3EEFF] text-[#6D3DF5] font-bold"
                : "hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A]"
            }`}
            title={isLiked ? "Remove reaction" : "React 🤘"}
          >
            <span className="text-sm leading-none">🤘</span>
            <span className={`font-semibold ${isLiked ? "text-[#6D3DF5]" : "text-[#0F172A]"}`}>
              {vibeCount}
            </span>
          </button>

          {/* Comments Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              showComments
                ? "bg-[#F1F5F9] text-[#0F172A] font-bold"
                : "hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <MessageSquare size={15} />
            <span className="font-semibold text-[#0F172A]">{commentCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert("Post link copied to clipboard!");
              }
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <Share2 size={15} />
            <span className="font-semibold text-[#0F172A]">{post.shares || 4}</span>
          </button>
        </div>

        {/* Real Bookmark Toggle */}
        <button
          onClick={() => onToggleBookmark && onToggleBookmark(post.id || post._id)}
          className={`p-2 rounded-lg transition-colors ${
            isBookmarked
              ? "text-[#6D3DF5] bg-[#F3EEFF]"
              : "text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
          }`}
          aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark Post"}
        >
          <Bookmark size={16} fill={isBookmarked ? "#6D3DF5" : "none"} />
        </button>
      </div>

      {/* 4. Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-[#F1F5F9] space-y-3 min-w-0">
          {/* Add Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2.5 items-center min-w-0">
            <Avatar
              name={user?.name || "Me"}
              src={user?.ImageUrl || user?.avatar}
              className="w-8 h-8 rounded-full flex-shrink-0 object-cover ring-1 ring-[#E2E8F0]"
              initialsClassName="text-xs font-bold text-[#172554]"
            />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 min-w-0 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/15 transition-all"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmittingComment}
              className="px-3.5 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
            >
              {isSubmittingComment ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send size={12} />
                </>
              )}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 pt-1 min-w-0">
            {comments.length > 0 ? (
              comments.map((comment, idx) => {
                const cAuthor = comment.author?.name || "VIBE Member";
                const cAvatar = comment.author?.ImageUrl || comment.author?.avatar;
                const cTime = comment.createdAt
                  ? new Date(comment.createdAt).toLocaleDateString()
                  : "Recently";

                return (
                  <div
                    key={comment._id || comment.id || idx}
                    className="flex items-start gap-2.5 bg-[#F8FAFC] rounded-xl p-3 border border-[#F1F5F9] min-w-0"
                  >
                    <Avatar
                      name={cAuthor}
                      src={cAvatar}
                      className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                      initialsClassName="text-[10px] font-bold text-white"
                    />
                    <div className="flex-1 text-xs min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#0F172A] truncate">{cAuthor}</span>
                        <span className="text-[10px] text-[#94A3B8] shrink-0">{cTime}</span>
                      </div>
                      <p className="text-[#334155] mt-1 leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-[#94A3B8] py-2">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

