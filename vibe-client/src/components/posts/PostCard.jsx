import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  Loader2,
  CornerDownRight,
  Heart,
  X,
  Maximize2,
  ChevronDown,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import { useToast } from "../Toast";
import { auth } from "../../utils/auth";
import api from "../../services/api";

// 6 LinkedIn-Style Reaction Types
export const REACTION_TYPES = [
  { id: "vibe", label: "Vibe", emoji: "🤘", color: "#6D3DF5", activeBg: "#F3EEFF", activeBorder: "#DDD6FE" },
  { id: "celebrate", label: "Celebrate", emoji: "🎉", color: "#059669", activeBg: "#ECFDF5", activeBorder: "#A7F3D0" },
  { id: "support", label: "Support", emoji: "🤝", color: "#2563EB", activeBg: "#EFF6FF", activeBorder: "#BFDBFE" },
  { id: "love", label: "Love", emoji: "❤️", color: "#EF4444", activeBg: "#FEF2F2", activeBorder: "#FECACA" },
  { id: "insightful", label: "Insightful", emoji: "💡", color: "#D97706", activeBg: "#FFFBEB", activeBorder: "#FDE68A" },
  { id: "funny", label: "Funny", emoji: "😂", color: "#0891B2", activeBg: "#ECFEFF", activeBorder: "#A5F3FC" },
];

