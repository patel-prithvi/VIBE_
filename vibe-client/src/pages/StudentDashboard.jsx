import React, { useState, useEffect } from "react";
import { StudentTopHeader } from "../components/student/StudentTopHeader";
import { StudentLeftSidebar } from "../components/student/StudentLeftSidebar";
import { StudentCenterFeed } from "../components/student/StudentCenterFeed";
import { StudentRightPanel } from "../components/student/StudentRightPanel";
import { StudentBookmarksView } from "../components/student/StudentBookmarksView";
import { ProfileView } from "../components/student/ProfileView";
import { MyMentorRequestsView } from "../components/student/MyMentorRequestsView";
import { VirtualCVView } from "../components/student/VirtualCVView";
import { TaskManiaView } from "../components/taskmania/TaskManiaView";
import { CreatePostModal } from "../components/posts/CreatePostModal";
import { auth } from "../utils/auth";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();
  // Default view is "home" which represents the 3-column feed dashboard
  const [activeView, setActiveView] = useState(() => localStorage.getItem("vibe_student_tab") || "home");
  const [activeFeedTab, setActiveFeedTab] = useState("for-you");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [user, setUser] = useState(auth.getCurrentUser());
  const [posts, setPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");

  const fetchPostsAndBookmarks = async () => {
    try {
      setLoadingPosts(true);
      setPostsError("");
      const userData = await auth.fetchUser();
      setUser(userData);

      // Fetch all posts
      const postsRes = await api.get("/posts");
      if (postsRes.data && postsRes.data.data) {
        const mappedPosts = postsRes.data.data.map((post) => ({
          id: post._id,
          _id: post._id,
          author: {
            id: post.author?._id || post.author?.id,
            _id: post.author?._id || post.author?.id,
            name: post.author?.name || "Unknown",
            role: post.author?.accountType || "Student",
            accountType: post.author?.accountType || "Student",
            avatar: post.author?.ImageUrl || `https://picsum.photos/seed/${post.author?._id || "default"}/200`,
            verified: true,
            details: post.author?.Profile?.Branch 
              ? `${post.author?.Profile?.YearOfStudy ? `${post.author.Profile.YearOfStudy} year` : "Student"}, ${post.author?.Profile?.Branch}`
              : "VIBE Member",
          },
          time: new Date(post.createdAt).toLocaleDateString(),
          createdAt: post.createdAt,
          title: post.title,
          content: post.content,
          category: post.category || "General",
          tags: Array.isArray(post.tags) ? post.tags : [],
          attachments: post.attachments || [],
          vibes: post.vibes || {},
          vibeCount: post.vibes ? Object.keys(post.vibes).length : 0,
          commentCount: post.comments?.length || 0,
          comments: post.comments || [],
          shares: 4,
        }));
        setPosts(mappedPosts);
      } else {
        setPosts([]);
      }

      // Fetch real bookmarks from backend
      try {
        const bmRes = await api.get("/posts/bookmarks");
        if (bmRes.data && bmRes.data.data) {
          const bmList = bmRes.data.data.map((post) => ({
            id: post._id,
            _id: post._id,
            author: {
              name: post.author?.name || "Unknown",
              role: post.author?.accountType || "Student",
              accountType: post.author?.accountType || "Student",
              avatar: post.author?.ImageUrl || `https://picsum.photos/seed/${post.author?._id || "default"}/200`,
              verified: true,
              details: post.author?.Profile?.Branch 
                ? `${post.author?.Profile?.YearOfStudy ? `${post.author.Profile.YearOfStudy} year` : "Student"}, ${post.author?.Profile?.Branch}`
                : "VIBE Member",
            },
            time: new Date(post.createdAt).toLocaleDateString(),
            createdAt: post.createdAt,
            title: post.title,
            content: post.content,
            attachments: post.attachments || [],
            vibes: post.vibes || {},
            vibeCount: post.vibes ? Object.keys(post.vibes).length : 0,
            commentCount: post.comments?.length || 0,
            comments: post.comments || [],
            shares: 4,
          }));
          setBookmarkedPosts(bmList);
          setBookmarkedIds(new Set(bmList.map((p) => p.id)));
        }
      } catch (bmErr) {
        console.warn("Could not fetch student bookmarks:", bmErr);
      }
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
      setPostsError("Failed to load feed posts. Please check your connection and try again.");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPostsAndBookmarks();
  }, []);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [activeView]);

  const handleSectionChange = (newSection) => {
    setActiveView(newSection);
    localStorage.setItem("vibe_student_tab", newSection);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      await auth.logout();
      navigate("/");
    }
  };

  // Real backend Bookmark toggle
  const handleToggleBookmark = async (postId) => {
    try {
      const isCurrentlyBookmarked = bookmarkedIds.has(postId);
      
      // Optimistic update
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) next.delete(postId);
        else next.add(postId);
        return next;
      });

      if (isCurrentlyBookmarked) {
        setBookmarkedPosts((prev) => prev.filter((p) => (p.id || p._id) !== postId));
      } else {
        const found = posts.find((p) => (p.id || p._id) === postId);
        if (found) {
          setBookmarkedPosts((prev) => [found, ...prev]);
        }
      }

      await api.post("/posts/bookmark", { postId });
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      // Revert by re-fetching
      fetchPostsAndBookmarks();
    }
  };

  // Combined Tab and Search Filtering Logic
  const filteredPosts = posts.filter((p) => {
    // 1. Tab Filter
    let matchesTab = true;

    if (activeFeedTab === "for-you") {
      // Normal feed: all posts
      matchesTab = true;
    } else if (activeFeedTab === "following") {
      // Following filter
      if (Array.isArray(user?.following) && user.following.length > 0) {
        const followingSet = new Set(user.following.map((id) => id.toString()));
        const authorId = p.author?.id?.toString() || p.author?._id?.toString();
        matchesTab = authorId && followingSet.has(authorId);
      } else {
        matchesTab = false;
      }
    } else if (activeFeedTab === "mentorship") {
      // Real mentorship-related posts:
      const category = (p.category || "").toLowerCase();
      const tags = (p.tags || []).map((t) => (t || "").toLowerCase());
      const title = (p.title || "").toLowerCase();
      const content = (p.content || "").toLowerCase();

      matchesTab =
        category.includes("mentor") ||
        tags.some((t) => t.includes("mentor") || t.includes("guidance")) ||
        title.includes("mentor") ||
        title.includes("guidance") ||
        content.includes("mentorship") ||
        content.includes("mentor session");
    } else if (activeFeedTab === "resources") {
      // Real resource posts:
      const category = (p.category || "").toLowerCase();
      const tags = (p.tags || []).map((t) => (t || "").toLowerCase());
      const hasAttachments = Array.isArray(p.attachments) && p.attachments.length > 0;

      matchesTab =
        hasAttachments ||
        category === "knowledge base" ||
        category === "knowledge" ||
        tags.some((t) => t.includes("resource") || t.includes("notes") || t.includes("tool") || t.includes("book"));
    }

    if (!matchesTab) return false;

    // 2. Search Query Filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    const titleMatch = p.title && p.title.toLowerCase().includes(query);
    const contentMatch = p.content && p.content.toLowerCase().includes(query);
    const authorMatch = p.author?.name && p.author.name.toLowerCase().includes(query);
    const tagsMatch = Array.isArray(p.tags) && p.tags.some((t) => t && t.toLowerCase().includes(query));

    return Boolean(titleMatch || contentMatch || authorMatch || tagsMatch);
  });

  const isHomeDashboard = activeView === "home" || activeView === "posts";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#6D3DF5] selection:text-white">
      {/* 1. Horizontal Header Aligned across the top */}
      <StudentTopHeader
        user={user}
        onLogout={handleLogout}
        onNavigate={handleSectionChange}
        onSearch={setSearchQuery}
      />

      {/* 2. Main Desktop Dashboard Container */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {isHomeDashboard ? (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px] xl:grid-cols-[260px_minmax(0,1fr)_320px] gap-5 items-start">
            {/* Column 1: Left Fixed-Width Sidebar (260px) */}
            <StudentLeftSidebar
              activeView={activeView}
              onNavigate={handleSectionChange}
              onLogout={handleLogout}
            />

            {/* Column 2: Center Feed (Primary content area) */}
            <div className="min-w-0 w-full">
              <StudentCenterFeed
                user={user}
                posts={filteredPosts}
                activeTab={activeFeedTab}
                onTabChange={setActiveFeedTab}
                onOpenCreatePost={() => setIsCreatePostOpen(true)}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                loading={loadingPosts}
                error={postsError}
                onRetry={fetchPostsAndBookmarks}
                searchQuery={searchQuery}
              />
            </div>

            {/* Column 3: Right Sidebar (Recommended Mentors & AI CV Analysis) */}
            <StudentRightPanel
              onNavigate={handleSectionChange}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-5 items-start">
            {/* Column 1: Left Fixed-Width Sidebar */}
            <StudentLeftSidebar
              activeView={activeView}
              onNavigate={handleSectionChange}
              onLogout={handleLogout}
            />

            {/* Dedicated View Column (Full available width) */}
            <div className="min-w-0 w-full">
              {activeView === "mentorship" || activeView === "requests" ? (
                <MyMentorRequestsView onBackToFeed={() => handleSectionChange("home")} />
              ) : activeView === "cv-analysis" || activeView === "virtual-cv" ? (
                <VirtualCVView
                  user={user}
                  onBackToFeed={() => handleSectionChange("home")}
                />
              ) : activeView === "profile" ? (
                <ProfileView
                  user={user}
                  onProfileUpdate={setUser}
                  onBackToFeed={() => handleSectionChange("home")}
                />
              ) : activeView === "bookmarks" ? (
                <StudentBookmarksView
                  user={user}
                  bookmarkedPosts={bookmarkedPosts}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                  onBackToFeed={() => handleSectionChange("home")}
                />
              ) : activeView === "taskmania" ? (
                <TaskManiaView />
              ) : (
                <StudentCenterFeed
                  user={user}
                  posts={filteredPosts}
                  activeTab={activeFeedTab}
                  onTabChange={setActiveFeedTab}
                  onOpenCreatePost={() => setIsCreatePostOpen(true)}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                  loading={loadingPosts}
                  error={postsError}
                  onRetry={fetchPostsAndBookmarks}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={(newPost) => {
          const mappedPost = {
            id: newPost._id,
            _id: newPost._id,
            author: {
              name: user?.name || "Student",
              role: user?.accountType || user?.role || "Student",
              accountType: user?.accountType || user?.role || "Student",
              avatar: user?.ImageUrl || `https://picsum.photos/seed/${user?._id || "default"}/200`,
              verified: true,
              details: user?.Profile?.Branch 
                ? `${user?.Profile?.YearOfStudy ? `${user.Profile.YearOfStudy} year` : "Student"}, ${user.Profile.Branch}`
                : "Student Member",
            },
            time: "Just now",
            createdAt: new Date().toISOString(),
            title: newPost.title,
            content: newPost.content,
            attachments: newPost.attachments || [],
            vibes: {},
            vibeCount: 0,
            commentCount: 0,
            comments: [],
            shares: 0,
          };
          setPosts([mappedPost, ...posts]);
        }}
      />
    </div>
  );
};

export default StudentDashboard;
