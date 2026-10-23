import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSmartPolling } from "../hooks/useSmartPolling";
import { StudentTopHeader } from "../components/student/StudentTopHeader";
import { StudentLeftSidebar } from "../components/student/StudentLeftSidebar";
import { StudentCenterFeed } from "../components/student/StudentCenterFeed";
import { StudentRightPanel } from "../components/student/StudentRightPanel";
import { ProfileView } from "../components/student/ProfileView";
import { UnifiedProfileView } from "../components/profile/UnifiedProfileView";
import { CreatePostModal } from "../components/posts/CreatePostModal";
import { VirtualCVView } from "../components/student/VirtualCVView";
import { TaskManiaView } from "../components/taskmania/TaskManiaView";
import { SettingsView } from "../components/settings/SettingsView";
import { MyMentorRequestsView } from "../components/student/MyMentorRequestsView";
import { StudentBookmarksView } from "../components/student/StudentBookmarksView";
import { MobileBottomNav } from "../components/shared/MobileBottomNav";
import { FloatingQuickActions } from "../components/shared/FloatingQuickActions";
import { auth } from "../utils/auth";
import api from "../services/api";
import { useToast } from "../components/Toast";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const queryView = searchParams.get("view") || searchParams.get("tab");

  const [activeView, setActiveView] = useState(() => {
    if (queryView && ["home", "taskmania", "mentorship", "requests", "profile", "virtual-cv", "cv-analysis", "bookmarks", "posts", "settings"].includes(queryView)) {
      return queryView;
    }
    return localStorage.getItem("vibe_student_tab") || "home";
  });

  useEffect(() => {
    if (queryView && ["home", "taskmania", "mentorship", "requests", "profile", "virtual-cv", "cv-analysis", "bookmarks", "posts", "settings"].includes(queryView)) {
      setActiveView(queryView);
    }
  }, [queryView]);
  const [activeFeedTab, setActiveFeedTab] = useState("for-you");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem("vibe_sidebar_collapsed") === "true"
  );
  const [user, setUser] = useState(auth.getCurrentUser());
  const [posts, setPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [bookmarkedTasks, setBookmarkedTasks] = useState([]);
  const [bookmarkedTaskIds, setBookmarkedTaskIds] = useState(new Set());
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  const mapTaskManiaTask = (task) => ({
    id: task._id || task.id,
    _id: task._id || task.id,
    title: task.title,
    company: (task.companyName && task.companyName.trim())
      ? task.companyName.trim()
      : (task.createdBy?.name || "Unknown Company"),
    companyId: task.createdBy?._id || task.createdBy,
    createdBy: task.createdBy,
    role: task.roleOffered,
    category: task.category || "Development",
    mode: task.location || "Remote",
    paid: task.packageRange !== "Unpaid",
    deadline: new Date(task.lastDateToSubmit).toLocaleDateString(),
    deadlineTs: new Date(task.lastDateToSubmit).getTime(),
    tags: task.skillsRequired || [],
    perks: (task.perks && typeof task.perks === "string" && task.perks.trim())
      ? task.perks.split(",").map((p) => p.trim()).filter(Boolean)
      : Array.isArray(task.perks)
      ? task.perks
      : [],
    description: task.description,
    instructions: task.instructions || [],
    submissions: task.submissions || [],
    matchScore: typeof task.matchScore === 'number' ? task.matchScore : 0,
    matchedSkills: Array.isArray(task.matchedSkills) ? task.matchedSkills : [],
    matchStrength: task.matchStrength || 'none',
    matchReason: task.matchReason || '',
  });

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
          setBookmarkedPosts(bmList);
          setBookmarkedIds(new Set(bmList.map((p) => p.id)));
        }

        // Fetch task bookmarks
        try {
          const taskBmRes = await api.get("/tasks/bookmarks");
          if (taskBmRes.data && Array.isArray(taskBmRes.data.data)) {
            const mappedTasks = taskBmRes.data.data.map(mapTaskManiaTask);
            setBookmarkedTasks(mappedTasks);
            setBookmarkedTaskIds(new Set(mappedTasks.map((t) => String(t.id || t._id))));
          }
        } catch (tErr) {
          console.warn("Could not fetch task bookmarks:", tErr);
        }
      } catch (bmErr) {
        console.warn("Could not fetch student bookmarks:", bmErr);
      }
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
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

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [activeView]);

  const handleSectionChange = (newSection) => {
    const next = newSection === "home" ? "posts" : newSection;
    setActiveView(next);
    localStorage.setItem("vibe_student_tab", next);
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

  
  const handleToggleTaskBookmark = async (taskId, fullTask = null) => {
    try {
      const tId = String(taskId);
      const isCurrentlyBookmarked = bookmarkedTaskIds.has(tId);

      setBookmarkedTaskIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) next.delete(tId);
        else next.add(tId);
        return next;
      });

      if (isCurrentlyBookmarked) {
        setBookmarkedTasks((prev) => prev.filter((t) => String(t.id || t._id) !== tId));
      } else if (fullTask) {
        setBookmarkedTasks((prev) => [mapTaskManiaTask(fullTask), ...prev]);
      }

      await api.post("/tasks/bookmark", { taskId: tId });
      toast.success(isCurrentlyBookmarked ? "Task removed from bookmarks" : "Task bookmarked successfully");

      const refetchRes = await api.get("/tasks/bookmarks");
      if (refetchRes.data?.data && Array.isArray(refetchRes.data.data)) {
        const mapped = refetchRes.data.data.map(mapTaskManiaTask);
        setBookmarkedTasks(mapped);
        setBookmarkedTaskIds(new Set(mapped.map((t) => String(t.id || t._id))));
      }
    } catch (err) {
      console.error("Error toggling task bookmark:", err);
      toast.error("Failed to update task bookmark");
    }
  };

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
      fetchPostsAndBookmarks();
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "taskmania":
        return (
          <TaskManiaView
            bookmarkedTaskIds={bookmarkedTaskIds}
            onToggleTaskBookmark={handleToggleTaskBookmark}
          />
        );
      case "mentorship":
      case "requests":
        return (
          <MyMentorRequestsView
            onBackToFeed={() => handleSectionChange("home")}
            initialTab={activeView === "requests" ? "requests" : "explore"}
          />
        );
      case "profile":
        return (
          <UnifiedProfileView
            user={user}
            currentUser={user}
            onProfileUpdate={setUser}
            onBack={() => handleSectionChange("home")}
            onNavigateToSettings={() => handleSectionChange("settings")}
          />
        );
      case "settings":
        return (
          <SettingsView
            user={user}
            onProfileUpdate={setUser}
            onBack={() => handleSectionChange("home")}
          />
        );
      case "virtual-cv":
      case "cv-analysis":
        return (
          <VirtualCVView
            user={user}
            onBackToFeed={() => handleSectionChange("home")}
          />
        );
      case "bookmarks":
        return (
          <StudentBookmarksView
            user={user}
            bookmarkedPosts={bookmarkedPosts}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            bookmarkedTasks={bookmarkedTasks}
            bookmarkedTaskIds={bookmarkedTaskIds}
            onToggleTaskBookmark={handleToggleTaskBookmark}
            onBackToFeed={() => handleSectionChange("home")}
            onNavigateToTaskMania={() => handleSectionChange("taskmania")}
            loadingPosts={loadingPosts}
            loadingTasks={loadingTasks}
          />
        );
      case "posts":
      case "home":
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
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSearchChange={setSearchQuery}
          />
        );
    }
  };

  const isHomeDashboard = activeView === "posts" || activeView === "home";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#6D3DF5] selection:text-white">
      {/* 1. Horizontal Header Aligned across the top */}
      <StudentTopHeader
        user={user}
        onLogout={handleLogout}
        onNavigate={handleSectionChange}
        onSearch={setSearchQuery}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* 2. Main Desktop Dashboard Container with mobile padding pb-24 */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-5">
        {isHomeDashboard ? (
          <div
            className={`grid grid-cols-1 gap-5 items-start transition-all duration-300 ${
              isSidebarCollapsed
                ? "md:grid-cols-[76px_minmax(0,1fr)] lg:grid-cols-[76px_minmax(0,1fr)_260px]"
                : "md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_260px]"
            }`}
          >
            {/* Column 1: Left Sidebar (hidden on mobile, sticky on desktop) */}
            <StudentLeftSidebar
              activeView={activeView}
              onNavigate={handleSectionChange}
              onLogout={handleLogout}
              isCollapsed={isSidebarCollapsed}
            />

            {/* Column 2: Center Feed (Primary content area) */}
            <div className="min-w-0 w-full">
              {renderContent()}
            </div>

            {/* Column 3: Right Sidebar — Hidden on tablet (< lg) and mobile */}
            <div className="hidden lg:block">
              <StudentRightPanel
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
            <StudentLeftSidebar
              activeView={activeView}
              onNavigate={handleSectionChange}
              onLogout={handleLogout}
              isCollapsed={isSidebarCollapsed}
            />

            {/* Dedicated View Column (Full available width, no right panel) */}
            <div className="min-w-0 w-full">
              {renderContent()}
            </div>
          </div>
        )}
      </main>

      {/* Floating Quick Actions (Mobile view only) */}
      {(activeView === "home" || activeView === "posts") && !isCreatePostOpen && (
        <FloatingQuickActions
          role="student"
          onNavigate={handleSectionChange}
          onOpenCreatePost={() => setIsCreatePostOpen(true)}
        />
      )}

      {/* Mobile Bottom Navigation Bar (app-style fixed bar for mobile screens) */}
      <MobileBottomNav
        role="student"
        activeView={activeView}
        onNavigate={handleSectionChange}
        onLogout={handleLogout}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
      />

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
              details: user?.Profile?.Branch 
                ? `${user?.Profile?.YearOfStudy ? `${user.Profile.YearOfStudy} year` : "Student"}, ${user.Profile.Branch}`
                : "Student Member",
            },
            time: "Just now",
            createdAt: new Date().toISOString(),
            tag: newPost.category || "General",
            category: newPost.category || "General",
            title: newPost.title,
            content: newPost.content,
            tags: Array.isArray(newPost.tags) ? newPost.tags : [],
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
