import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Share2, MoreVertical, Send, Heart } from 'lucide-react';
import { auth } from '../../utils/auth';
import api from '../../services/api';

export const PostCard = ({ post, index }) => {
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

  // Rock/Metal Hand Icon Component
  const RockHandIcon = ({ size = 20, className = "" }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path 
        d="M8 2C7.45 2 7 2.45 7 3V11C7 11.55 7.45 12 8 12S9 11.55 9 11V3C9 2.45 8.55 2 8 2Z" 
        fill="currentColor"
      />
      <path 
        d="M12 4C11.45 4 11 4.45 11 5V11C11 11.55 11.45 12 12 12S13 11.55 13 11V5C13 4.45 12.55 4 12 4Z" 
        fill="currentColor"
      />
      <path 
        d="M16 6C15.45 6 15 6.45 15 7V11C15 11.55 15.45 12 16 12S17 11.55 17 11V7C17 6.45 16.55 6 16 6Z" 
        fill="currentColor"
      />
      <path 
        d="M4 8C3.45 8 3 8.45 3 9V11C3 11.55 3.45 12 4 12S5 11.55 5 11V9C5 8.45 4.55 8 4 8Z" 
        fill="currentColor"
      />
      <path 
        d="M20 10C19.45 10 19 10.45 19 11V13C19 13.55 19.45 14 20 14S21 13.55 21 13V11C21 10.45 20.55 10 20 10Z" 
        fill="currentColor"
      />
      <path 
        d="M3 13C3 16.31 5.69 19 9 19H15C18.31 19 21 16.31 21 13V11H19V13C19 15.21 17.21 17 15 17H9C6.79 17 5 15.21 5 13V11H3V13Z" 
        fill="currentColor"
      />
    </svg>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white/80 backdrop-blur-md rounded-[2rem] p-8 shadow-xl shadow-[#1D3C5A]/5 border border-[#C9D8E4] transition-all duration-500 hover:shadow-2xl hover:shadow-[#1D3C5A]/10"
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <AvatarImage 
              src={post.author.avatar}
              name={post.author.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#C9D8E4] shadow-md bg-[#E6EEF5] flex items-center justify-center text-[#1D3C5A] font-bold"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#12283F] text-lg leading-tight">{post.author.name}</h4>
              <span className="text-[10px] font-bold text-[#1D3C5A] bg-[#D3E3EE] px-2 py-0.5 rounded-full uppercase tracking-tighter ring-1 ring-[#C9D8E4]">
                {post.author.role}
              </span>
            </div>
            <p className="text-xs text-[#728494] font-medium mt-0.5">{post.timestamp}</p>
          </div>
        </div>
        <button className="text-[#728494] hover:text-[#12283F] transition-colors p-2 hover:bg-[#E6EEF5] rounded-full">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Post Body */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#D8E5EF] text-[#1D3C5A] border border-[#C9D8E4]">
            {post.tag}
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-[#12283F] leading-snug group-hover:text-[#1D3C5A] transition-colors italic">
          "{post.title}"
        </h2>
        <p className="text-[#5E6A76] leading-relaxed text-[0.95rem]">
          {post.content}
        </p>
        {Array.isArray(post.attachments) && post.attachments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            {post.attachments.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`attachment-${i}`}
                className="w-full h-36 object-cover rounded-xl border border-[#C9D8E4]"
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-[#C9D8E4] flex items-center gap-8">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2.5 transition-colors font-semibold text-sm group/btn ${
            isLiked 
              ? 'text-[#A5632E]' 
              : 'text-[#5E6A76] hover:text-[#1D3C5A]'
          }`}
        >
          <div 
            className={`p-2 rounded-xl transition-colors ${
              isLiked 
                ? 'bg-[#A5632E]/10' 
                : 'group-hover/btn:bg-[#E6EEF5]'
            }`}
          >
            <RockHandIcon size={20} />
          </div>
          <span>{vibeCount} vibe{vibeCount !== 1 ? 's' : ''}</span>
        </button>

        <button 
          onClick={toggleComments}
          className={`flex items-center gap-2.5 transition-colors font-semibold text-sm group/btn ${
            showComments ? 'text-[#1D3C5A]' : 'text-[#5E6A76] hover:text-[#1D3C5A]'
          }`}
        >
          <div className={`p-2 rounded-xl transition-colors ${
            showComments ? 'bg-[#D3E3EE]' : 'group-hover/btn:bg-[#E6EEF5]'
          }`}>
            <MessageCircle size={20} />
          </div>
          <span>{commentCount}</span>
        </button>

        <button 
          className="flex items-center gap-2.5 text-[#5E6A76] hover:text-[#2F6DB5] transition-colors font-semibold text-sm group/btn ml-auto"
        >
          <div className="p-2 rounded-xl group-hover/btn:bg-[#E6EEF5] transition-colors">
            <Share2 size={18} />
          </div>
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 pt-6 border-t border-[#C9D8E4] space-y-4"
          >
            {/* Comment Input */}
            {currentUser && (
              <form onSubmit={handleCommentSubmit} className="flex gap-3">
                <AvatarImage
                  name={currentUser.name || 'User'}
                  className="w-8 h-8 rounded-full ring-2 ring-[#C9D8E4] bg-[#E6EEF5] flex items-center justify-center text-[#1D3C5A] font-bold"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-[#E6EEF5] border border-[#C9D8E4] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#4B7EA3] focus:ring-2 focus:ring-[#4B7EA3]/10 transition-all text-[#12283F] placeholder-[#728494]"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="bg-[#1D3C5A] hover:bg-[#12283F] disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Comments List with nesting */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
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
                <div className="text-center py-4">
                  <p className="text-sm text-[#728494]">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>

            {!currentUser && (
              <div className="text-center py-4 bg-[#E6EEF5] rounded-xl">
                <p className="text-sm text-[#5E6A76]">
                  <a href="/login" className="text-[#1D3C5A] hover:text-[#12283F] font-semibold">
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

const AvatarImage = ({ name, className }) => {
  const initial = (name || '').trim().charAt(0).toUpperCase() || '?';
  return <div className={className}>{initial}</div>;
};
const CommentItem = ({ node, depth, onReply, replyFor, replyText, setReplyText, submitReply, onLike }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 group/comment"
      style={{ marginLeft: depth * 24 }}
    >
      <AvatarImage
        src={node.author.avatar}
        name={node.author.name}
        className="w-8 h-8 rounded-full object-cover ring-1 ring-[#C9D8E4] bg-[#E6EEF5] flex items-center justify-center text-[#1D3C5A] font-bold text-xs"
      />
      <div className="flex-1 bg-[#E6EEF5] rounded-xl px-4 py-3 border border-[#C9D8E4]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-[#12283F]">
            {node.author.name}
          </span>
          <span className="text-[10px] font-bold text-[#1D3C5A] bg-[#D3E3EE] px-2 py-0.5 rounded-full uppercase tracking-wider">
            {node.author.role}
          </span>
          <span className="text-xs text-[#728494] ml-auto">
            {node.timestamp}
          </span>
        </div>
        <p className="text-sm text-[#5E6A76] leading-relaxed">
          {node.content}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <button onClick={() => onLike(node.id)} className={`flex items-center gap-1 text-xs ${node.isLiked ? 'text-[#A5632E]' : 'text-[#728494] hover:text-[#A5632E]'} transition-colors`}>
            <Heart size={12} />
            <span>{node.likes || 0}</span>
          </button>
          <button onClick={() => onReply(node.id)} className="text-xs text-[#728494] hover:text-[#1D3C5A] transition-colors">
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
              className="flex-1 bg-white border border-[#C9D8E4] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4B7EA3] focus:ring-2 focus:ring-[#4B7EA3]/10 transition-all text-[#12283F]"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="bg-[#1D3C5A] hover:bg-[#12283F] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl transition-colors text-xs"
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
