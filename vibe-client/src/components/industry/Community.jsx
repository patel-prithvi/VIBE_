import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { PostCard } from "../posts/PostCard";
import { CreatePostModal } from "../posts/CreatePostModal";
import api from "../../services/api";
import { auth } from "../../utils/auth";

export const Community = () => {
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
            }))
          }));
          setPosts(mappedPosts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="space-y-8">
        {/* Header with Create Post Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Community Posts
            </h2>
            <p className="text-gray-600">
              Connect, share, and learn with the VIBE community
            </p>
          </div>
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all"
          >
            <Plus size={18} />
            <span>Create Post</span>
          </button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post, index) => (
              <PostCard post={post} index={index} key={post.id} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No posts available</p>
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
