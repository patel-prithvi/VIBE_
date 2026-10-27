import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSmartPolling } from '../hooks/useSmartPolling';
import { FacultyTopHeader } from '../components/faculty/FacultyTopHeader';
import { IndustryLeftSidebar } from '../components/industry/IndustryLeftSidebar';
import { Overview } from '../components/industry/Overview';
import { Community } from '../components/industry/Community';
import { MyTasks } from '../components/industry/MyTasks';
import { Profile } from '../components/industry/Profile';
import { UnifiedProfileView } from '../components/profile/UnifiedProfileView';
import { SettingsView } from '../components/settings/SettingsView';
import { StudentBookmarksView } from '../components/student/StudentBookmarksView';
import { MobileBottomNav } from '../components/shared/MobileBottomNav';
import { auth } from '../utils/auth';
import { isTaskExpired } from '../utils/taskRelevance';
import api from '../services/api';
import { useToast } from '../components/Toast';

const IndustryDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') || searchParams.get('view');

  const [activeTab, setActiveTab] = useState(() => {
    if (queryTab && ['overview', 'tasks', 'community', 'profile', 'bookmarks', 'settings'].includes(queryTab)) {
      return queryTab;
    }
    return localStorage.getItem('vibe_industry_tab') || 'overview';
  });

  useEffect(() => {
    if (queryTab && ['overview', 'tasks', 'community', 'profile', 'bookmarks', 'settings'].includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem("vibe_industry_sidebar_collapsed") === "true"
  );
  const [user, setUser] = useState(auth.getCurrentUser());
  const [tasks, setTasks] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Cross-component contextual navigation states
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoadingBookmarks(true);
      const bmRes = await api.get("/posts/bookmarks").catch(() => ({ data: { data: [] } }));

      if (bmRes.data && bmRes.data.data) {
        const bmList = bmRes.data.data.map((post) => ({
          id: post._id,
          _id: post._id,
          author: {
            name: post.author?.name || "Unknown",
            role: post.author?.accountType || "Industry",
            accountType: post.author?.accountType || "Industry",
            avatar: post.author?.ImageUrl || `https://picsum.photos/seed/${post.author?._id || "default"}/200`,
            verified: true,
            details: "Industry Partner",
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
          shares: 0,
          repostOf: post.repostOf || null,
          repostComment: post.repostComment || "",
          repostCount: post.repostCount || (Array.isArray(post.reposts) ? post.reposts.length : 0),
        }));
        setBookmarkedPosts(bmList);
        setBookmarkedIds(new Set(bmList.map((p) => String(p.id))));
      }
    } catch (err) {
      console.error("Error fetching bookmarks in IndustryDashboard:", err);
    } finally {
      setLoadingBookmarks(false);
    }
  }, []);

  const handleToggleBookmark = async (postId) => {
    try {
      const pId = String(postId);
      const isCurrentlyBookmarked = bookmarkedIds.has(pId);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) next.delete(pId);
        else next.add(pId);
        return next;
      });

      if (isCurrentlyBookmarked) {
        setBookmarkedPosts((prev) => prev.filter((p) => String(p.id || p._id) !== pId));
      }

      await api.post("/posts/bookmark", { postId: pId });
      toast.success(isCurrentlyBookmarked ? "Bookmark removed" : "Post bookmarked");
    } catch (err) {
      console.error("Error toggling post bookmark:", err);
      toast.error("Failed to update bookmark");
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("vibe_industry_sidebar_collapsed", String(next));
      return next;
    });
  };

  const processTasksAndApplicants = (taskList) => {
    const mappedTasks = (taskList || []).map((task) => {
      const isExpired = isTaskExpired(task);
      const taskStatus = isExpired ? "Closed" : "Active";

      const creatorId = String(task.createdBy?._id || task.createdBy || "");
      const validSubmissions = (task.submissions || []).filter((sub) => {
        const submitterId = String(sub.createdBy?._id || sub.createdBy || "");
        return submitterId !== creatorId;
      });

      const submissionsWithWork = validSubmissions.filter((sub) => {
        const statusLower = String(sub.status || "").toLowerCase();
        return Boolean(
          sub.submissionUrl ||
          sub.repoUrl ||
          sub.driveUrl ||
          sub.videoUrl ||
          (sub.message && sub.message.trim()) ||
          ["submitted", "reviewed", "shortlisted", "interview_scheduled", "hired"].includes(statusLower)
        );
      });

      return {
        id: task._id,
        title: task.title,
        category: task.roleOffered || "Development",
        role: task.roleOffered,
        company: task.companyName,
        location: task.location || "Remote",
        type: task.location || "Remote",
        payment: task.packageRange,
        skills: task.skillsRequired || [],
        perks:
          task.perks && task.perks.trim()
            ? task.perks.split(",").map((p) => p.trim()).filter(Boolean)
            : [],
        deadline: new Date(task.lastDateToSubmit).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        deadlineRaw: task.lastDateToSubmit,
        lastDateToSubmit: task.lastDateToSubmit,
        isExpired: isExpired,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        status: taskStatus,
        applicantsCount: validSubmissions.length,
        submissionsCount: submissionsWithWork.length,
        postedAt: new Date(task.createdAt).toISOString().split("T")[0],
        instructions: {
          overview: task.description,
          steps: task.instructions || [],
          note: task.additionalDocumentsURL || "",
        },
        materials: task.materials || [],
        _id: task._id,
      };
    });

    const allApplicants = (taskList || []).flatMap((task) => {
      const creatorId = String(task.createdBy?._id || task.createdBy || "");
      return (task.submissions || [])
        .filter((sub) => {
          const submitterId = String(sub.createdBy?._id || sub.createdBy || "");
          return submitterId !== creatorId;
        })
        .map((sub) => {
          const studentUser = sub.createdBy || {};
          const studentName =
            (typeof studentUser.fullName === "string" && studentUser.fullName.trim()) ||
            (typeof studentUser.name === "string" && studentUser.name.trim()) ||
            (sub.email ? sub.email.split("@")[0] : "Unknown Student");

          const rawStatus = String(sub.status || "applied");
          const statusLower = rawStatus.toLowerCase();
          const hasWorkSubmitted = Boolean(
            sub.submissionUrl ||
            sub.repoUrl ||
            sub.driveUrl ||
            sub.videoUrl ||
            (sub.message && sub.message.trim()) ||
            ["submitted", "reviewed", "shortlisted", "interview_scheduled", "hired"].includes(statusLower)
          );

          return {
            id: sub._id,
            studentId:
              studentUser._id ||
              studentUser.id ||
              (typeof sub.createdBy === "string" ? sub.createdBy : null),
            name: studentName,
            avatar:
              studentUser.ImageUrl ||
              studentUser.avatar ||
              studentUser.Profile?.ImageUrl ||
              "",
            college:
              typeof studentUser.Profile?.InstituteName === "string" &&
              studentUser.Profile.InstituteName.trim()
                ? studentUser.Profile.InstituteName.trim()
                : "Unknown Institute",
            branch:
              (typeof studentUser.Profile?.branch === "string" && studentUser.Profile.branch.trim()) ||
              (typeof studentUser.Profile?.department === "string" && studentUser.Profile.department.trim()) ||
              (typeof studentUser.branch === "string" && studentUser.branch.trim()) ||
              (typeof studentUser.department === "string" && studentUser.department.trim()) ||
              "General",
            status: sub.status || "applied",
            rawStatus: rawStatus,
            hasWorkSubmitted,
            taskId: task._id,
            taskTitle: task.title,
            taskDeadline: task.lastDateToSubmit,
            email: studentUser.email || sub.email || "",
            resumeLink: String(
              sub.submissionUrl || sub.demoUrl || sub.documentation_url || ""
            ).trim(),
            attachments: Array.isArray(sub.attachments) ? sub.attachments : [],
            submittedAt: new Date(sub.createdAt).toLocaleDateString(),
            submissionDate: new Date(sub.createdAt),
            interviewDate: sub.interviewDate || "",
            interviewTime: sub.interviewTime || "",
            interviewMode: sub.interviewMode || "Online",
            interviewLink: sub.interviewLink || "",
            score: sub.score || 0,
            reviewFeedback: sub.reviewFeedback || "",
            submission: {
              description: String(sub.message || "").trim(),
              githubLink: String(
                sub.repoUrl || sub.githubUrl || sub.github_url || ""
              ).trim(),
              videoLink: String(
                sub.videoUrl || sub.video_demo_url || ""
              ).trim(),
              driveLink: String(
                sub.driveUrl || sub.googleDriveUrl || sub.drive_url || ""
              ).trim(),
              otherLinks: (Array.isArray(sub.additionalLinks)
                ? sub.additionalLinks
                : Array.isArray(sub.additional_files)
                ? sub.additional_files.map((f) => f.url)
                : []
              )
                .filter((l) => typeof l === "string" && l.trim())
                .map((l) => l.trim()),
              projectTitle: String(
                sub.projectTitle || `Submission for ${task.title}`
              ).trim(),
            },
          };
        });
    });

    const activeTasks = mappedTasks.filter((t) => !t.isExpired);
    const expiredTasks = mappedTasks.filter((t) => t.isExpired);
    const sortedMappedTasks = [...activeTasks, ...expiredTasks];

    return { mappedTasks: sortedMappedTasks, allApplicants };
  };

  const fetchData = useCallback(async () => {
    try {
      const userData = await auth.fetchUser();
      setUser(userData);

      const tasksRes = await api.get('/tasks/myTasks');
      if (tasksRes.data && tasksRes.data.data) {
        const { mappedTasks, allApplicants } = processTasksAndApplicants(tasksRes.data.data);
        setTasks(mappedTasks);
        setApplicants(allApplicants);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchBookmarks();
  }, [fetchData, fetchBookmarks]);

  // Smart polling every 30s
  useSmartPolling(fetchData, {
    intervalMs: 30000,
    enabled: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pauseWhenHidden: true,
  });

  // Scroll to top when section changes
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleSectionChange = (newSection) => {
    const next = newSection === 'home' ? 'overview' : newSection;
    setActiveTab(next);
    localStorage.setItem('vibe_industry_tab', next);
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

  const handleReviewTask = (taskId) => {
    setFocusedTaskId(taskId);
    handleSectionChange('tasks');
  };

  const handleOpenCreateTask = () => {
    setOpenCreateModal(true);
    handleSectionChange('tasks');
  };

  const handleViewTaskDetails = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleAddTask = async (newTask) => {
    try {
      const formData = new FormData();
      formData.append("title", newTask.title || "");
      formData.append("description", newTask.instructions?.overview || "");
      formData.append("instructions", JSON.stringify(newTask.instructions?.steps || []));
      formData.append("roleOffered", newTask.role || "");
      formData.append("packageRange", newTask.payment || "Paid");
      formData.append(
        "companyName",
        newTask.company || user?.Profile?.InstituteName || user?.name || "Industry Partner"
      );
      formData.append("skillsRequired", JSON.stringify(newTask.skills || []));
      formData.append("lastDateToSubmit", newTask.deadline || "");
      formData.append("additionalDocumentsURL", newTask.instructions?.note || "");
      formData.append("projectSubmissionFormatURL", "");
      formData.append("perks", newTask.perks || "");
      formData.append("location", newTask.location || "Remote");

      if (Array.isArray(newTask.materialsFiles) && newTask.materialsFiles.length > 0) {
        newTask.materialsFiles.forEach((file) => {
          formData.append("materials", file);
        });
      }

      const response = await api.post('/tasks', formData);
      if (response.data && response.data.data) {
        await fetchData();
        toast.success("Task created successfully with materials!");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const formData = new FormData();
      formData.append("title", updatedTask.title || "");
      formData.append("description", updatedTask.instructions?.overview || "");
      formData.append("instructions", JSON.stringify(updatedTask.instructions?.steps || []));
      formData.append("roleOffered", updatedTask.role || "");
      formData.append("packageRange", updatedTask.payment || "Paid");
      formData.append(
        "companyName",
        updatedTask.company || user?.Profile?.InstituteName || user?.name || "Industry Partner"
      );
      formData.append("skillsRequired", JSON.stringify(updatedTask.skills || []));
      formData.append("lastDateToSubmit", updatedTask.deadline || "");
      formData.append("additionalDocumentsURL", updatedTask.instructions?.note || "");
      formData.append("perks", updatedTask.perks || "");
      formData.append("location", updatedTask.location || "Remote");

      if (updatedTask.existingMaterials !== undefined) {
        formData.append("existingMaterials", JSON.stringify(updatedTask.existingMaterials));
      }

      if (Array.isArray(updatedTask.materialsFiles) && updatedTask.materialsFiles.length > 0) {
        updatedTask.materialsFiles.forEach((file) => {
          formData.append("materials", file);
        });
      }

      await api.put(`/tasks/${updatedTask.id}`, formData);
      await fetchData();
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const handleUpdateApplicantStatus = async (applicantId, newStatus, details) => {
    try {
      const statusMap = {
        APPLIED: "applied",
        SHORTLISTED: "shortlisted",
        INTERVIEW_SCHEDULED: "interview_scheduled",
        SELECTED: "hired",
        REJECTED: "rejected",
        Approved: "hired",
        Rejected: "rejected",
        Pending: "applied",
      };
      const backendStatus = statusMap[newStatus] || newStatus.toLowerCase();
      const payload = { status: backendStatus, ...(details || {}) };
      await api.put(`/submissions/${applicantId}`, payload);
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.id === applicantId
            ? {
                ...applicant,
                status: newStatus,
                rawStatus: backendStatus,
                ...(details || {}),
              }
            : applicant
        )
      );
      toast.success("Status updated");
    } catch (error) {
      console.error("Error updating applicant status:", error);
      toast.error("Failed to update status");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            tasks={tasks}
            applicants={applicants}
            user={user}
            setActiveTab={handleSectionChange}
            onReviewTask={handleReviewTask}
            onCreateTask={handleOpenCreateTask}
            onViewTaskDetails={handleViewTaskDetails}
          />
        );
      case 'community':
        return <Community searchQuery={searchQuery} />;
      case 'tasks':
        return (
          <MyTasks
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            applicants={applicants}
            onUpdateApplicantStatus={handleUpdateApplicantStatus}
            user={user}
            initialActiveTaskId={focusedTaskId}
            onClearInitialTaskId={() => setFocusedTaskId(null)}
            initialOpenCreateModal={openCreateModal}
            onClearOpenCreateModal={() => setOpenCreateModal(false)}
          />
        );
      case 'profile':
        return (
          <UnifiedProfileView
            user={user}
            currentUser={user}
            onProfileUpdate={setUser}
            onBack={() => handleSectionChange('overview')}
            onNavigateToSettings={() => handleSectionChange('settings')}
          />
        );
      case 'settings':
        return (
          <SettingsView
            user={user}
            onProfileUpdate={setUser}
            onBack={() => handleSectionChange('overview')}
          />
        );
      case 'bookmarks':
        return (
          <StudentBookmarksView
            user={user}
            bookmarkedPosts={bookmarkedPosts}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onBackToFeed={() => handleSectionChange('community')}
            loadingPosts={loadingBookmarks}
          />
        );
      default:
        return (
          <Overview
            tasks={tasks}
            applicants={applicants}
            user={user}
            setActiveTab={handleSectionChange}
            onReviewTask={handleReviewTask}
            onCreateTask={handleOpenCreateTask}
            onViewTaskDetails={handleViewTaskDetails}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#6D3DF5] selection:text-white">
      {/* 1. Top Horizontal Header */}
      <FacultyTopHeader
        user={user}
        onLogout={handleLogout}
        onNavigate={handleSectionChange}
        onSearch={setSearchQuery}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* 2. Main Desktop Dashboard Container (2-Column layout, full available width, no unused column) */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-5">
        <div
          className={`grid grid-cols-1 gap-5 items-start transition-all duration-300 ${
            isSidebarCollapsed
              ? "md:grid-cols-[76px_minmax(0,1fr)]"
              : "md:grid-cols-[260px_minmax(0,1fr)]"
          }`}
        >
          {/* Column 1: Left Fixed-Width Sidebar */}
          <IndustryLeftSidebar
            activeView={activeTab}
            onNavigate={handleSectionChange}
            onLogout={handleLogout}
            isCollapsed={isSidebarCollapsed}
          />

          {/* Column 2: Dedicated Content Area (Uses all remaining space cleanly) */}
          <div className="min-w-0 w-full">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* 3. Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        role="industry"
        activeView={activeTab}
        onNavigate={handleSectionChange}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default IndustryDashboard;
