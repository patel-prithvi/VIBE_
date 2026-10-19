import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Send, ChevronDown, Loader2 } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../Toast";
import { useScrollLock } from "../../hooks/useScrollLock";

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  useScrollLock(isOpen);
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("Doubt Sharing");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsLoading(true);
    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const form = new FormData();
      form.append("title", title);
      form.append("content", content);
      form.append("category", category);
      form.append("type", "Post");
      form.append("tags", JSON.stringify(tagsArray));
      attachments.forEach((file) => form.append("attachments", file));
      const sentAttachmentCount = attachments.length;

      const res = await api.post("/posts/create", form);

      if (res.data && res.data.data) {
        const savedAttachments = res.data.data.attachments || [];
        if (sentAttachmentCount > 0 && savedAttachments.length === 0) {
          toast.error("Post created, but the image upload failed on the server. Please check the server's Cloudinary configuration and try again.");
        }
        if (onPostCreated) {
          onPostCreated(res.data.data);
        }
        setTitle("");
        setContent("");
        setTags("");
        setCategory("Doubt Sharing");
        setAttachments([]);
        onClose();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.message || "Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setAttachments((prev) => [...prev, ...files]);
    }
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const inputClasses =
    "w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none transition-all text-[#0F172A] placeholder-[#94A3B8] text-sm font-medium";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="vibe-modal-backdrop"
          />

          {/* Modal Container */}
          <div className="vibe-modal-container">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl vibe-modal-dialog flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A]">Create New Post</h2>
                  <p className="text-xs text-[#64748B]">Share updates, advice, or academic resources</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body - Scrollable */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto overscroll-contain">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your post a descriptive title..."
                    className={inputClasses}
                  />
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts, advice, or ideas with the community..."
                    rows={5}
                    className={`${inputClasses} resize-none`}
                  />
                </div>

                {/* Category & Tags Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`${inputClasses} appearance-none pr-8 cursor-pointer`}
                      >
                        <option>Doubt Sharing</option>
                        <option>Knowledge Base</option>
                        <option>Inspiration</option>
                        <option>General</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">
                      Tags (optional)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g. react, ai, career"
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Attachments preview */}
                {attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">
                      Attachments ({attachments.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1 text-xs text-[#334155]"
                        >
                          <span className="truncate max-w-[140px] font-medium">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="text-[#94A3B8] hover:text-[#EF4444]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC]/50 flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-[#475569] hover:text-[#6D3DF5] cursor-pointer px-3 py-2 rounded-lg hover:bg-white transition-all">
                  <ImageIcon size={16} className="text-[#6D3DF5]" />
                  <span>Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!title.trim() || !content.trim() || isLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#172554] hover:bg-[#0F172A] disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xs transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <span>Post Now</span>
                        <Send size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
