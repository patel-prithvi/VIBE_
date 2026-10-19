import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { PostCard } from "../posts/PostCard";
import { CreatePostModal } from "../posts/CreatePostModal";
import api from "../../services/api";
import { auth } from "../../utils/auth";

export const Community = ({ searchQuery = "" }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.getCurrentUser();
        setCurrentUser(user);

        const postsRes = await api.get('/posts');
        if (postsRes.data && postsRes.data.data) {
           const mappedPosts = postsRes.data.data.map(post => ({
            id: post._id,
            author: {
              name: post.author?.name || "Unknown",
              role: post.author?.accountType || "User",
              avatar: post.author?.ImageUrl || `https://picsum.photos/seed/${post.author?._id || 'default'}/200`
            },
            timestamp: new Date(post.createdAt).toLocaleDateString(), 
            tag: post.category || "General",
            title: post.title,
            content: post.content,
            attachments: post.attachments || [],
            vibes: post.vibes || {},
            vibeCount: post.vibes ? Object.keys(post.vibes).length : 0,
            commentCount: post.comments?.length || 0,
            comments: (post.comments || []).map(c => ({
               id: c._id,
               parentComment: c.parentComment || null,
               author: {
                 name: c.author?.name || "Unknown",
                 role: c.author?.accountType || "User",
                 avatar: c.author?.ImageUrl || `https://picsum.photos/seed/${c.author?._id || 'default'}/200`
               },
               content: c.content,
               timestamp: new Date(c.createdAt).toLocaleDateString(),
               likes: c.vibes ? Object.keys(c.vibes).length : 0,
               isLiked: !!(c.vibes && user && c.vibes[user._id]),
            })),
            repostOf: post.repostOf || null,
            repostComment: post.repostComment || "",
            repostCount: post.repostCount || (Array.isArray(post.reposts) ? post.reposts.length : 0),
          }));
          setPosts(mappedPosts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    const handleDeleted = (e) => {
      const { postId } = e.detail || {};
      if (postId) {
        setPosts((prev) => prev.filter((p) => (p.id || p._id) !== postId));
      }
    };

    const handleUpdated = (e) => {
      const { post: updated } = e.detail || {};
      if (updated) {
        const uId = updated._id || updated.id;
        setPosts((prev) =>
          prev.map((p) =>
            (p.id || p._id) === uId
              ? {
                  ...p,
                  title: updated.title,
                  content: updated.content,
                  category: updated.category,
                  tags: Array.isArray(updated.tags) ? updated.tags : p.tags,
                  attachments: Array.isArray(updated.attachments)
                    ? updated.attachments
                    : p.attachments,
                }
              : p
          )
        );
      }
    };

    const handleReposted = () => {
      fetchData();
    };

    window.addEventListener("vibe:post_deleted", handleDeleted);
    window.addEventListener("vibe:post_updated", handleUpdated);
    window.addEventListener("vibe:post_reposted", handleReposted);

    return () => {
      window.removeEventListener("vibe:post_deleted", handleDeleted);
      window.removeEventListener("vibe:post_updated", handleUpdated);
      window.removeEventListener("vibe:post_reposted", handleReposted);
    };
  }, []);

  const query = (searchQuery || "").trim().toLowerCase();
  const visiblePosts = !query
    ? posts
    : posts.filter((post) => {
        const inTitle = post.title && post.title.toLowerCase().includes(query);
        const inContent = post.content && post.content.toLowerCase().includes(query);
        const inAuthor = post.author?.name && post.author.name.toLowerCase().includes(query);
        return Boolean(inTitle || inContent || inAuthor);
      });

  return (
    <>
      <div className="space-y-8">
        {/* Header with Create Post Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">
              Community Posts
            </h2>
            <p className="text-[#64748B]">
              Connect, share, and learn with the VIBE community
            </p>
          </div>
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#6D3DF5] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#6D3DF5]/20 hover:bg-[#5B2FD6] transition-all"
          >
            <Plus size={18} />
            <span>Create Post</span>
          </button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {visiblePosts && visiblePosts.length > 0 ? (
            visiblePosts.map((post, index) => (
              <PostCard post={post} index={index} key={post.id} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {query ? "No posts match your search." : "No posts available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={(newPost) => {
          const mappedPost = {
            id: newPost._id,
            author: {
              name: currentUser?.name || "Unknown",
              role: currentUser?.role || "User",
              avatar: currentUser?.ImageUrl || `https://picsum.photos/seed/${currentUser?._id || 'default'}/200`
            },
            timestamp: "Just now",
            tag: newPost.category || "General",
            title: newPost.title,
            content: newPost.content,
            attachments: newPost.attachments || [],
            vibes: {},
            vibeCount: 0,
            commentCount: 0,
            comments: []
          };
          setPosts([mappedPost, ...posts]);
        }}
      />
    </>
  );
};
