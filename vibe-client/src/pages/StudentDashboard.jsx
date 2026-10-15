import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyTopHeader } from '../components/faculty/FacultyTopHeader';
import { StudentLeftSidebar } from '../components/student/StudentLeftSidebar';
import { StudentCenterFeed } from '../components/student/StudentCenterFeed';
import { StudentRightPanel } from '../components/student/StudentRightPanel';
import { ProfileView } from '../components/student/ProfileView';
import { CreatePostModal } from '../components/posts/CreatePostModal';
import { VirtualCVView } from '../components/student/VirtualCVView';
import { TaskManiaView } from '../components/taskmania/TaskManiaView';
import { MyMentorRequestsView } from '../components/student/MyMentorRequestsView';
import { auth } from '../utils/auth';
import api from '../services/api';
import { useToast } from '../components/Toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeView, setActiveView] = useState(() => localStorage.getItem('vibe_student_tab') || 'posts');
  const [activeFeedTab, setActiveFeedTab] = useState('for-you');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [user, setUser] = useState(auth.getCurrentUser());
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPosts(true);
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
            category: post.category || "General",
            title: post.title,
            content: post.content,
            tags: Array.isArray(post.tags) ? post.tags : [],
            attachments: post.attachments || [],
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
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchData();
  }, []);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [activeView]);

  // Custom handler for section navigation with scroll
  const handleSectionChange = (newSection) => {
    const next = newSection === 'home' ? 'posts' : newSection;
    setActiveView(next);
    localStorage.setItem('vibe_student_tab', next);
  };

  const handleLogout = async () => {
    const confirmed = await toast.confirm({
      title: "Logout?",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      danger: true,
    });
    if (confirmed) {
      await auth.logout();
      navigate("/");
      toast.success("You have been successfully logged out!");
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'taskmania':
        return <TaskManiaView />;
      case 'requests':
        return <MyMentorRequestsView />;
      case 'profile':
        return <ProfileView user={user} onProfileUpdate={setUser} />;
      case 'virtual-cv':
        return <VirtualCVView user={user} />;
      case 'posts':
      default:
        return (
          <StudentCenterFeed
            user={user}
            posts={posts}
            activeTab={activeFeedTab}
            onTabChange={setActiveFeedTab}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
            loading={loadingPosts}
            searchQuery={searchQuery}
          />
        );
    }
  };

  // Wide views (tasks, requests, profile, CV) get a 2-column layout; home feed gets the 3-column shell
  const isWideView = activeView !== 'posts';

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#6D3DF5] selection:text-white">
        {/* 1. Horizontal Header Aligned across the top */}
        <FacultyTopHeader
          user={user}
          onLogout={handleLogout}
          onNavigate={handleSectionChange}
          onSearch={setSearchQuery}
        />

        {/* 2. Main Desktop Dashboard Container */}
        <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {isWideView ? (
            <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-5 items-start">
              {/* Column 1: Left Fixed-Width Sidebar */}
              <StudentLeftSidebar
                activeView={activeView}
                onNavigate={handleSectionChange}
                onLogout={handleLogout}
              />

              {/* Dedicated View Column (Full available width, no right panel) */}
              <div className="min-w-0 w-full">
                {renderContent()}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_260px] gap-5 items-start">
              {/* Column 1: Left Fixed-Width Sidebar */}
              <StudentLeftSidebar
                activeView={activeView}
                onNavigate={handleSectionChange}
                onLogout={handleLogout}
              />

              {/* Column 2: Center Feed (Primary content area, visibly wider than sidebars) */}
              <div className="min-w-0 w-full">
                {renderContent()}
              </div>

              {/* Column 3: Right Sidebar — Equal width to left sidebar (260px) */}
              <StudentRightPanel
                onNavigate={handleSectionChange}
                onOpenCreatePost={() => setIsCreatePostOpen(true)}
              />
            </div>
          )}
        </main>
      </div>

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
            category: newPost.category || "General",
            title: newPost.title,
            content: newPost.content,
            tags: Array.isArray(newPost.tags) ? newPost.tags : [],
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

export default StudentDashboard;
