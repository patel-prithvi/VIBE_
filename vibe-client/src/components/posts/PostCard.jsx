import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Share2, MoreHorizontal, Send, Heart, Bookmark } from 'lucide-react';
import Avatar from '../shared/Avatar';
import { useToast } from '../Toast';
import { auth } from '../../utils/auth';
import api from '../../services/api';

export const PostCard = ({ post, index, isBookmarked = false, onToggleBookmark }) => {
  const toast = useToast();
  const currentUser = auth.getCurrentUser();
  const [isLiked, setIsLiked] = useState(currentUser && post.vibes && post.vibes[currentUser._id]);
  const [vibeCount, setVibeCount] = useState(post.vibeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState('');

  const buildCommentTree = (list) => {
    const map = new Map();
    list.forEach(c => map.set(c.id, { ...c, children: [] }));
    const roots = [];
    map.forEach((node) => {
      if (node.parentComment) {
        const parent = map.get(node.parentComment);
        if (parent) parent.children.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  };

  const handleLike = async () => {
    if (!currentUser) return;

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousVibeCount = vibeCount;

    setIsLiked(!isLiked);
    setVibeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await api.put('/posts/vibe', { postId: post.id });
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setVibeCount(previousVibeCount);
      console.error("Error liking post:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      const res = await api.post('/posts/comment', {
        content: newComment.trim(),
        parent: post.id
      });

      if (res.data && res.data.data) {
        const newCommentData = res.data.data;
        // The backend returns the populated comment
        const comment = {
          id: newCommentData._id,
          parentComment: null,
          author: {
            name: newCommentData.author?.name || currentUser.name || "User",
            role: newCommentData.author?.accountType || currentUser.role || "User",
            avatar: newCommentData.author?.ImageUrl || `https://picsum.photos/seed/${newCommentData.author?._id || 'default'}/200`
          },
          content: newCommentData.content,
          timestamp: 'Just now',
          likes: 0,
          isLiked: false
        };

        setComments(prev => [comment, ...prev]);
        setCommentCount(prev => prev + 1);
        setNewComment('');
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };
  const startReply = (commentId) => setReplyFor(commentId);
  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser || !replyFor) return;
    try {
      const res = await api.post('/posts/comment', {
        content: replyText.trim(),
        parent: post.id,
        parentComment: replyFor
      });
      if (res.data && res.data.data) {
        const c = res.data.data;
        const reply = {
          id: c._id,
          parentComment: replyFor,
          author: {
            name: c.author?.name || currentUser.name || "User",
            role: c.author?.accountType || currentUser.role || "User",
            avatar: c.author?.ImageUrl || `https://picsum.photos/seed/${c.author?._id || 'default'}/200`
          },
          content: c.content,
          timestamp: 'Just now',
          likes: 0
        };
        setComments(prev => [reply, ...prev]);
        setCommentCount(prev => prev + 1);
        setReplyFor(null);
        setReplyText('');
      }
    } catch (err) {
      console.error("Error submitting reply:", err);
    }
  };
  const handleCommentLike = async (commentId) => {
    if (!currentUser) return;
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const nextLiked = !c.isLiked;
      const nextLikes = nextLiked ? (c.likes || 0) + 1 : Math.max((c.likes || 0) - 1, 0);
      return { ...c, isLiked: nextLiked, likes: nextLikes };
    }));
    try {
      await api.put('/posts/vibe', { postId: commentId });
    } catch (err) {
      setComments(prev => prev.map(c => {
        if (c.id !== commentId) return c;
        const revertLiked = !c.isLiked;
        const revertLikes = revertLiked ? (c.likes || 0) + 1 : Math.max((c.likes || 0) - 1, 0);
        return { ...c, isLiked: revertLiked, likes: revertLikes };
      }));
      console.error("Error liking comment:", err);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Post link copied to clipboard!");
    }
  };

  const authorName = post.author?.name || "Anonymous";
  const authorAvatar = post.author?.avatar;
  const authorRole = post.author?.role || "User";
  const authorDetails = post.author?.details || "VIBE Member";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm w-full min-w-0 overflow-hidden"
    >
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
              <span className="text-[10px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#DBEAFE] capitalize flex-shrink-0">
                {authorRole}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 truncate">
              {authorDetails} • {post.timestamp}
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
      <div className="mt-3.5 min-w-0">
        {post.tag && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F3EEFF] text-[#6D3DF5] border border-[#E9E1FF] mb-2">
            {post.tag}
          </span>
        )}
        {post.title && (
          <h3 className="font-bold text-base text-[#0F172A] mb-1.5 leading-snug break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {post.title}
          </h3>
        )}
        <p className="whitespace-pre-line text-sm text-[#334155] leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
          {post.content}
        </p>
      </div>

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
          {/* Vibe Reaction */}
          <button
            onClick={handleLike}
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
            onClick={toggleComments}
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
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <Share2 size={15} />
            <span className="font-semibold text-[#0F172A]">Share</span>
          </button>
        </div>

        {/* Real Bookmark Toggle */}
        <button
          onClick={() => onToggleBookmark && onToggleBookmark(post.id || post._id)}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isBookmarked
              ? "text-[#6D3DF5] bg-[#F3EEFF]"
              : "text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
          }`}
          aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark Post"}
          title={isBookmarked ? "Remove Bookmark" : "Bookmark Post"}
        >
          <Bookmark size={16} fill={isBookmarked ? "#6D3DF5" : "none"} />
        </button>
      </div>

      {/* 4. Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-[#F1F5F9] space-y-3 min-w-0"
          >
            {/* Comment Input */}
            {currentUser && (
              <form onSubmit={handleCommentSubmit} className="flex gap-2.5 items-center min-w-0">
                <Avatar
                  name={currentUser.name || 'Me'}
                  src={currentUser.ImageUrl || currentUser.avatar}
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
                  disabled={!newComment.trim()}
                  className="px-3.5 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
                >
                  <span>Send</span>
                  <Send size={12} />
                </button>
              </form>
            )}

            {/* Comments List with nesting */}
            <div className="space-y-2.5 pt-1 min-w-0">
              {comments.length > 0 ? (
                buildCommentTree(comments).map((node) => (
                  <CommentItem
                    key={node.id}
                    node={node}
                    depth={0}
                    onReply={startReply}
                    replyFor={replyFor}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    submitReply={submitReply}
                    onLike={handleCommentLike}
                  />
                ))
              ) : (
                <p className="text-center text-xs text-[#94A3B8] py-2">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>

            {!currentUser && (
              <div className="text-center py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <p className="text-xs text-[#64748B]">
                  <a href="/login" className="text-[#6D3DF5] hover:text-[#5B2FD6] font-bold">
                    Login
                  </a> to join the conversation
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CommentItem = ({ node, depth, onReply, replyFor, replyText, setReplyText, submitReply, onLike }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2.5 min-w-0"
      style={{ marginLeft: depth * 20 }}
    >
      <Avatar
        name={node.author.name}
        src={node.author.avatar}
        className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
        initialsClassName="text-[10px] font-bold text-white"
      />
      <div className="flex-1 bg-[#F8FAFC] rounded-xl p-3 border border-[#F1F5F9] min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-xs text-[#0F172A] truncate">
              {node.author.name}
            </span>
            <span className="text-[10px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full capitalize shrink-0">
              {node.author.role}
            </span>
          </div>
          <span className="text-[10px] text-[#94A3B8] shrink-0">
            {node.timestamp}
          </span>
        </div>
        <p className="text-xs text-[#334155] mt-1 leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
          {node.content}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <button onClick={() => onLike(node.id)} className={`flex items-center gap-1 text-xs font-semibold ${node.isLiked ? 'text-[#6D3DF5]' : 'text-[#94A3B8] hover:text-[#6D3DF5]'} transition-colors`}>
            <Heart size={12} fill={node.isLiked ? "#6D3DF5" : "none"} />
            <span>{node.likes || 0}</span>
          </button>
          <button onClick={() => onReply(node.id)} className="text-xs font-semibold text-[#94A3B8] hover:text-[#0F172A] transition-colors">
            Reply
          </button>
        </div>
        {replyFor === node.id && (
          <form onSubmit={submitReply} className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 min-w-0 bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 transition-all text-[#0F172A]"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="bg-[#6D3DF5] hover:bg-[#5B2FD6] disabled:bg-slate-200 disabled:text-slate-400 text-white px-3 py-2 rounded-xl transition-colors text-xs font-bold shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
        )}
        {Array.isArray(node.children) && node.children.length > 0 && (
          <div className="mt-2 space-y-2">
            {node.children.map(child => (
              <CommentItem
                key={child.id}
                node={child}
                depth={depth + 1}
                onReply={onReply}
                replyFor={replyFor}
                replyText={replyText}
                setReplyText={setReplyText}
                submitReply={submitReply}
                onLike={onLike}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
