import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyTopHeader } from '../components/faculty/FacultyTopHeader';
import { IndustryLeftSidebar } from '../components/industry/IndustryLeftSidebar';
import { IndustryRightPanel } from '../components/industry/IndustryRightPanel';
import { Overview } from '../components/industry/Overview';
import { Community } from '../components/industry/Community';
import { MyTasks } from '../components/industry/MyTasks';
import { Profile } from '../components/industry/Profile';
import { MobileBottomNav } from '../components/shared/MobileBottomNav';
import { auth } from '../utils/auth';
import api from '../services/api';
import { useToast } from '../components/Toast';

const IndustryDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('vibe_industry_tab') || 'overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem("vibe_industry_sidebar_collapsed") === "true"
  );
  const [user, setUser] = useState(auth.getCurrentUser());
  const [tasks, setTasks] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("vibe_industry_sidebar_collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await auth.fetchUser();
        setUser(userData);
        
        const tasksRes = await api.get('/tasks/myTasks');
        if (tasksRes.data && tasksRes.data.data) {
          const fetchedTasks = tasksRes.data.data.map(task => ({
            id: task._id,
            title: task.title,
            category: "Development", // Default as backend might not have it
            role: task.roleOffered,
            company: task.companyName,
            location: "Remote",
            type: "Remote",
            payment: task.packageRange,
            skills: task.skillsRequired || [],
            perks: (task.perks && task.perks.trim()) ? task.perks.split(',').map(p => p.trim()).filter(Boolean) : [],
            deadline: new Date(task.lastDateToSubmit).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            status: "Active",
            applicantsCount: task.submissions?.length || 0,
            postedAt: new Date(task.createdAt).toISOString().split('T')[0],
            instructions: {
              overview: task.description,
              steps: task.instructions || [],
              note: task.additionalDocumentsURL || ""
            },
            materials: task.materials || [],
            // Keep original for updates
            _id: task._id
          }));
          setTasks(fetchedTasks);
          
          // Extract applicants from tasks.
          // Filter out any submission where the submitter is the task creator
          // (prevents the industry owner's own submissions from appearing as "applicants").
          const allApplicants = tasksRes.data.data.flatMap(task => {
            const creatorId = String(task.createdBy?._id || task.createdBy || "");
            return (task.submissions || [])
              .filter(sub => {
                // Skip submissions where createdBy is the task owner (industry)
                const submitterId = String(sub.createdBy?._id || sub.createdBy || "");
                return submitterId !== creatorId;
              })
              .map(sub => {
                // Resolve student name — prefer fullName, fall back to name
                const studentUser = sub.createdBy || {};
                const studentName =
                  (typeof studentUser.fullName === "string" && studentUser.fullName.trim()) ||
                  (typeof studentUser.name === "string" && studentUser.name.trim()) ||
                  (sub.email ? sub.email.split("@")[0] : "Unknown Student");
                return {
                  id: sub._id,
                  name: studentName,
                  avatar: studentUser.ImageUrl || studentUser.avatar || studentUser.Profile?.ImageUrl || "",
                  college: typeof studentUser.Profile?.InstituteName === "string" && studentUser.Profile.InstituteName.trim()
                    ? studentUser.Profile.InstituteName.trim()
                    : "Unknown Institute",
                  branch: typeof studentUser.Profile?.branch === "string" && studentUser.Profile.branch.trim()
                    ? studentUser.Profile.branch.trim()
                    : "General",
                  status: sub.status || "Pending",
                  taskId: task._id,
                  taskTitle: task.title,
                  email: studentUser.email || sub.email || "",
                  resumeLink: String(sub.submissionUrl || sub.demoUrl || sub.documentation_url || "").trim(),
                  attachments: Array.isArray(sub.attachments) ? sub.attachments : [],
                  submittedAt: new Date(sub.createdAt).toLocaleDateString(),
                  submissionDate: new Date(sub.createdAt),
                  submission: {
                    description: String(sub.message || "").trim(),
                    githubLink: String(sub.repoUrl || sub.githubUrl || sub.github_url || "").trim(),
                    videoLink: String(sub.videoUrl || sub.video_demo_url || "").trim(),
                    driveLink: String(sub.driveUrl || sub.googleDriveUrl || sub.drive_url || "").trim(),
                    otherLinks: (Array.isArray(sub.additionalLinks)
                      ? sub.additionalLinks
                      : Array.isArray(sub.additional_files)
                        ? sub.additional_files.map(f => f.url)
                        : [])
                      .filter(l => typeof l === "string" && l.trim())
                      .map(l => l.trim()),
                    projectTitle: String(sub.projectTitle || `Submission for ${task.title}`).trim()
                  }
                };
              });
          });
          setApplicants(allApplicants);
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
  }, [activeTab]);

  // Custom handler for section navigation with scroll
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

  const fetchAndMapTasks = async () => {
    try {
      const tasksRes = await api.get('/tasks/myTasks');
      if (tasksRes.data && tasksRes.data.data) {
        const fetchedTasks = tasksRes.data.data.map(task => ({
          id: task._id,
          title: task.title,
          category: "Development",
          role: task.roleOffered,
          company: task.companyName,
          location: task.location || "Remote",
          type: task.location || "Remote",
          payment: task.packageRange,
          skills: task.skillsRequired || [],
          perks: (task.perks && task.perks.trim()) ? task.perks.split(',').map(p => p.trim()).filter(Boolean) : [],
          deadline: new Date(task.lastDateToSubmit).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          status: "Active",
          applicantsCount: task.submissions?.length || 0,
          postedAt: new Date(task.createdAt).toISOString().split('T')[0],
          instructions: {
            overview: task.description,
            steps: task.instructions || [],
            note: task.additionalDocumentsURL || ""
          },
          materials: task.materials || [],
          _id: task._id
        }));
        setTasks(fetchedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
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
        await fetchAndMapTasks();
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
      await fetchAndMapTasks();
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
        Pending: "applied"
      };
      const payload = { status: statusMap[newStatus] || "applied", ...(details || {}) };
      await api.put(`/submissions/${applicantId}`, payload);
      setApplicants(prev => prev.map(applicant =>
        applicant.id === applicantId ? { ...applicant, status: newStatus } : applicant
      ));
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
            setActiveTab={setActiveTab}
            tasks={tasks}
            applicants={applicants}
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
          />
        );
      case 'profile':
        return <Profile user={user} tasks={tasks} applicants={applicants} onProfileUpdate={setUser} />;
      default:
        return (
          <Overview
            setActiveTab={setActiveTab}
            tasks={tasks}
            applicants={applicants}
          />
        );
    }
  };

  // Wide views (tasks, profile) get a 2-column layout; home views get the 3-column faculty shell
  const isWideView = activeTab === 'tasks' || activeTab === 'profile';

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
        {isWideView ? (
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

            {/* Dedicated View Column (Full available width, no right panel) */}
            <div className="min-w-0 w-full">
              {renderContent()}
            </div>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-5 items-start transition-all duration-300 ${
              isSidebarCollapsed
                ? "md:grid-cols-[76px_minmax(0,1fr)] lg:grid-cols-[76px_minmax(0,1fr)_260px]"
                : "md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_260px]"
            }`}
          >
            {/* Column 1: Left Fixed-Width Sidebar */}
            <IndustryLeftSidebar
              activeView={activeTab}
              onNavigate={handleSectionChange}
              onLogout={handleLogout}
              isCollapsed={isSidebarCollapsed}
            />

            {/* Column 2: Center (Primary content area, visibly wider than sidebars) */}
            <div className="min-w-0 w-full">
              {renderContent()}
            </div>

            {/* Column 3: Right Sidebar — Hidden on tablet (< lg) and mobile */}
            <div className="hidden lg:block">
              <IndustryRightPanel
                applicants={applicants}
                onUpdateApplicantStatus={handleUpdateApplicantStatus}
                onNavigate={handleSectionChange}
                onPostTask={() => handleSectionChange('tasks')}
              />
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (app-style fixed bar for mobile screens) */}
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
