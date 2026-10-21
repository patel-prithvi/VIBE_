import React, { useState, useEffect, useCallback } from "react";
import { useSmartPolling } from "../hooks/useSmartPolling";
import { FacultyTopHeader } from "../components/faculty/FacultyTopHeader";
import { FacultyLeftSidebar } from "../components/faculty/FacultyLeftSidebar";
import { FacultyCenterFeed } from "../components/faculty/FacultyCenterFeed";
import { FacultyRightPanel } from "../components/faculty/FacultyRightPanel";
import { FacultyBookmarksView } from "../components/faculty/FacultyBookmarksView";
import { ProfileView } from "../components/faculty/ProfileView";
import { UnifiedProfileView } from "../components/profile/UnifiedProfileView";
import { MentorRequestsView } from "../components/faculty/MentorRequestsView";
import { CreatePostModal } from "../components/posts/CreatePostModal";
import { MobileBottomNav } from "../components/shared/MobileBottomNav";
import { auth } from "../utils/auth";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  // Default view is "home" which represents the 3-column feed dashboard
  const [activeView, setActiveView] = useState(() => localStorage.getItem("vibe_faculty_tab") || "home");
  const [activeFeedTab, setActiveFeedTab] = useState("for-you");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem("vibe_sidebar_collapsed") === "true"
  );
  const [user, setUser] = useState(auth.getCurrentUser());
  const [posts, setPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());


  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("vibe_sidebar_collapsed", String(next));
      return next;
    });
  };

  const fetchPostsAndBookmarks = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoadingPosts(true);
        setPostsError("");
      }
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
          repostOf: post.repostOf || null,
          repostComment: post.repostComment || "",
          repostCount: post.repostCount || (Array.isArray(post.reposts) ? post.reposts.length : 0),
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
            repostOf: post.repostOf || null,
            repostComment: post.repostComment || "",
            repostCount: post.repostCount || (Array.isArray(post.reposts) ? post.reposts.length : 0),
          }));
          setBookmarkedPosts(bmList);
          setBookmarkedIds(new Set(bmList.map((p) => p.id)));
        }
      } catch (bmErr) {
        console.warn("Could not fetch bookmarks:", bmErr);
      }
    } catch (error) {
      console.error("Error fetching faculty dashboard data:", error);
      if (!isBackground) {
        setPostsError("Failed to load feed posts. Please check your connection and try again.");
      }
    } finally {
      if (!isBackground) {
        setLoadingPosts(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPostsAndBookmarks(false);

    const handleDeleted = (e) => {
      const { postId } = e.detail || {};
      if (postId) {
        setPosts((prev) => prev.filter((p) => (p.id || p._id) !== postId));
        setBookmarkedPosts((prev) => prev.filter((p) => (p.id || p._id) !== postId));
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
        setBookmarkedPosts((prev) =>
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
      fetchPostsAndBookmarks(true);
    };

    window.addEventListener("vibe:post_deleted", handleDeleted);
    window.addEventListener("vibe:post_updated", handleUpdated);
    window.addEventListener("vibe:post_reposted", handleReposted);

    return () => {
      window.removeEventListener("vibe:post_deleted", handleDeleted);
      window.removeEventListener("vibe:post_updated", handleUpdated);
      window.removeEventListener("vibe:post_reposted", handleReposted);
    };
  }, [fetchPostsAndBookmarks]);

  // Smart polling every 45s (visibility-aware, refetches on focus)
  useSmartPolling(() => fetchPostsAndBookmarks(true), {
    intervalMs: 45000,
    enabled: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pauseWhenHidden: true,
  });

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [activeView]);

  const handleSectionChange = (newSection) => {
    setActiveView(newSection);
    localStorage.setItem("vibe_faculty_tab", newSection);
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
      // Following filter:
      // The current backend user schema does not support following/followers.
      // We check for user.following or authors explicitly followed if available,
      // otherwise returns false so it produces the authentic empty state without faking data.
      if (Array.isArray(user?.following) && user.following.length > 0) {
        const followingSet = new Set(user.following.map((id) => id.toString()));
        const authorId = p.author?.id?.toString() || p.author?._id?.toString();
        matchesTab = authorId && followingSet.has(authorId);
      } else {
        matchesTab = false;
      }
    } else if (activeFeedTab === "students") {
      // Posts authored by users whose actual role or accountType is student
      const role = (p.author?.role || p.author?.accountType || "").toLowerCase();
      matchesTab = role === "student";
    } else if (activeFeedTab === "mentorship") {
      // Real mentorship-related posts:
      // Identified by category, tags, or mentorship keywords in title/content
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
      // Posts with attachments/files, or category 'Knowledge Base', or tags containing 'resource' / 'material' / 'tool'
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

    // 2. Search Query Filter (Search across content, title, author name, and tags)
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
      <FacultyTopHeader
        user={user}
        onLogout={handleLogout}
        onNavigate={handleSectionChange}
        onSearch={setSearchQuery}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* 2. Main Desktop Dashboard Container */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-5">
        {isHomeDashboard ? (
          <div
            className={`grid grid-cols-1 gap-5 items-start transition-all duration-300 ${
              isSidebarCollapsed
                ? "md:grid-cols-[76px_minmax(0,1fr)] lg:grid-cols-[76px_minmax(0,1fr)_260px]"
                : "md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_260px]"
            }`}
          >
            {/* Column 1: Left Sidebar (Full 260px or Collapsed 76px rail, hidden on mobile) */}
            <FacultyLeftSidebar
              activeView={activeView}
              onNavigate={handleSectionChange}
              onLogout={handleLogout}
              isCollapsed={isSidebarCollapsed}
            />

            {/* Column 2: Center Feed (Primary content area, visibly wider than sidebars) */}
            <div className="min-w-0 w-full">
              <FacultyCenterFeed
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

            {/* Column 3: Right Sidebar — Hidden on tablet (< lg) and mobile */}
            <div className="hidden lg:block">
              <FacultyRightPanel
                onNavigate={handleSectionChange}
                onOpenCreatePost={() => setIsCreatePostOpen(true)}
              />
            </div>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-5 items-start transition-all duration-300 ${
              isSidebarCollapsed
                ? "md:grid-cols-[76px_minmax(0,1fr)]"
                : "md:grid-cols-[260px_minmax(0,1fr)]"
            }`}
          >
            {/* Column 1: Left Sidebar */}
            <FacultyLeftSidebar
              activeView={activeView}
              onNavigate={handleSectionChange}
              onLogout={handleLogout}
              isCollapsed={isSidebarCollapsed}
            />

            {/* Dedicated View Column (Full available width, no right panel) */}
            <div className="min-w-0 w-full">
              {activeView === "mentorship" || activeView === "requests" ? (
                <MentorRequestsView onBackToFeed={() => handleSectionChange("home")} />
              ) : activeView === "profile" ? (
                <UnifiedProfileView
                  user={user}
                  currentUser={user}
                  onProfileUpdate={setUser}
                  onBack={() => handleSectionChange("home")}
                />
              ) : activeView === "bookmarks" ? (
                <FacultyBookmarksView
                  user={user}
                  bookmarkedPosts={bookmarkedPosts}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                  onBackToFeed={() => handleSectionChange("home")}
                  loadingPosts={loadingPosts}
                />
              ) : (
                <FacultyCenterFeed
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

      {/* Mobile Bottom Navigation Bar (app-style fixed bar for small screens) */}
      <MobileBottomNav
        role="faculty"
        activeView={activeView}
        onNavigate={handleSectionChange}
        onLogout={handleLogout}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
      />

      {/* Redesigned Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={(newPost) => {
          const mappedPost = {
            id: newPost._id,
            _id: newPost._id,
            author: {
              name: user?.name || "Dr. Meera Sharma",
              role: user?.accountType || user?.role || "Faculty",
              accountType: user?.accountType || user?.role || "Faculty",
              avatar: user?.ImageUrl || `https://picsum.photos/seed/${user?._id || "default"}/200`,
              verified: true,
              details: "Faculty Member",
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

export default FacultyDashboard;