export const PostCard = ({
  post,
  index = 0,
  currentUser: propUser,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const navigate = useNavigate();
  let toast;
  try {
    toast = useToast();
  } catch {
    toast = {
      success: (msg) => console.log(msg),
      error: (msg) => console.error(msg),
    };
  }

  const user = propUser || auth.getCurrentUser();
  const userId = user?._id?.toString() || user?.id?.toString();

  // Helper to get active reaction for current user
  const getUserReactionFromData = (vibesData, uId) => {
    if (!vibesData || !uId) return null;
    let val;
    if (typeof vibesData.get === "function") {
      val = vibesData.get(uId);
    } else if (typeof vibesData === "object") {
      val = vibesData[uId];
    }
    if (val === true || val === "true") return "vibe";
    if (typeof val === "string" && REACTION_TYPES.some((r) => r.id === val)) return val;
    return null;
  };

  // Reactions state
  const [vibesState, setVibesState] = useState(() => {
    if (!post.vibes) return {};
    if (typeof post.vibes.entries === "function") {
      return Object.fromEntries(post.vibes);
    }
    if (typeof post.vibes === "object") return { ...post.vibes };
    return {};
  });

  const [currentUserReaction, setCurrentUserReaction] = useState(() =>
    getUserReactionFromData(post.vibes, userId)
  );

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const reactionHoverTimer = useRef(null);
  const reactionPickerRef = useRef(null);

  // Sync state if post prop changes
  useEffect(() => {
    if (post.vibes) {
      let normalized = {};
      if (typeof post.vibes.entries === "function") {
        normalized = Object.fromEntries(post.vibes);
      } else if (typeof post.vibes === "object") {
        normalized = { ...post.vibes };
      }
      setVibesState(normalized);
      setCurrentUserReaction(getUserReactionFromData(normalized, userId));
    }
  }, [post.vibes, userId]);

  // Click outside listener for mobile reaction picker
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(e.target)
      ) {
        setShowReactionPicker(false);
      }
    };
    if (showReactionPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showReactionPicker]);

  // Compute total counts and breakdown
  const reactionEntries = Object.entries(vibesState);
  const totalReactions = reactionEntries.length;

  const breakdownCounts = {
    vibe: 0,
    celebrate: 0,
    support: 0,
    love: 0,
    insightful: 0,
    funny: 0,
  };
  reactionEntries.forEach(([, val]) => {
    const type = val === true || val === "true" ? "vibe" : val;
    if (breakdownCounts[type] !== undefined) {
      breakdownCounts[type]++;
    } else {
      breakdownCounts.vibe++;
    }
  });

  const topReactions = Object.entries(breakdownCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type);

  // Handle reaction selection / toggle
  const handleReactionSelect = async (reactionId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setShowReactionPicker(false);

    const prevReaction = currentUserReaction;
    const prevVibes = { ...vibesState };

    const isTogglingOff = currentUserReaction === reactionId;
    const nextReaction = isTogglingOff ? null : reactionId;

    const nextVibes = { ...vibesState };
    if (isTogglingOff) {
      delete nextVibes[userId];
    } else {
      nextVibes[userId] = reactionId;
    }

    // Optimistic update
    setCurrentUserReaction(nextReaction);
    setVibesState(nextVibes);

    try {
      await api.put("/posts/vibe", {
        postId: post.id || post._id,
        reaction: reactionId,
      });
    } catch (err) {
      console.error("Error updating reaction:", err);
      // Revert on error
      setCurrentUserReaction(prevReaction);
      setVibesState(prevVibes);
      if (toast?.error) toast.error("Failed to update reaction.");
    }
  };

  const handleMainButtonClick = () => {
    if (currentUserReaction) {
      handleReactionSelect(currentUserReaction);
    } else {
      handleReactionSelect("vibe");
    }
  };

  const handleMouseEnter = () => {
    if (reactionHoverTimer.current) clearTimeout(reactionHoverTimer.current);
    reactionHoverTimer.current = setTimeout(() => {
      setShowReactionPicker(true);
    }, 180);
  };

  const handleMouseLeave = () => {
    if (reactionHoverTimer.current) clearTimeout(reactionHoverTimer.current);
    reactionHoverTimer.current = setTimeout(() => {
      setShowReactionPicker(false);
    }, 280);
  };

  // Description "See more" expansion state
  const [isExpanded, setIsExpanded] = useState(false);
  const content = post.content || "";
  const isLongContent = content.length > 220 || (content.match(/\n/g) || []).length > 2;

  const displayContent =
    isLongContent && !isExpanded
      ? content.slice(0, 220).replace(/\s+\S*$/, "")
      : content;

  // Image Lightbox state
  const [selectedImage, setSelectedImage] = useState(null);

  // Bookmark state with fallback for views that don't pass onToggleBookmark
  const [bookmarkedState, setBookmarkedState] = useState(() => {
    if (isBookmarked) return true;
    const pId = post.id || post._id;
    if (user?.bookmarks && Array.isArray(user.bookmarks)) {
      return user.bookmarks.some((b) => (b?._id || b) === pId);
    }
    return false;
  });

  useEffect(() => {
    if (isBookmarked !== undefined) {
      setBookmarkedState(isBookmarked);
    }
  }, [isBookmarked]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const pId = post.id || post._id;
    if (onToggleBookmark) {
      onToggleBookmark(pId);
      setBookmarkedState((prev) => !prev);
    } else {
      const next = !bookmarkedState;
      setBookmarkedState(next);
      try {
        await api.post("/posts/bookmark", { postId: pId });
        if (toast?.success) {
          toast.success(next ? "Post bookmarked!" : "Bookmark removed!");
        }
      } catch (err) {
        console.error("Error toggling bookmark:", err);
        setBookmarkedState(!next);
      }
    }
  };

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(
    Array.isArray(post.comments) ? post.comments.length : post.commentCount || 0
  );
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Sync comments if post prop changes
  useEffect(() => {
    if (post.comments) {
      setComments(post.comments);
      setCommentCount(post.comments.length);
    }
  }, [post.comments]);

  // Build hierarchical comment tree
  const buildCommentTree = (list) => {
    const map = new Map();
    list.forEach((c) => {
      const cId = c.id || c._id;
      const isCommentLiked = Boolean(
        c.vibes &&
          userId &&
          (c.vibes[userId] ||
            (typeof c.vibes.get === "function" && c.vibes.get(userId)))
      );
      const likesCount =
        c.likes !== undefined
          ? c.likes
          : c.vibes
          ? typeof c.vibes.size === "number"
            ? c.vibes.size
            : Object.keys(c.vibes).length
          : 0;

      map.set(cId, {
        ...c,
        id: cId,
        _id: cId,
        isLiked: isCommentLiked,
        likes: likesCount,
        children: [],
      });
    });

    const roots = [];
    map.forEach((node) => {
      const parentId =
        typeof node.parentComment === "object" && node.parentComment !== null
          ? node.parentComment._id || node.parentComment.id
          : node.parentComment;

      if (parentId && map.has(parentId)) {
        map.get(parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // Submit top-level comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const postId = post.id || post._id;
      const res = await api.post("/posts/comment", {
        content: newComment.trim(),
        parent: postId,
      });

      if (res.data && res.data.data) {
        const commentData = res.data.data;
        const newCommentItem = {
          id: commentData._id,
          _id: commentData._id,
          parentComment: null,
          content: commentData.content,
          createdAt: commentData.createdAt || new Date().toISOString(),
          timestamp: "Just now",
          author: {
            name: user.name || "User",
            role: user.accountType || user.role || "User",
            avatar: user.ImageUrl || user.avatar || "",
          },
          vibes: {},
          likes: 0,
          isLiked: false,
        };

        setComments((prev) => [newCommentItem, ...prev]);
        setCommentCount((prev) => prev + 1);
        setNewComment("");
        if (toast?.success) toast.success("Comment added!");
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      if (toast?.error) toast.error("Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Submit nested reply
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !user || !replyFor || isSubmittingReply) return;

    try {
      setIsSubmittingReply(true);
      const postId = post.id || post._id;
      const res = await api.post("/posts/comment", {
        content: replyText.trim(),
        parent: postId,
        parentComment: replyFor,
      });

      if (res.data && res.data.data) {
        const commentData = res.data.data;
        const newReplyItem = {
          id: commentData._id,
          _id: commentData._id,
          parentComment: replyFor,
          content: commentData.content,
          createdAt: commentData.createdAt || new Date().toISOString(),
          timestamp: "Just now",
          author: {
            name: user.name || "User",
            role: user.accountType || user.role || "User",
            avatar: user.ImageUrl || user.avatar || "",
          },
          vibes: {},
          likes: 0,
          isLiked: false,
        };

        setComments((prev) => [...prev, newReplyItem]);
        setCommentCount((prev) => prev + 1);
        setReplyFor(null);
        setReplyText("");
        if (toast?.success) toast.success("Reply posted!");
      }
    } catch (err) {
      console.error("Error submitting reply:", err);
      if (toast?.error) toast.error("Failed to post reply.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Comment like / vibe
  const handleCommentLike = async (commentId) => {
    if (!user) return;
    setComments((prev) =>
      prev.map((c) => {
        const cId = c.id || c._id;
        if (cId !== commentId) return c;
        const nextLiked = !c.isLiked;
        const nextLikes = nextLiked ? (c.likes || 0) + 1 : Math.max(0, (c.likes || 0) - 1);
        return { ...c, isLiked: nextLiked, likes: nextLikes };
      })
    );

    try {
      await api.put("/posts/vibe", { postId: commentId });
    } catch (err) {
      console.error("Error liking comment:", err);
      // Revert on failure
      setComments((prev) =>
        prev.map((c) => {
          const cId = c.id || c._id;
          if (cId !== commentId) return c;
          const prevLiked = !c.isLiked;
          const prevLikes = prevLiked ? (c.likes || 0) + 1 : Math.max(0, (c.likes || 0) - 1);
          return { ...c, isLiked: prevLiked, likes: prevLikes };
        })
      );
    }
  };

  // Share post link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      if (toast?.success) {
        toast.success("Post link copied to clipboard!");
      } else {
        alert("Post link copied to clipboard!");
      }
    }
  };

  // Author & post details
  const authorName = post.author?.name || "Anonymous";
  const authorAvatar = post.author?.avatar || post.author?.ImageUrl;
  const authorRole = post.author?.role || post.author?.accountType || "User";
  const isFacultyAuthor = authorRole.toLowerCase() === "faculty";
  const isCompanyAuthor =
    authorRole.toLowerCase() === "company" ||
    authorRole.toLowerCase() === "industry";

  const authorDetails =
    post.author?.details ||
    (post.author?.Profile?.Branch
      ? `${
          post.author?.Profile?.YearOfStudy
            ? `${post.author.Profile.YearOfStudy} year`
            : "Student"
        }, ${post.author?.Profile?.Branch}`
      : isFacultyAuthor
      ? "Faculty Member"
      : isCompanyAuthor
      ? "Industry Partner"
      : "VIBE Member");

  const timestamp =
    post.time ||
    post.timestamp ||
    (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recently");

  const activeReactionConfig = REACTION_TYPES.find(
    (r) => r.id === currentUserReaction
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm w-full min-w-0 overflow-hidden box-border"
    >
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div
          onClick={(e) => {
            e.stopPropagation();
            const authorId =
              post.author?._id ||
              post.author?.id ||
              post.authorId ||
              (typeof post.author === "string" ? post.author : null);
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
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                  isFacultyAuthor
                    ? "text-[#6D3DF5] bg-[#F3EEFF] border-[#E9D5FF]"
                    : isCompanyAuthor
                    ? "text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]"
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
          className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors shrink-0"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* 2. Post Content */}
      <div className="mt-3.5 min-w-0">
        {(post.tag || post.category) && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3EEFF] text-[#6D3DF5] border border-[#E9E1FF] mb-2">
            {post.tag || post.category}
          </span>
        )}

        {post.title && (
          <h3 className="font-bold text-base text-[#0F172A] mb-1.5 leading-snug break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {post.title}
          </h3>
        )}

        {/* LinkedIn-style description with "See more" */}
        <div className="text-xs sm:text-sm text-[#334155] leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
          <span className="whitespace-pre-line">{displayContent}</span>
          {isLongContent && !isExpanded && (
            <>
              <span>... </span>
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="font-bold text-[#6D3DF5] hover:text-[#5B2FD6] hover:underline cursor-pointer inline-block"
              >
                See more
              </button>
            </>
          )}
          {isLongContent && isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="font-bold text-[#6D3DF5] hover:text-[#5B2FD6] hover:underline cursor-pointer block mt-1"
            >
              See less
            </button>
          )}
        </div>

        {/* Tags */}
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
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
      </div>

      {/* Attachments - Aligned with content width, non-cropped contain for single notes/cheat sheet */}
      {Array.isArray(post.attachments) && post.attachments.length > 0 && (
        <div
          className={`mt-3.5 w-full rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] box-border ${
            post.attachments.length === 1
              ? "grid grid-cols-1"
              : "grid grid-cols-1 sm:grid-cols-2 gap-2 p-1"
          }`}
        >
          {post.attachments.map((att, i) => {
            const url = typeof att === "string" ? att : att?.url;
            if (!url) return null;
            return (
              <div
                key={i}
                onClick={() => setSelectedImage(url)}
                className="relative overflow-hidden flex items-center justify-center bg-[#F8FAFC] cursor-zoom-in group max-h-[520px]"
                title="Click to view full image"
              >
                <img
                  src={url}
                  alt={post.title ? `${post.title} attachment ${i + 1}` : `Post attachment ${i + 1}`}
                  className={`w-full max-w-full ${
                    post.attachments.length === 1
                      ? "max-h-[520px] object-contain mx-auto"
                      : "max-h-72 object-cover"
                  } transition-transform duration-200 group-hover:scale-[1.01]`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none flex items-end justify-end p-2.5">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[11px] font-medium px-2 py-1 rounded-md backdrop-blur-xs flex items-center gap-1 shadow-sm">
                    <Maximize2 size={12} />
                    <span>View full</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Reaction Summary Bar (LinkedIn style breakdown) */}
      {totalReactions > 0 && (
        <div className="mt-3.5 flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#F8FAFC]">
          <div className="flex items-center gap-1.5 group/reactsummary relative cursor-pointer">
            <div className="flex items-center -space-x-1">
              {topReactions.slice(0, 3).map((rType) => {
                const rConf = REACTION_TYPES.find((r) => r.id === rType);
                return (
                  <span
                    key={rType}
                    className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs shadow-xs ring-1 ring-slate-200/80"
                    title={`${rConf?.label || rType}: ${breakdownCounts[rType] || 0}`}
                  >
                    {rConf?.emoji || "🤘"}
                  </span>
                );
              })}
            </div>
            <span className="font-semibold text-[#475569] hover:underline">
              {totalReactions}
            </span>

            {/* Tooltip breakdown */}
            <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/reactsummary:flex items-center gap-2 bg-[#0F172A] text-white text-[11px] px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none">
              {topReactions.map((rType) => {
                const rConf = REACTION_TYPES.find((r) => r.id === rType);
                return (
                  <span key={rType} className="flex items-center gap-1">
                    <span>{rConf?.emoji}</span>
                    <span>{breakdownCounts[rType]}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#64748B]">
            {commentCount > 0 && (
              <button
                type="button"
                onClick={() => setShowComments((prev) => !prev)}
                className="hover:underline hover:text-[#0F172A] cursor-pointer"
              >
                {commentCount} {commentCount === 1 ? "comment" : "comments"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Action Row (Reactions, Comments, Share, Bookmark) */}
      <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Reaction Picker & Button Container */}
          <div
            ref={reactionPickerRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Floating Reactions Bar */}
            <AnimatePresence>
              {showReactionPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.94 }}
                  transition={{ duration: 0.15 }}
                  className="absolute -top-12 left-0 sm:left-1 z-30 bg-white/95 backdrop-blur-md rounded-full px-2 py-1 shadow-xl border border-slate-200/90 flex items-center gap-1.5"
                >
                  {REACTION_TYPES.map((reaction) => {
                    const isSelected = currentUserReaction === reaction.id;
                    return (
                      <button
                        key={reaction.id}
                        type="button"
                        onClick={() => handleReactionSelect(reaction.id)}
                        className={`group/rbtn relative w-8 h-8 rounded-full flex items-center justify-center text-lg hover:scale-130 transition-transform duration-150 cursor-pointer ${
                          isSelected ? "bg-slate-100 ring-2 ring-[#6D3DF5]/30" : "hover:bg-slate-50"
                        }`}
                        title={reaction.label}
                      >
                        <span>{reaction.emoji}</span>
                        {/* Tooltip Label */}
                        <span className="opacity-0 group-hover/rbtn:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[10px] font-bold px-2 py-0.5 rounded-md pointer-events-none whitespace-nowrap shadow-md">
                          {reaction.label}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Reaction Trigger Button */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleMainButtonClick}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeReactionConfig
                    ? "font-bold border"
                    : "hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A]"
                }`}
                style={
                  activeReactionConfig
                    ? {
                        backgroundColor: activeReactionConfig.activeBg,
                        color: activeReactionConfig.color,
                        borderColor: activeReactionConfig.activeBorder,
                      }
                    : {}
                }
                title={
                  activeReactionConfig
                    ? `Remove ${activeReactionConfig.label}`
                    : "React to post"
                }
              >
                <span className="text-sm leading-none">
                  {activeReactionConfig ? activeReactionConfig.emoji : "🤘"}
                </span>
                <span className="font-semibold text-xs">
                  {activeReactionConfig ? activeReactionConfig.label : "Vibe"}
                </span>
              </button>

              {/* Mobile trigger for reaction picker */}
              <button
                type="button"
                onClick={() => setShowReactionPicker((prev) => !prev)}
                className="sm:hidden p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-md transition-colors"
                aria-label="Choose reaction"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>

          {/* Comments Toggle */}
          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              showComments
                ? "bg-[#F1F5F9] text-[#0F172A] font-bold"
                : "hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <MessageSquare size={15} />
            <span className="font-semibold">{commentCount}</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <Share2 size={15} />
            <span className="hidden sm:inline font-semibold">Share</span>
          </button>
        </div>

        {/* Real Bookmark Toggle */}
        <button
          type="button"
          onClick={handleBookmarkToggle}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            bookmarkedState
              ? "text-[#6D3DF5] bg-[#F3EEFF]"
              : "text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
          }`}
          aria-label={bookmarkedState ? "Remove Bookmark" : "Bookmark Post"}
          title={bookmarkedState ? "Remove Bookmark" : "Bookmark Post"}
        >
          <Bookmark size={16} fill={bookmarkedState ? "#6D3DF5" : "none"} />
        </button>
      </div>

      {/* 5. Comments Section with Threaded Inline Replies */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 pt-4 border-t border-[#F1F5F9] space-y-3 min-w-0"
          >
            {/* Top-Level Comment Input */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-2.5 items-center min-w-0">
                <Avatar
                  name={user.name || "Me"}
                  src={user.ImageUrl || user.avatar}
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
                  className="px-3.5 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
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
            ) : (
              <div className="text-center py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <p className="text-xs text-[#64748B]">
                  <a href="/login" className="text-[#6D3DF5] hover:text-[#5B2FD6] font-bold">
                    Login
                  </a>{" "}
                  to join the conversation
                </p>
              </div>
            )}

            {/* Hierarchical Comments Tree */}
            <div className="space-y-2.5 pt-1 min-w-0">
              {comments.length > 0 ? (
                buildCommentTree(comments).map((node) => (
                  <CommentItem
                    key={node.id}
                    node={node}
                    depth={0}
                    currentUser={user}
                    replyFor={replyFor}
                    onStartReply={(cId) => {
                      setReplyFor(cId);
                      setReplyText("");
                    }}
                    onCancelReply={() => {
                      setReplyFor(null);
                      setReplyText("");
                    }}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    onSubmitReply={handleReplySubmit}
                    isSubmittingReply={isSubmittingReply}
                    onCommentLike={handleCommentLike}
                  />
                ))
              ) : (
                <p className="text-center text-xs text-[#94A3B8] py-2">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal for Full Image View */}
      <AnimatePresence>
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-5xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close image preview"
              >
                <X size={18} />
              </button>
              <img
                src={selectedImage}
                alt="Full size attachment"
                className="max-w-full max-h-[82vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Threaded Comment Item Component
const CommentItem = ({
  node,
  depth = 0,
  currentUser,
  replyFor,
  onStartReply,
  onCancelReply,
  replyText,
  setReplyText,
  onSubmitReply,
  isSubmittingReply,
  onCommentLike,
}) => {
  const authorName = node.author?.name || "VIBE Member";
  const authorAvatar = node.author?.avatar || node.author?.ImageUrl;
  const authorRole = node.author?.role || node.author?.accountType || "Member";
  const timestamp =
    node.timestamp ||
    (node.createdAt ? new Date(node.createdAt).toLocaleDateString() : "Recently");

  const isReplying = replyFor === node.id;

  return (
    <div
      className={`min-w-0 ${
        depth > 0
          ? "border-l-2 border-[#E2E8F0] pl-3 ml-2 sm:ml-4 mt-2.5 space-y-2"
          : "mt-2.5"
      }`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <Avatar
          name={authorName}
          src={authorAvatar}
          className="w-7 h-7 rounded-full flex-shrink-0 object-cover ring-1 ring-[#E2E8F0]"
          initialsClassName="text-[10px] font-bold text-white"
        />
        <div className="flex-1 bg-[#F8FAFC] rounded-xl p-3 border border-[#F1F5F9] min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="font-bold text-xs text-[#0F172A] truncate">
                {authorName}
              </span>
              <span className="text-[10px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full capitalize shrink-0">
                {authorRole}
              </span>
            </div>
            <span className="text-[10px] text-[#94A3B8] shrink-0">
              {timestamp}
            </span>
          </div>

          <p className="text-xs text-[#334155] mt-1 leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-line">
            {node.content}
          </p>

          <div className="flex items-center gap-4 mt-2 text-xs">
            {/* Comment reaction */}
            <button
              type="button"
              onClick={() => onCommentLike(node.id)}
              className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                node.isLiked ? "text-[#6D3DF5]" : "text-[#94A3B8] hover:text-[#6D3DF5]"
              }`}
            >
              <Heart size={12} fill={node.isLiked ? "#6D3DF5" : "none"} />
              <span>{node.likes || 0}</span>
            </button>

            {/* Reply trigger */}
            {currentUser && depth < 2 && (
              <button
                type="button"
                onClick={() => (isReplying ? onCancelReply() : onStartReply(node.id))}
                className="font-semibold text-[#94A3B8] hover:text-[#6D3DF5] transition-colors cursor-pointer flex items-center gap-1"
              >
                <CornerDownRight size={12} />
                <span>{isReplying ? "Cancel" : "Reply"}</span>
              </button>
            )}
          </div>

          {/* Inline Reply Composer */}
          {isReplying && (
            <form
              onSubmit={onSubmitReply}
              className="mt-3 pt-2.5 border-t border-[#E2E8F0]/70 flex items-center gap-2"
            >
              <Avatar
                name={currentUser.name || "Me"}
                src={currentUser.ImageUrl || currentUser.avatar}
                className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                initialsClassName="text-[9px] font-bold text-white"
              />
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${authorName}...`}
                autoFocus
                className="flex-1 min-w-0 bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 transition-all"
              />
              <button
                type="button"
                onClick={onCancelReply}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyText.trim() || isSubmittingReply}
                className="px-3 py-1.5 bg-[#6D3DF5] hover:bg-[#5B2FD6] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
              >
                {isSubmittingReply ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <>
                    <span>Reply</span>
                    <Send size={11} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Nested Children Replies */}
          {Array.isArray(node.children) && node.children.length > 0 && (
            <div className="space-y-2 mt-2">
              {node.children.map((child) => (
                <CommentItem
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  currentUser={currentUser}
                  replyFor={replyFor}
                  onStartReply={onStartReply}
                  onCancelReply={onCancelReply}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onSubmitReply={onSubmitReply}
                  isSubmittingReply={isSubmittingReply}
                  onCommentLike={onCommentLike}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
