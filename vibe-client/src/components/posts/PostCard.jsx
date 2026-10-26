import React, { useState, useRef, useEffect, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
  Repeat,
  Edit3,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import { useToast } from "../Toast";
import { auth } from "../../utils/auth";
import api from "../../services/api";
import ReactionsModal from "./ReactionsModal";

// 6 LinkedIn-Style Reaction Types
export const REACTION_TYPES = [
  { id: "vibe", label: "Vibe", emoji: "🤘", color: "#6D3DF5", activeBg: "#F3EEFF", activeBorder: "#DDD6FE" },
  { id: "celebrate", label: "Celebrate", emoji: "🎉", color: "#059669", activeBg: "#ECFDF5", activeBorder: "#A7F3D0" },
  { id: "support", label: "Support", emoji: "🤝", color: "#2563EB", activeBg: "#EFF6FF", activeBorder: "#BFDBFE" },
  { id: "love", label: "Love", emoji: "❤️", color: "#EF4444", activeBg: "#FEF2F2", activeBorder: "#FECACA" },
  { id: "insightful", label: "Insightful", emoji: "💡", color: "#D97706", activeBg: "#FFFBEB", activeBorder: "#FDE68A" },
  { id: "funny", label: "Funny", emoji: "😂", color: "#0891B2", activeBg: "#ECFEFF", activeBorder: "#A5F3FC" },
];

export const POST_CATEGORIES = [
  "Doubt Sharing",
  "Knowledge Base",
  "Inspiration",
  "General",
  "Doubt",
  "Knowledge",
];

export const PostCard = ({
  post,
  index = 0,
  currentUser: propUser,
  isBookmarked = false,
  onToggleBookmark,
  onPostDeleted,
  onPostUpdated,
  onPostReposted,
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

  // Check if this post is a repost
  const isRepost = Boolean(post.repostOf && typeof post.repostOf === "object");
  const targetPost = isRepost ? post.repostOf : post;

  // Local post editable state
  const [postData, setPostData] = useState({
    title: targetPost.title || "",
    content: targetPost.content || "",
    category: targetPost.category || targetPost.tag || "General",
    tags: Array.isArray(targetPost.tags) ? targetPost.tags : [],
    attachments: Array.isArray(targetPost.attachments) ? targetPost.attachments : [],
  });

  // Keep postData in sync if prop changes
  useEffect(() => {
    const curTarget = post.repostOf && typeof post.repostOf === "object" ? post.repostOf : post;
    setPostData({
      title: curTarget.title || "",
      content: curTarget.content || "",
      category: curTarget.category || curTarget.tag || "General",
      tags: Array.isArray(curTarget.tags) ? curTarget.tags : [],
      attachments: Array.isArray(curTarget.attachments) ? curTarget.attachments : [],
    });
  }, [post]);

  // Ownership verification: compare logged-in user ID with post author ID
  const currentUserId = user?._id?.toString() || user?.id?.toString();
  const postAuthorId =
    post.author?._id?.toString() ||
    post.author?.id?.toString() ||
    post.authorId?.toString() ||
    (typeof post.author === "string" ? post.author : "");

  const isAuthor = Boolean(
    currentUserId && postAuthorId && currentUserId === postAuthorId
  );

  // Three-dot dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMenuOpen]);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const pId = post.id || post._id;
      await api.delete(`/posts/${pId}`);
      if (toast?.success) toast.success("Post deleted successfully");
      setIsDeleteModalOpen(false);
      if (onPostDeleted) onPostDeleted(pId);
      window.dispatchEvent(
        new CustomEvent("vibe:post_deleted", { detail: { postId: pId } })
      );
    } catch (err) {
      console.error("Error deleting post:", err);
      const msg = err.response?.data?.message || "Failed to delete post";
      if (toast?.error) toast.error(msg);
      else alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [editTags, setEditTags] = useState("");
  const [editExistingAttachments, setEditExistingAttachments] = useState([]);
  const [editNewFiles, setEditNewFiles] = useState([]);

  const openEditModal = () => {
    setEditTitle(postData.title);
    setEditContent(postData.content);
    setEditCategory(postData.category);
    setEditTags(postData.tags.join(", "));
    setEditExistingAttachments(postData.attachments);
    setEditNewFiles([]);
    setIsEditModalOpen(true);
  };

  const handleRemoveExistingAttachment = (indexToRemove) => {
    setEditExistingAttachments((prev) =>
      prev.filter((_, i) => i !== indexToRemove)
    );
  };

  const handleRemoveNewFile = (indexToRemove) => {
    setEditNewFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      if (toast?.error) toast.error("Title and content are required");
      return;
    }

    try {
      setIsSavingEdit(true);
      const targetId = targetPost.id || targetPost._id;

      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("content", editContent.trim());
      formData.append("category", editCategory);

      const parsedTags = editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(parsedTags));
      formData.append(
        "existingAttachments",
        JSON.stringify(editExistingAttachments)
      );

      editNewFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await api.put(`/posts/${targetId}`, formData);
      if (res.data && res.data.data) {
        const updated = res.data.data;
        const newPostState = {
          title: updated.title,
          content: updated.content,
          category: updated.category,
          tags: Array.isArray(updated.tags) ? updated.tags : parsedTags,
          attachments: Array.isArray(updated.attachments)
            ? updated.attachments
            : editExistingAttachments,
        };
        setPostData(newPostState);
        setIsEditModalOpen(false);
        if (toast?.success) toast.success("Post updated successfully");
        if (onPostUpdated) onPostUpdated(updated);
        window.dispatchEvent(
          new CustomEvent("vibe:post_updated", { detail: { post: updated } })
        );
      }
    } catch (err) {
      console.error("Error updating post:", err);
      const msg = err.response?.data?.message || "Failed to update post";
      if (toast?.error) toast.error(msg);
      else alert(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Repost modal state
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [repostCommentText, setRepostCommentText] = useState("");
  const [isReposting, setIsReposting] = useState(false);
  const [repostCount, setRepostCount] = useState(
    post.repostCount ||
      (Array.isArray(post.reposts) ? post.reposts.length : 0)
  );

  const handleRepostSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setIsReposting(true);
      const targetId = targetPost.id || targetPost._id || post.id || post._id;
      const res = await api.post("/posts/repost", {
        postId: targetId,
        comment: repostCommentText.trim(),
      });

      if (res.data && res.data.data) {
        setIsRepostModalOpen(false);
        setRepostCommentText("");
        setRepostCount((prev) => prev + 1);
        if (toast?.success) toast.success("Post reposted to your feed!");
        if (onPostReposted) onPostReposted(res.data.data);
        window.dispatchEvent(
          new CustomEvent("vibe:post_reposted", {
            detail: { post: res.data.data },
          })
        );
      }
    } catch (err) {
      console.error("Error reposting post:", err);
      const msg = err.response?.data?.message || "Failed to repost";
      if (toast?.error) toast.error(msg);
      else alert(msg);
    } finally {
      setIsReposting(false);
    }
  };

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
    if (typeof val === "string" && REACTION_TYPES.some((r) => r.id === val))
      return val;
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
  const [isReactionsModalOpen, setIsReactionsModalOpen] = useState(false);
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

    const activePostId = post._id || post.id || targetPost?._id || targetPost?.id;

    try {
      const res = await api.put("/posts/vibe", {
        postId: activePostId,
        reaction: reactionId,
      });

      if (res?.data?.data) {
        if (res.data.data.vibes) {
          setVibesState(res.data.data.vibes);
        }
        if (res.data.data.userReaction !== undefined) {
          setCurrentUserReaction(res.data.data.userReaction);
        }
      }
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
  const content = postData.content || "";
  const isLongContent =
    content.length > 220 || (content.match(/\n/g) || []).length > 2;

  const displayContent =
    isLongContent && !isExpanded
      ? content.slice(0, 220).replace(/\s+\S*$/, "")
      : content;

  // Image Lightbox state
  const [selectedImage, setSelectedImage] = useState(null);

  // Multi-photo carousel state (independent per post card)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [carouselAspectRatios, setCarouselAspectRatios] = useState({});
  const carouselRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  // Measure carousel container width for responsive slide calculations
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const updateWidth = () => {
      if (el.offsetWidth > 0) {
        setContainerWidth(el.offsetWidth);
      }
    };

    updateWidth();

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect && entry.contentRect.width > 0) {
            setContainerWidth(Math.round(entry.contentRect.width));
          }
        }
      });
      resizeObserver.observe(el);
    }

    window.addEventListener("resize", updateWidth);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const handleImageLoad = (idx, e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      setCarouselAspectRatios((prev) => {
        if (prev[idx] === ratio) return prev;
        return { ...prev, [idx]: ratio };
      });
    }
  };

  // Extract and normalize valid image attachments
  const validAttachments = (
    Array.isArray(postData.attachments) ? postData.attachments : []
  )
    .map((att) => (typeof att === "string" ? att : att?.url))
    .filter(Boolean);
  const totalPhotos = validAttachments.length;

  // Safely clamp carousel index if media list changes
  useEffect(() => {
    if (currentPhotoIndex >= totalPhotos) {
      setCurrentPhotoIndex(Math.max(0, totalPhotos - 1));
    }
  }, [totalPhotos]);

  // Touch handlers for mobile swipe navigation
  const handleCarouselTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleCarouselTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;
    // Require dominant horizontal swipe > 40px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0 && currentPhotoIndex < totalPhotos - 1) {
        setCurrentPhotoIndex((prev) => prev + 1);
      } else if (diffX < 0 && currentPhotoIndex > 0) {
        setCurrentPhotoIndex((prev) => prev - 1);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Multi-photo carousel neighbor calculations
  const hasPrev = currentPhotoIndex > 0;
  const hasNext = currentPhotoIndex < totalPhotos - 1;
  const prevPhotoUrl = hasPrev ? validAttachments[currentPhotoIndex - 1] : null;
  const nextPhotoUrl = hasNext ? validAttachments[currentPhotoIndex + 1] : null;
  const currentPhotoUrl = validAttachments[currentPhotoIndex];
  const isMobile = (containerWidth > 0 ? containerWidth : 600) < 540;

  const carouselHeight = useMemo(() => {
    const ratio = carouselAspectRatios[currentPhotoIndex];
    if (!ratio) {
      return isMobile ? 380 : 490;
    }
    if (ratio < 0.85) {
      // Portrait document / poster
      return isMobile ? 440 : 540;
    }
    if (ratio <= 1.25) {
      // Square or near-square
      return isMobile ? 380 : 460;
    }
    // Landscape
    return isMobile ? 300 : 380;
  }, [carouselAspectRatios, currentPhotoIndex, isMobile]);

  // Keyboard navigation for full-size lightbox viewer
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
      } else if (e.key === "ArrowLeft" && totalPhotos > 1) {
        setCurrentPhotoIndex((prev) => {
          const next = Math.max(0, prev - 1);
          if (validAttachments[next]) setSelectedImage(validAttachments[next]);
          return next;
        });
      } else if (e.key === "ArrowRight" && totalPhotos > 1) {
        setCurrentPhotoIndex((prev) => {
          const next = Math.min(totalPhotos - 1, prev + 1);
          if (validAttachments[next]) setSelectedImage(validAttachments[next]);
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, totalPhotos, validAttachments]);

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
    Array.isArray(post.comments)
      ? post.comments.length
      : post.commentCount || 0
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
        const nextLikes = nextLiked
          ? (c.likes || 0) + 1
          : Math.max(0, (c.likes || 0) - 1);
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
          const prevLikes = prevLiked
            ? (c.likes || 0) + 1
            : Math.max(0, (c.likes || 0) - 1);
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

  // Author & original post details
  const authorName = targetPost.author?.name || "Anonymous";
  const authorAvatar =
    targetPost.author?.avatar || targetPost.author?.ImageUrl;
  const authorRole =
    targetPost.author?.role || targetPost.author?.accountType || "User";
  const isFacultyAuthor = authorRole.toLowerCase() === "faculty";
  const isCompanyAuthor =
    authorRole.toLowerCase() === "company" ||
    authorRole.toLowerCase() === "industry";

  const authorDetails =
    targetPost.author?.details ||
    (targetPost.author?.Profile?.Branch
      ? `${
          targetPost.author?.Profile?.YearOfStudy
            ? `${targetPost.author.Profile.YearOfStudy} year`
            : "Student"
        }, ${targetPost.author?.Profile?.Branch}`
      : isFacultyAuthor
      ? "Faculty Member"
      : isCompanyAuthor
      ? "Industry Partner"
      : "VIBE Member");

  const timestamp =
    targetPost.time ||
    targetPost.timestamp ||
    (targetPost.createdAt
      ? new Date(targetPost.createdAt).toLocaleDateString()
      : "Recently");

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
      {/* Repost attribution header banner if this post is a repost */}
      {isRepost && (
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-3 pb-2.5 border-b border-[#F1F5F9]">
          <Repeat size={14} className="text-[#6D3DF5] shrink-0" />
          <span className="font-bold text-[#0F172A]">
            {post.author?.name || "Member"}
          </span>
          <span>reposted</span>
          {post.time && <span className="text-[#94A3B8]"> • {post.time}</span>}
        </div>
      )}

      {/* Reposter commentary if present */}
      {isRepost && post.repostComment && (
        <p className="text-xs sm:text-sm text-[#0F172A] font-medium mb-3 whitespace-pre-line leading-relaxed">
          {post.repostComment}
        </p>
      )}

      {/* 1. Post Header */}
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div
          onClick={(e) => {
            e.stopPropagation();
            const authorId =
              targetPost.author?._id ||
              targetPost.author?.id ||
              targetPost.authorId ||
              (typeof targetPost.author === "string" ? targetPost.author : null);
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

        {/* Three-Dot Menu Button & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Post options"
            className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <MoreHorizontal size={18} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1.5 z-40"
              >
                {/* 1. Repost (available to all users) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsRepostModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F3EEFF] hover:text-[#6D3DF5] transition-colors cursor-pointer text-left"
                >
                  <Repeat size={14} className="text-[#6D3DF5] shrink-0" />
                  <span>Repost</span>
                </button>

                {/* 2. Edit post (only available to the original author) */}
                {isAuthor && !isRepost && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      openEditModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F3EEFF] hover:text-[#6D3DF5] transition-colors cursor-pointer text-left"
                  >
                    <Edit3 size={14} className="text-[#64748B] shrink-0" />
                    <span>Edit post</span>
                  </button>
                )}

                {/* 3. Delete post (available to post author or reposter) */}
                {isAuthor && (
                  <>
                    <div className="my-1 border-t border-[#F1F5F9]" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsDeleteModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer text-left"
                    >
                      <Trash2 size={14} className="text-[#EF4444] shrink-0" />
                      <span>{isRepost ? "Delete repost" : "Delete post"}</span>
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Post Content */}
      <div className="mt-3.5 min-w-0">
        {postData.category && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3EEFF] text-[#6D3DF5] border border-[#E9E1FF] mb-2">
            {postData.category}
          </span>
        )}

        {postData.title && (
          <h3 className="font-bold text-base text-[#0F172A] mb-1.5 leading-snug break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {postData.title}
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
        {Array.isArray(postData.tags) && postData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {postData.tags.map((tag, idx) => (
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

      {/* Attachments Section: Single Photo or Instagram-Style Multi-Photo Carousel */}
      {totalPhotos === 1 && (
        <div className="mt-3.5 w-full flex flex-col items-center">
          <div className="relative inline-flex flex-col items-center max-w-full rounded-2xl overflow-hidden border border-[#E2E8F0] bg-white shadow-2xs group cursor-zoom-in transition-all duration-300">
            <div
              onClick={() => setSelectedImage(validAttachments[0])}
              className="relative flex items-center justify-center max-w-full overflow-hidden"
              title="Click to view full image"
            >
              <img
                src={validAttachments[0]}
                alt={
                  postData.title
                    ? `${postData.title} attachment 1`
                    : "Post attachment 1"
                }
                style={{ maxHeight: "min(70vh, 780px)" }}
                className="w-auto h-auto max-w-full object-contain block mx-auto transition-transform duration-200 group-hover:scale-[1.01]"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none flex items-end justify-end p-2.5">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[11px] font-medium px-2 py-1 rounded-md backdrop-blur-xs flex items-center gap-1 shadow-sm">
                  <Maximize2 size={12} />
                  <span>View full</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalPhotos > 1 && (
        <div className="mt-3.5 w-full flex flex-col items-center select-none">
          {/* Gallery Viewport */}
          <div
            ref={carouselRef}
            style={{ height: carouselHeight }}
            onTouchStart={handleCarouselTouchStart}
            onTouchEnd={handleCarouselTouchEnd}
            className="relative w-full rounded-2xl overflow-hidden bg-slate-100/70 border border-[#E2E8F0] p-2 transition-[height] duration-300 ease-out flex items-center gap-2 sm:gap-3"
          >
            {/* Previous Photo Side Preview (Rendered ONLY when previous photo exists) */}
            {hasPrev && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex((prev) => Math.max(0, prev - 1));
                }}
                className={`h-full relative rounded-xl overflow-hidden bg-slate-200/60 cursor-pointer group/preview flex items-center justify-center border border-slate-300/40 shrink-0 transition-all duration-200 ${
                  hasNext
                    ? "w-[14%] sm:w-[18%] md:w-[20%]"
                    : "w-[22%] sm:w-[26%] md:w-[28%]"
                }`}
                title={`Go to previous photo (${currentPhotoIndex})`}
              >
                <img
                  src={prevPhotoUrl}
                  alt={
                    postData.title
                      ? `${postData.title} photo ${currentPhotoIndex}`
                      : `Photo ${currentPhotoIndex}`
                  }
                  className="w-full h-full object-cover block opacity-70 group-hover/preview:opacity-90 transition-opacity duration-200"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/15 group-hover/preview:bg-black/5 transition-colors" />

                {/* Left Navigation Arrow (Inside left preview area) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={20} className="stroke-[2.5] -ml-0.5 text-white" />
                </button>
              </div>
            )}

            {/* Active Photo (Always rendered; flex-1 naturally fills all remaining width) */}
            <div
              onClick={() => setSelectedImage(currentPhotoUrl)}
              className="h-full flex-1 min-w-0 relative rounded-xl overflow-hidden bg-white border border-slate-200/90 shadow-sm cursor-zoom-in group/active flex items-center justify-center transition-all duration-200"
              title="Click to view full photo"
            >
              {/* Photo Counter Overlay (Top-Right of active photo) */}
              <div className="absolute top-3 right-3 z-20 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-black/65 backdrop-blur-md shadow-sm border border-white/20 tracking-wider">
                  {currentPhotoIndex + 1}/{totalPhotos}
                </span>
              </div>

              {/* Active Photo: 100% visible with object-contain */}
              <img
                key={currentPhotoIndex}
                src={currentPhotoUrl}
                alt={
                  postData.title
                    ? `${postData.title} photo ${currentPhotoIndex + 1}`
                    : `Post photo ${currentPhotoIndex + 1}`
                }
                onLoad={(e) => handleImageLoad(currentPhotoIndex, e)}
                className="w-full h-full object-contain block mx-auto select-none transition-transform duration-200 group-hover/active:scale-[1.01]"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              {/* Hover "View full" pill (Bottom-Right of active slide) */}
              <div className="absolute bottom-3 right-3 z-10 pointer-events-none opacity-0 group-hover/active:opacity-100 transition-opacity">
                <span className="bg-black/70 text-white text-[11px] font-medium px-2 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                  <Maximize2 size={12} />
                  <span>View full</span>
                </span>
              </div>
            </div>

            {/* Next Photo Side Preview (Rendered ONLY when next photo exists) */}
            {hasNext && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex((prev) => Math.min(totalPhotos - 1, prev + 1));
                }}
                className={`h-full relative rounded-xl overflow-hidden bg-slate-200/60 cursor-pointer group/preview flex items-center justify-center border border-slate-300/40 shrink-0 transition-all duration-200 ${
                  hasPrev
                    ? "w-[14%] sm:w-[18%] md:w-[20%]"
                    : "w-[22%] sm:w-[26%] md:w-[28%]"
                }`}
                title={`Go to next photo (${currentPhotoIndex + 2})`}
              >
                <img
                  src={nextPhotoUrl}
                  alt={
                    postData.title
                      ? `${postData.title} photo ${currentPhotoIndex + 2}`
                      : `Photo ${currentPhotoIndex + 2}`
                  }
                  className="w-full h-full object-cover block opacity-70 group-hover/preview:opacity-90 transition-opacity duration-200"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/15 group-hover/preview:bg-black/5 transition-colors" />

                {/* Right Navigation Arrow (Inside right preview area) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) => Math.min(totalPhotos - 1, prev + 1));
                  }}
                  className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
                  aria-label="Next photo"
                >
                  <ChevronRight size={20} className="stroke-[2.5] -mr-0.5 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Photo Position Indicator Dots (Below the carousel, centered) */}
          <div className="flex items-center justify-center gap-1.5 pt-2.5 pb-0.5 w-full select-none">
            {validAttachments.map((_, idx) => {
              const isActive = idx === currentPhotoIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex(idx);
                  }}
                  className={`transition-all duration-200 cursor-pointer rounded-full ${
                    isActive
                      ? "w-2.5 h-2.5 bg-[#6D3DF5] ring-2 ring-[#6D3DF5]/30"
                      : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to photo ${idx + 1}`}
                  aria-current={isActive ? "true" : undefined}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Reaction & Engagement Summary Bar */}
      {(totalReactions > 0 || repostCount > 0) && (
        <div className="mt-3.5 flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#F8FAFC]">
          {/* Reaction icons breakdown */}
          {totalReactions > 0 ? (
            <button
              type="button"
              onClick={() => setIsReactionsModalOpen(true)}
              className="flex items-center gap-1.5 group/reactsummary relative cursor-pointer text-left hover:opacity-90 transition-opacity"
              title="View who reacted"
              aria-label={`${totalReactions} reactions. Click to view who reacted.`}
            >
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
              <span className="font-semibold text-[#475569] group-hover/reactsummary:underline group-hover/reactsummary:text-[#6D3DF5] transition-colors">
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
            </button>
          ) : (
            <div />
          )}

          {/* Counts for comments and reposts */}
          <div className="flex items-center gap-3 text-xs text-[#64748B]">
            {repostCount > 0 && (
              <span className="flex items-center gap-1">
                <Repeat size={12} className="text-[#6D3DF5]" />
                <span>
                  {repostCount} {repostCount === 1 ? "repost" : "reposts"}
                </span>
              </span>
            )}
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

      {/* 4. Action Row (Reactions, Comments, Repost, Share, Bookmark) */}
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
                          isSelected
                            ? "bg-slate-100 ring-2 ring-[#6D3DF5]/30"
                            : "hover:bg-slate-50"
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
                className="sm:hidden p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-md transition-colors cursor-pointer"
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

          {/* Repost Quick Action */}
          <button
            type="button"
            onClick={() => setIsRepostModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#6D3DF5] transition-colors cursor-pointer"
            title="Repost this post"
          >
            <Repeat size={15} />
            <span className="hidden sm:inline font-semibold">
              {repostCount > 0 ? `${repostCount} Repost${repostCount > 1 ? "s" : ""}` : "Repost"}
            </span>
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
              <form
                onSubmit={handleCommentSubmit}
                className="flex gap-2.5 items-center min-w-0"
              >
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
                  <a
                    href="/login"
                    className="text-[#6D3DF5] hover:text-[#5B2FD6] font-bold"
                  >
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-5xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl p-2 flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close image preview"
              >
                <X size={18} />
              </button>

              {/* Counter in Lightbox for multi-photo */}
              {totalPhotos > 1 && (
                <div className="absolute top-4 left-4 z-30 pointer-events-none">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-black/60 backdrop-blur-md shadow-md border border-white/10">
                    {currentPhotoIndex + 1} / {totalPhotos}
                  </span>
                </div>
              )}

              {/* Full-Size Image */}
              <img
                src={selectedImage}
                alt="Full size attachment"
                className="max-w-full max-h-[82vh] object-contain rounded-xl select-none"
              />

              {/* Lightbox Previous Navigation Arrow */}
              {totalPhotos > 1 && currentPhotoIndex > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const prevIdx = Math.max(0, currentPhotoIndex - 1);
                    setCurrentPhotoIndex(prevIdx);
                    if (validAttachments[prevIdx]) {
                      setSelectedImage(validAttachments[prevIdx]);
                    }
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white shadow-lg backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer border border-white/20"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={22} className="stroke-[2.5] -ml-0.5" />
                </button>
              )}

              {/* Lightbox Next Navigation Arrow */}
              {totalPhotos > 1 && currentPhotoIndex < totalPhotos - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextIdx = Math.min(totalPhotos - 1, currentPhotoIndex + 1);
                    setCurrentPhotoIndex(nextIdx);
                    if (validAttachments[nextIdx]) {
                      setSelectedImage(validAttachments[nextIdx]);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white shadow-lg backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer border border-white/20"
                  aria-label="Next photo"
                >
                  <ChevronRight size={22} className="stroke-[2.5] -mr-0.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#E2E8F0] space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">
                    {isRepost ? "Delete Repost?" : "Delete Post?"}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#334155] leading-relaxed">
                {isRepost
                  ? "Are you sure you want to remove this repost from your community feed?"
                  : "Are you sure you want to permanently delete this post and its comments from the VIBE community feed?"}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            onClick={() => !isSavingEdit && setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center shrink-0">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A]">
                      Edit Community Post
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Update post content, category, and attachments
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSave} className="space-y-3.5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Post Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Enter post title..."
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none transition-all text-[#0F172A] text-xs font-semibold"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none transition-all text-[#0F172A] text-xs font-medium cursor-pointer"
                  >
                    {POST_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Description / Content
                  </label>
                  <textarea
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="What would you like to share with the community?..."
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none transition-all text-[#0F172A] text-xs leading-relaxed resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="e.g. react, mentorship, project"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none transition-all text-[#0F172A] text-xs"
                  />
                </div>

                {/* Attachments Section */}
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                    Attachments
                  </label>

                  {/* Existing attachments list */}
                  {editExistingAttachments.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2.5">
                      {editExistingAttachments.map((url, i) => (
                        <div
                          key={i}
                          className="relative group rounded-lg overflow-hidden border border-[#E2E8F0] aspect-video bg-[#F8FAFC]"
                        >
                          <img
                            src={url}
                            alt={`Attachment ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingAttachment(i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-[#EF4444] text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove attachment"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New files preview */}
                  {editNewFiles.length > 0 && (
                    <div className="space-y-1 mb-2.5">
                      <p className="text-[11px] font-semibold text-[#6D3DF5]">
                        New files to upload ({editNewFiles.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {editNewFiles.map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 bg-[#F3EEFF] text-[#6D3DF5] px-2.5 py-1 rounded-lg text-xs"
                          >
                            <span className="truncate max-w-[120px]">
                              {f.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveNewFile(i)}
                              className="text-[#6D3DF5] hover:text-[#EF4444]"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload new attachment */}
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-[#6D3DF5]/60 hover:border-[#6D3DF5] bg-[#F8FAFC] hover:bg-[#F3EEFF]/40 text-[#6D3DF5] text-xs font-semibold cursor-pointer transition-colors">
                    <ImageIcon size={14} />
                    <span>Upload image...</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length) {
                          setEditNewFiles((prev) => [...prev, ...files]);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    disabled={isSavingEdit}
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Repost Modal */}
      <AnimatePresence>
        {isRepostModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            onClick={() => !isReposting && setIsRepostModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#E2E8F0] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center shrink-0">
                    <Repeat size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A]">
                      Repost to Community
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Share this post with your followers and feed
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRepostModalOpen(false)}
                  className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRepostSubmit} className="space-y-3.5">
                {/* Optional comment on repost */}
                <div>
                  <textarea
                    rows={2}
                    value={repostCommentText}
                    onChange={(e) => setRepostCommentText(e.target.value)}
                    placeholder="Add your thoughts... (optional)"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none transition-all text-[#0F172A] text-xs resize-none"
                  />
                </div>

                {/* Original Post Preview Box */}
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={authorName}
                      src={authorAvatar}
                      className="w-6 h-6 rounded-full object-cover"
                      initialsClassName="text-[9px] font-bold text-white"
                    />
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-xs text-[#0F172A] truncate">
                        {authorName}
                      </span>
                      <span className="text-[9px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.2 rounded-full border border-[#DBEAFE] capitalize shrink-0">
                        {authorRole}
                      </span>
                    </div>
                  </div>

                  {postData.title && (
                    <p className="text-xs font-bold text-[#0F172A] line-clamp-1">
                      {postData.title}
                    </p>
                  )}

                  <p className="text-xs text-[#64748B] line-clamp-2">
                    {postData.content}
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={isReposting}
                    onClick={() => setIsRepostModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReposting}
                    className="px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isReposting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Reposting...</span>
                      </>
                    ) : (
                      <>
                        <Repeat size={14} />
                        <span>Repost Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reactions Details Modal */}
      <ReactionsModal
        isOpen={isReactionsModalOpen}
        onClose={() => setIsReactionsModalOpen(false)}
        postId={post._id || post.id || targetPost?._id || targetPost?.id}
        refreshTrigger={vibesState}
      />
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
