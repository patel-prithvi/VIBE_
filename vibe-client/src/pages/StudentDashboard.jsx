import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '../components/shared/DashboardLayout';
import { ProfileView } from '../components/student/ProfileView';
import { PostCard } from '../components/posts/PostCard';
import { CreatePostModal } from '../components/posts/CreatePostModal';
import { VirtualCVView } from '../components/student/VirtualCVView';
import { TaskManiaView } from '../components/taskmania/TaskManiaView';
import { MyMentorRequestsView } from '../components/student/MyMentorRequestsView';
import { auth } from '../utils/auth';
import api from '../services/api';

const StudentDashboard = () => {
  const [activeView, setActiveView] = useState(() => localStorage.getItem('vibe_student_tab') || 'posts');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [user, setUser] = useState(auth.getCurrentUser());
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await auth.fetchUser();
        setUser(userData);
        
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
            vibes: post.vibes || {},
            vibeCount: post.vibes ? Object.keys(post.vibes).length : 0,
            commentCount: post.comments?.length || 0,
            comments: (post.comments || []).map(c => ({
               id: c._id,
               author: {
                 name: c.author?.name || "Unknown",
                 role: c.author?.accountType || "User",
                 avatar: c.author?.ImageUrl || `https://picsum.photos/seed/${c.author?._id || 'default'}/200`
               },
               content: c.content,
               timestamp: new Date(c.createdAt).toLocaleDateString(),
               likes: c.vibes ? Object.keys(c.vibes).length : 0
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
  // Scroll to top when section changes
  useEffect(() => {
    // Scroll the main content area to top
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    // Also scroll window to top as fallback
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [activeView]);

  // Custom handler for section navigation with scroll
  const handleSectionChange = (newSection) => {
    setActiveView(newSection);
    localStorage.setItem('vibe_student_tab', newSection);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'posts':
        return (
          <div className="space-y-8">
            {/* Header with Create Post Button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Community Posts</h2>
                <p className="text-gray-600">Connect, share, and learn with the VIBE community</p>
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
              {posts && posts.length > 0 ? posts.map((post, index) => (
                <PostCard post={post} index={index} key={post.id} />
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No posts available</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'taskmania':
        return <TaskManiaView />;
      case 'requests':
        return <MyMentorRequestsView />;
      case 'profile':
        return <ProfileView user={user} onProfileUpdate={setUser} />;
      case 'virtual-cv':
        return <VirtualCVView user={user} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Content not found</p>
          </div>
        );
    }
  };

  return (
    <>
      <DashboardLayout
        activeTab={activeView}
        setActiveTab={handleSectionChange}
        role="student"
        user={user}
      >
        {renderContent()}
      </DashboardLayout>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)} 
        onPostCreated={(newPost) => {
          // Refresh posts or append new post
          const mappedPost = {
            id: newPost._id,
            author: {
              name: user.name || "Unknown",
              role: user.role || "User",
              avatar: user.ImageUrl || `https://picsum.photos/seed/${user._id || 'default'}/200`
            },
            timestamp: "Just now",
            tag: newPost.category || "General",
            title: newPost.title,
            content: newPost.content,
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

export default StudentDashboard;
