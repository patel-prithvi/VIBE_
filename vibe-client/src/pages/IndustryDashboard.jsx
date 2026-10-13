import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/shared/DashboardLayout';
import { Overview } from '../components/industry/Overview';
import { Community } from '../components/industry/Community';
import { MyTasks } from '../components/industry/MyTasks';
import { Profile } from '../components/industry/Profile';
import { auth } from '../utils/auth';
import api from '../services/api';

const IndustryDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('vibe_industry_tab') || 'overview');
  const [user, setUser] = useState(auth.getCurrentUser());
  const [tasks, setTasks] = useState([]);
  const [applicants, setApplicants] = useState([]);

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
                  avatar: studentUser.ImageUrl || `https://picsum.photos/seed/${studentUser._id || 'default'}/200`,
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
    setActiveTab(newSection);
    localStorage.setItem('vibe_industry_tab', newSection);
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
      const payload = {
        title: newTask.title,
        description: newTask.instructions.overview,
        instructions: newTask.instructions.steps,
        roleOffered: newTask.role,
        packageRange: newTask.payment, 
        companyName: newTask.company || user?.Profile?.InstituteName || user.name,
        skillsRequired: newTask.skills,
        lastDateToSubmit: newTask.deadline,
        additionalDocumentsURL: newTask.instructions.note, 
        projectSubmissionFormatURL: "",
        perks: newTask.perks || "",
        location: newTask.location || "Remote"
      };

      const response = await api.post('/tasks', payload);
      if (response.data && response.data.data) {
        await fetchAndMapTasks();
        alert("Task created successfully!");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const payload = {
        title: updatedTask.title,
        description: updatedTask.instructions.overview,
        instructions: updatedTask.instructions.steps,
        roleOffered: updatedTask.role,
        packageRange: updatedTask.payment,
        companyName: updatedTask.company || user?.Profile?.InstituteName || user.name,
        skillsRequired: updatedTask.skills,
        lastDateToSubmit: updatedTask.deadline,
        additionalDocumentsURL: updatedTask.instructions.note,
        perks: updatedTask.perks || "",
        location: updatedTask.location || "Remote"
      };

      await api.put(`/tasks/${updatedTask.id}`, payload);
      await fetchAndMapTasks();
      alert("Task updated successfully!");
    } catch (error) {
       console.error("Error updating task:", error);
       alert("Failed to update task");
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
      alert("Status updated");
    } catch (error) {
      console.error("Error updating applicant status:", error);
      alert("Failed to update status");
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
        return <Community />;
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
        return <Profile user={user} tasks={tasks} onProfileUpdate={setUser} />;
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

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={handleSectionChange}
      role="industry"
      user={user}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default IndustryDashboard;
