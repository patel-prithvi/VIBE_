import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, ArrowLeft, Briefcase, FileText, Loader2, Search } from "lucide-react";
import { StudentPostCard } from "./StudentPostCard";
import { TaskCard } from "../taskmania/TaskCard";
import { InstructionModal } from "../taskmania/InstructionModal";
import { ApplicationFormModal } from "../taskmania/ApplicationFormModal";
import { MentorRequestModal } from "../taskmania/MentorRequestModal";
import api from "../../services/api";
import { auth } from "../../utils/auth";
import { useToast } from "../Toast";

export const StudentBookmarksView = ({
  user,
  bookmarkedPosts = [],
  bookmarkedIds = new Set(),
  onToggleBookmark,
  bookmarkedTasks = [],
  bookmarkedTaskIds = new Set(),
  onToggleTaskBookmark,
  onBackToFeed,
  onNavigateToTaskMania,
  loadingPosts = false,
  loadingTasks = false,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("posts"); // "posts" | "tasks"

  // Determine current user's role dynamically from props or session
  const currentUser = user || auth.getCurrentUser();
  const rawRole = String(currentUser?.role || currentUser?.accountType || "").trim().toLowerCase();
  const isStudent = rawRole === "student";

  // If role cannot view tasks, enforce "posts" tab
  useEffect(() => {
    if (!isStudent && activeTab !== "posts") {
      setActiveTab("posts");
    }
  }, [isStudent, activeTab]);

  // Task interaction state
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [applyingTaskId, setApplyingTaskId] = useState(null);
  const [selectedTaskForInstructions, setSelectedTaskForInstructions] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isMentorRequestOpen, setIsMentorRequestOpen] = useState(false);

  // Fetch submissions and mentor requests so task badges and actions match TaskMania
  useEffect(() => {
    if (!isStudent) return;
    let mounted = true;
    (async () => {
      try {
        const [subsRes, mentorReqsRes] = await Promise.all([
          api.get("/submissions/me").catch(() => ({ data: { data: [] } })),
          api.get("/mentor-requests/my-requests").catch(() => ({ data: { data: [] } })),
        ]);
        if (mounted) {
          if (subsRes.data?.data && Array.isArray(subsRes.data.data)) {
            setUserSubmissions(subsRes.data.data);
          }
          if (mentorReqsRes.data?.data && Array.isArray(mentorReqsRes.data.data)) {
            setMentorRequests(mentorReqsRes.data.data);
          }
        }
      } catch (err) {
        console.warn("Could not load submissions/mentor requests in bookmarks:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenInstructions = (task) => {
    setSelectedTaskForInstructions(task);
  };

  const handleApplyDirect = async (task) => {
    const tId = task.id || task._id;
    if (!tId) return;

    try {
      setApplyingTaskId(tId);
      const res = await api.post(`/submissions/apply/${tId}`);
      const newSub = res.data?.data || { taskId: tId, status: "accepted" };

      setUserSubmissions((prev) => {
        const filtered = prev.filter(
          (s) => String(s.taskId?._id || s.taskId) !== String(tId)
        );
        return [...filtered, newSub];
      });

      toast.success("Task applied successfully! You can now submit your solution.");
    } catch (error) {
      console.error("Error applying for task from bookmarks:", error);
      toast.error(
        error.response?.data?.message || "Failed to apply for task. Please try again."
      );
    } finally {
      setApplyingTaskId(null);
    }
  };

  const handleOpenSubmitTask = (task) => {
    setSelectedTask(task);
    setIsApplicationOpen(true);
  };

  const handleOpenMentorRequest = (task) => {
    setSelectedTask(task);
    setIsMentorRequestOpen(true);
  };

  const handleSubmitApplication = async (taskId, formData) => {
    try {
      const payload = {
        taskId,
        projectTitle: formData.projectTitle || "",
        repoUrl: formData.githubUrl || "",
        videoUrl: formData.videoUrl || "",
        driveUrl: formData.googleDriveUrl || "",
        additionalLinks: Array.isArray(formData.additionalLinks) ? formData.additionalLinks : [],
        message: formData.description || "",
      };

      const res = await api.post("/submissions/submit", payload);
      const updatedSub = res.data?.data || { ...payload, status: "submitted" };

      setUserSubmissions((prev) => {
        const filtered = prev.filter(
          (s) => String(s.taskId?._id || s.taskId) !== String(taskId)
        );
        return [...filtered, updatedSub];
      });

      toast.success("Task solution submitted successfully!");
      setIsApplicationOpen(false);
    } catch (error) {
      console.error("Error submitting solution from bookmarks:", error);
      toast.error(error.response?.data?.message || "Failed to submit solution. Please try again.");
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* Page Header */}
      <div className="vibe-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center flex-shrink-0">
            <Bookmark size={20} className="fill-[#6D3DF5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              My Bookmarks
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              {isStudent
                ? "Saved community posts and TaskMania challenges for quick reference"
                : "Saved community posts, discussions, and updates for quick reference"}
            </p>
          </div>
        </div>

        {onBackToFeed && (
          <button
            type="button"
            onClick={onBackToFeed}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D3DF5] hover:text-[#5B2FD6] transition-colors cursor-pointer self-start sm:self-center"
          >
            <ArrowLeft size={14} />
            <span>Back to Feed</span>
          </button>
        )}
      </div>

      {/* Tabs Header - Styled consistently with Community feed tabs */}
      <div className="vibe-card px-5 sm:px-6 pt-3 border-b border-[#F1F5F9]">
        <div className="flex items-center space-x-6 overflow-x-auto select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0">
          {/* Tab 1: Community Posts */}
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`pb-3 text-sm font-bold tracking-tight whitespace-nowrap relative transition-colors shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === "posts" || !isStudent
                ? "text-[#6D3DF5]"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileText size={15} />
              <span>Community Posts</span>
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "posts" || !isStudent
                  ? "bg-[#F3EEFF] text-[#6D3DF5]"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {bookmarkedPosts.length}
            </span>
            {(activeTab === "posts" || !isStudent) && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#6D3DF5] rounded-full" />
            )}
          </button>

          {/* Tab 2: TaskMania Tasks - Visible ONLY for Students */}
          {isStudent && (
            <button
              type="button"
              onClick={() => setActiveTab("tasks")}
              className={`pb-3 text-sm font-bold tracking-tight whitespace-nowrap relative transition-colors shrink-0 cursor-pointer flex items-center gap-2 ${
                activeTab === "tasks"
                  ? "text-[#6D3DF5]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Briefcase size={15} />
                <span>TaskMania Tasks</span>
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "tasks"
                    ? "bg-[#F3EEFF] text-[#6D3DF5]"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {bookmarkedTasks.length}
              </span>
              {activeTab === "tasks" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#6D3DF5] rounded-full" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tab 1 Content: Community Posts */}
      {(activeTab === "posts" || !isStudent) && (
        <div className="space-y-4">
          {loadingPosts ? (
            <div className="vibe-card p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#6D3DF5] animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#64748B]">Loading bookmarked posts...</p>
            </div>
          ) : bookmarkedPosts.length > 0 ? (
            bookmarkedPosts.map((post) => {
              const pId = post.id || post._id;
              return (
                <StudentPostCard
                  key={pId}
                  post={post}
                  currentUser={user}
                  isBookmarked={true}
                  onToggleBookmark={onToggleBookmark}
                />
              );
            })
          ) : (
            <div className="vibe-card p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] flex items-center justify-center mx-auto border border-[#E2E8F0]">
                <Bookmark size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  No bookmarked posts yet
                </h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 leading-relaxed">
                  Save community posts, notes, and discussions that you want to revisit, and they will appear here.
                </p>
              </div>
              {onBackToFeed && (
                <button
                  type="button"
                  onClick={onBackToFeed}
                  className="mt-2 inline-flex items-center gap-2 vibe-btn vibe-btn-navy px-4 py-2 text-xs shadow-xs cursor-pointer"
                >
                  Explore Community Posts
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2 Content: TaskMania Tasks (Students only) */}
      {isStudent && activeTab === "tasks" && (
        <div className="space-y-4">
          {loadingTasks ? (
            <div className="vibe-card p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#6D3DF5] animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#64748B]">Loading bookmarked tasks...</p>
            </div>
          ) : bookmarkedTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {bookmarkedTasks.map((task) => {
                const taskId = task.id || task._id;
                const sub = userSubmissions.find(
                  (s) => String(s.taskId?._id || s.taskId) === String(taskId)
                );
                const isAccepted = Boolean(sub && sub.status !== "rejected");
                const isSolutionSubmitted = Boolean(
                  sub &&
                    (sub.repoUrl ||
                      sub.videoUrl ||
                      sub.driveUrl ||
                      sub.projectTitle ||
                      [
                        "submitted",
                        "reviewed",
                        "shortlisted",
                        "interview_scheduled",
                        "hired",
                      ].includes(String(sub.status || "").toLowerCase()))
                );
                const isApplying = applyingTaskId === taskId;

                return (
                  <TaskCard
                    key={taskId}
                    task={task}
                    isAccepted={isAccepted}
                    isSolutionSubmitted={isSolutionSubmitted}
                    isApplying={isApplying}
                    isBookmarked={true}
                    onToggleBookmark={() => {
                      if (typeof onToggleTaskBookmark === "function") {
                        onToggleTaskBookmark(taskId, task);
                      }
                    }}
                    mentorRequest={mentorRequests.find(
                      (req) => String(req.task?._id || req.task) === String(taskId)
                    )}
                    onOpenInstructions={handleOpenInstructions}
                    onApplyDirect={handleApplyDirect}
                    onOpenSubmitTask={handleOpenSubmitTask}
                    onOpenMentorRequest={handleOpenMentorRequest}
                  />
                );
              })}
            </div>
          ) : (
            <div className="vibe-card p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] flex items-center justify-center mx-auto border border-[#E2E8F0]">
                <Briefcase size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  No bookmarked tasks yet
                </h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 leading-relaxed">
                  Bookmark challenges from TaskMania to easily track deadlines, review guidelines, and prepare solutions.
                </p>
              </div>
              {onNavigateToTaskMania && (
                <button
                  type="button"
                  onClick={onNavigateToTaskMania}
                  className="mt-2 inline-flex items-center gap-2 vibe-btn vibe-btn-navy px-4 py-2 text-xs shadow-xs cursor-pointer"
                >
                  Browse TaskMania Challenges
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals for TaskMania actions from Bookmarks view (Students only) */}
      {isStudent && selectedTaskForInstructions && (() => {
        const tId = selectedTaskForInstructions.id || selectedTaskForInstructions._id;
        const sub = userSubmissions.find(
          (s) => String(s.taskId?._id || s.taskId) === String(tId)
        );
        const isAccepted = Boolean(sub && sub.status !== "rejected");
        const isSolutionSubmitted = Boolean(
          sub &&
            (sub.repoUrl ||
              sub.videoUrl ||
              sub.driveUrl ||
              sub.projectTitle ||
              [
                "submitted",
                "reviewed",
                "shortlisted",
                "interview_scheduled",
                "hired",
              ].includes(String(sub.status || "").toLowerCase()))
        );
        const isApplying = applyingTaskId === tId;

        return (
          <InstructionModal
            isOpen={Boolean(selectedTaskForInstructions)}
            onClose={() => setSelectedTaskForInstructions(null)}
            task={selectedTaskForInstructions}
            isAccepted={isAccepted}
            isSolutionSubmitted={isSolutionSubmitted}
            isApplying={isApplying}
            onViewDetails={(task) => {
              setSelectedTaskForInstructions(null);
              navigate(`/tasks/${task.id || task._id}`);
            }}
            onApplyDirect={handleApplyDirect}
            onOpenSubmitTask={(task) => {
              setSelectedTaskForInstructions(null);
              handleOpenSubmitTask(task);
            }}
          />
        );
      })()}

      {isStudent && (
        <>
          <ApplicationFormModal
            isOpen={isApplicationOpen}
            onClose={() => setIsApplicationOpen(false)}
            onSubmit={handleSubmitApplication}
            task={selectedTask}
            existingData={userSubmissions.find(
              (s) => String(s.taskId?._id || s.taskId) === String(selectedTask?.id || selectedTask?._id)
            )}
          />

          <MentorRequestModal
            isOpen={isMentorRequestOpen}
            onClose={() => setIsMentorRequestOpen(false)}
            task={selectedTask}
          />
        </>
      )}
    </div>
  );
};
