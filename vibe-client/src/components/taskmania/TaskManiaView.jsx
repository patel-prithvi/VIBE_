import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Briefcase, ChevronDown, GripVertical } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { InstructionModal } from './InstructionModal';
import { ApplicationFormModal } from './ApplicationFormModal';
import { MentorRequestModal } from './MentorRequestModal';
import api from '../../services/api';
import { useToast } from '../Toast';
import { useSmartPolling } from '../../hooks/useSmartPolling';
import {
  orderTasksWithFallback,
  sortTasksByRelevance,
  getTaskDeadlineTs,
  isTaskExpired,
} from '../../utils/taskRelevance';

export const TaskManiaView = ({
  bookmarkedTaskIds: propBookmarkedTaskIds,
  onToggleTaskBookmark: propOnToggleTaskBookmark,
}) => {
  const [internalBookmarkedTaskIds, setInternalBookmarkedTaskIds] = useState(new Set());
  const bookmarkedTaskIds = propBookmarkedTaskIds || internalBookmarkedTaskIds;
  const navigate = useNavigate();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [savedOrder, setSavedOrder] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState(
    () => sessionStorage.getItem('vibe_taskmania_search') || ''
  );
  const [selectedProgress, setSelectedProgress] = useState(
    () => sessionStorage.getItem('vibe_taskmania_progress') || 'all'
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => sessionStorage.getItem('vibe_taskmania_category') || 'All'
  );
  const [selectedMode, setSelectedMode] = useState(
    () => sessionStorage.getItem('vibe_taskmania_mode') || 'All'
  );

  // Drag and Drop States
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dropTargetTaskId, setDropTargetTaskId] = useState(null);

  // Modal States
  const [selectedTaskForInstructions, setSelectedTaskForInstructions] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isMentorRequestOpen, setIsMentorRequestOpen] = useState(false);
  const [applyingTaskId, setApplyingTaskId] = useState(null);

  const categories = ['All', 'Development', 'Design', 'AI/ML', 'Web Development', 'Healthcare'];
  const modes = ['All', 'Remote', 'Onsite', 'Hybrid'];

  const progressOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'not_applied', label: 'Not Applied' },
    { value: 'working_on', label: 'Applied / Working On' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  // Order sorting utility: combines manual priority ordering with skill relevance
  const sortTasksByOrder = useCallback((taskList, orderIds) => {
    return orderTasksWithFallback(taskList, orderIds);
  }, []);

  // Reset custom manual order back to skill-based recommendation
  const handleResetToSkillsOrder = useCallback(async () => {
    try {
      await api.put('/tasks/order', { taskOrder: [] });
      setSavedOrder([]);
      setTasks((prev) => sortTasksByRelevance(prev));
      toast.success('Restored skills-based recommendation order');
    } catch (err) {
      console.error('Failed to reset task order:', err);
      toast.error('Failed to reset task order');
    }
  }, [toast]);

  // Determine stage progress of student application
  const getTaskProgressStatus = useCallback((task, submission) => {
    if (!submission) return 'not_applied';

    const rawStatus = String(submission.status || '').toLowerCase().trim();

    if (rawStatus === 'rejected') {
      return 'rejected';
    }

    const hasSubmittedWork = Boolean(
      submission.repoUrl ||
      submission.videoUrl ||
      submission.driveUrl ||
      submission.projectTitle ||
      submission.message ||
      (Array.isArray(submission.attachments) && submission.attachments.length > 0) ||
      ['submitted', 'reviewed', 'shortlisted', 'interview_scheduled', 'hired'].includes(rawStatus)
    );

    if (!hasSubmittedWork) {
      return 'working_on';
    }

    if (rawStatus === 'hired' || rawStatus === 'selected') {
      return 'accepted';
    }

    if (rawStatus === 'interview_scheduled' || Boolean(submission.interviewDate)) {
      return 'interview_scheduled';
    }

    if (rawStatus === 'reviewed' || rawStatus === 'shortlisted') {
      return 'under_review';
    }

    if (rawStatus === 'accepted') {
      return 'accepted';
    }

    return 'submitted';
  }, []);

  // Bookmark toggle
  const handleToggleTaskBookmark = async (taskId, fullTask = null) => {
    if (propOnToggleTaskBookmark) {
      return propOnToggleTaskBookmark(taskId, fullTask);
    }
    const tId = String(taskId);
    try {
      const isCurrentlyBookmarked = internalBookmarkedTaskIds.has(tId);
      setInternalBookmarkedTaskIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) next.delete(tId);
        else next.add(tId);
        return next;
      });
      await api.post("/tasks/bookmark", { taskId: tId });
    } catch (err) {
      console.error("Error toggling task bookmark:", err);
    }
  };

  useEffect(() => {
    if (!propBookmarkedTaskIds) {
      let mounted = true;
      api
        .get("/tasks/bookmarks")
        .then((res) => {
          if (mounted && res.data?.data && Array.isArray(res.data.data)) {
            setInternalBookmarkedTaskIds(
              new Set(res.data.data.map((t) => String(t._id || t.id)))
            );
          }
        })
        .catch(() => {});
      return () => {
        mounted = false;
      };
    }
  }, [propBookmarkedTaskIds]);

  // Fetch tasks and saved order
  const fetchTasks = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true);
      }
      const [tasksRes, subsRes, mentorRequestsRes, orderRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/submissions/me'),
        api.get('/mentor-requests/my-requests'),
        api.get('/tasks/order').catch(() => ({ data: { data: { taskOrder: [] } } })),
      ]);

      const backendOrder = orderRes?.data?.data?.taskOrder || [];
      setSavedOrder(backendOrder);

      if (tasksRes.data && tasksRes.data.data) {
        const mappedTasks = tasksRes.data.data.map((task) => ({
          id: task._id,
          title: task.title,
          company: (task.companyName && task.companyName.trim())
            ? task.companyName.trim()
            : (task.createdBy?.name || 'Unknown Company'),
          companyId: task.createdBy?._id || task.createdBy,
          createdBy: task.createdBy,
          role: task.roleOffered,
          category: 'Development',
          mode: task.location || 'Remote',
          paid: task.packageRange !== 'Unpaid',
          deadline: new Date(task.lastDateToSubmit).toLocaleDateString(),
          deadlineTs: getTaskDeadlineTs(task),
          isExpired: isTaskExpired(task),
          lastDateToSubmit: task.lastDateToSubmit,
          tags: task.skillsRequired || [],
          perks: (task.perks && task.perks.trim())
            ? task.perks.split(',').map((p) => p.trim()).filter(Boolean)
            : [],
          description: task.description,
          instructions: task.instructions || [],
          matchScore: typeof task.matchScore === 'number' ? task.matchScore : 0,
          matchedSkills: Array.isArray(task.matchedSkills) ? task.matchedSkills : [],
          matchStrength: task.matchStrength || 'none',
          matchReason: task.matchReason || '',
        }));

        const ordered = sortTasksByOrder(mappedTasks, backendOrder);
        setTasks(ordered);
      }

      if (subsRes.data && Array.isArray(subsRes.data.data)) {
        setUserSubmissions(subsRes.data.data);
      }

      if (mentorRequestsRes.data && Array.isArray(mentorRequestsRes.data.data)) {
        setMentorRequests(mentorRequestsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [sortTasksByOrder]);

  // Initial fetch
  useEffect(() => {
    fetchTasks(false);
  }, [fetchTasks]);

  // Smart polling every 30s
  useSmartPolling(() => fetchTasks(true), {
    intervalMs: 30000,
    enabled: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pauseWhenHidden: true,
  });

  // Filter tasks (preserving the relative saved order)
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const taskId = task.id || task._id;
      const sub = userSubmissions.find(
        (s) => String(s.taskId?._id || s.taskId) === String(taskId)
      );

      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
      const matchesMode = selectedMode === 'All' || task.mode === selectedMode;

      const progressStatus = getTaskProgressStatus(task, sub);
      const matchesProgress = selectedProgress === 'all' || progressStatus === selectedProgress;

      return matchesSearch && matchesCategory && matchesMode && matchesProgress;
    });
  }, [tasks, userSubmissions, searchQuery, selectedCategory, selectedMode, selectedProgress, getTaskProgressStatus]);

  // Drag and drop reordering logic
  const reorderTasksInList = useCallback((fromTaskId, toTaskId) => {
    if (!fromTaskId || !toTaskId || fromTaskId === toTaskId) return;

    setTasks((prevTasks) => {
      const fromIndex = prevTasks.findIndex(
        (t) => String(t.id || t._id) === String(fromTaskId)
      );
      const toIndex = prevTasks.findIndex(
        (t) => String(t.id || t._id) === String(toTaskId)
      );

      if (fromIndex === -1 || toIndex === -1) return prevTasks;

      const fromTask = prevTasks[fromIndex];
      const toTask = prevTasks[toIndex];
      if (isTaskExpired(fromTask) !== isTaskExpired(toTask)) {
        // Prevent moving active tasks into expired section or vice versa
        return prevTasks;
      }

      const updated = Array.from(prevTasks);
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);

      const newOrderIds = updated.map((t) => String(t.id || t._id));
      setSavedOrder(newOrderIds);

      // Persist to backend
      api.put('/tasks/order', { taskOrder: newOrderIds }).catch((err) => {
        console.error('Failed to persist task order:', err);
      });

      return updated;
    });
  }, []);

  const handleDragStart = (e, task) => {
    const tId = String(task.id || task._id);
    setDraggedTaskId(tId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tId);
  };

  const handleDragOver = (e, task) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const tId = String(task.id || task._id);
    if (dropTargetTaskId !== tId) {
      setDropTargetTaskId(tId);
    }
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDropTargetTaskId(null);
  };

  const handleDrop = (e, targetTask) => {
    e.preventDefault();
    const sourceTaskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    const targetTaskId = String(targetTask.id || targetTask._id);

    reorderTasksInList(sourceTaskId, targetTaskId);
    setDraggedTaskId(null);
    setDropTargetTaskId(null);
  };

  // Keyboard / Touch button reordering
  const handleMoveTask = useCallback((task, direction) => {
    const tId = String(task.id || task._id);
    const visibleIndex = filteredTasks.findIndex(
      (t) => String(t.id || t._id) === tId
    );
    if (visibleIndex === -1) return;

    const targetVisibleIndex = visibleIndex + direction;
    if (targetVisibleIndex < 0 || targetVisibleIndex >= filteredTasks.length) return;

    const targetTask = filteredTasks[targetVisibleIndex];
    const targetTaskId = String(targetTask.id || targetTask._id);

    reorderTasksInList(tId, targetTaskId);
  }, [filteredTasks, reorderTasksInList]);

  // Action handlers
  const handleOpenInstructions = (task) => {
    setSelectedTaskForInstructions(task);
  };

  const handleApplyDirect = async (task) => {
    const tId = task.id || task._id;
    if (!tId) return;

    if (isTaskExpired(task)) {
      toast.error("This task's submission deadline has passed. New applications and submissions are closed.");
      return;
    }

    try {
      setApplyingTaskId(tId);
      const res = await api.post(`/submissions/apply/${tId}`);
      const newSub = res.data?.data || { taskId: tId, status: 'accepted' };

      setUserSubmissions((prev) => {
        const filtered = prev.filter(
          (s) => String(s.taskId?._id || s.taskId) !== String(tId)
        );
        return [...filtered, newSub];
      });

      toast.success('Task applied successfully! You can now submit your task solution.');
    } catch (error) {
      console.error('Error applying for task:', error);
      toast.error(
        error.response?.data?.message || 'Failed to apply for task. Please try again.'
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
        projectTitle: formData.projectTitle || '',
        repoUrl: formData.githubUrl || '',
        videoUrl: formData.videoUrl || '',
        driveUrl: formData.googleDriveUrl || '',
        additionalLinks: Array.isArray(formData.additionalLinks) ? formData.additionalLinks : [],
        message: formData.description || '',
      };

      const res = await api.post('/submissions/submit', payload);
      const updatedSub = res.data?.data || { ...payload, status: 'submitted' };

      setUserSubmissions((prev) => {
        const filtered = prev.filter(
          (s) => String(s.taskId?._id || s.taskId) !== String(taskId)
        );
        return [...filtered, updatedSub];
      });

      toast.success('Task solution submitted successfully!');
      setIsApplicationOpen(false);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Header Section - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-3.5 sm:p-4 md:p-5 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] flex items-center justify-center shrink-0">
            <Briefcase size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[#172554] tracking-tight leading-tight">
              TaskMania
            </h2>
            <p className="text-xs text-[#64748B] font-medium truncate">
              Solve real industry challenges and get hired
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 mt-3 sm:mt-3.5">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 sm:px-4 sm:py-2.5">
            <p className="text-base sm:text-xl font-black text-[#172554] tracking-tight leading-none">
              {tasks.filter((t) => !isTaskExpired(t)).length}
            </p>
            <p className="text-[10px] sm:text-xs text-[#64748B] font-semibold mt-1">
              Active Tasks
            </p>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 sm:px-4 sm:py-2.5">
            <p className="text-base sm:text-xl font-black text-[#172554] tracking-tight leading-none">
              {userSubmissions.length}
            </p>
            <p className="text-[10px] sm:text-xs text-[#64748B] font-semibold mt-1">
              Applied
            </p>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 sm:px-4 sm:py-2.5">
            <p className="text-base sm:text-xl font-black text-[#172554] tracking-tight leading-none">
              {tasks.filter((t) => t.paid).length}
            </p>
            <p className="text-[10px] sm:text-xs text-[#64748B] font-semibold mt-1">
              Paid Tasks
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2. Search and Filters - Compact */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center">
          {/* Search */}
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            <input
              type="text"
              placeholder="Search tasks, companies, or technologies..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                sessionStorage.setItem('vibe_taskmania_search', e.target.value);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/15 transition-all"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Progress Filter */}
            <div className="relative flex-1 sm:flex-none">
              <select
                aria-label="Filter by progress"
                value={selectedProgress}
                onChange={(e) => {
                  setSelectedProgress(e.target.value);
                  sessionStorage.setItem('vibe_taskmania_progress', e.target.value);
                }}
                className="w-full sm:w-auto pl-3 pr-7 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/15 transition-all appearance-none cursor-pointer"
              >
                {progressOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" size={14} />
            </div>

            {/* Category Filter */}
            <div className="relative flex-1 sm:flex-none">
              <select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  sessionStorage.setItem('vibe_taskmania_category', e.target.value);
                }}
                className="w-full sm:w-auto pl-3 pr-7 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/15 transition-all appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" size={14} />
            </div>

            {/* Mode Filter */}
            <div className="relative flex-1 sm:flex-none">
              <select
                aria-label="Filter by location mode"
                value={selectedMode}
                onChange={(e) => {
                  setSelectedMode(e.target.value);
                  sessionStorage.setItem('vibe_taskmania_mode', e.target.value);
                }}
                className="w-full sm:w-auto pl-3 pr-7 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#6D3DF5] focus:bg-white focus:ring-2 focus:ring-[#6D3DF5]/15 transition-all appearance-none cursor-pointer"
              >
                {modes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode === 'All' ? 'All Modes' : mode}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* Results Count and Reordering hint */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <span className="font-bold text-[#0F172A]">{filteredTasks.length}</span> of{" "}
              <span className="font-bold text-[#0F172A]">{tasks.length}</span> tasks
            </span>
            {savedOrder && savedOrder.length > 0 && (
              <span className="inline-flex items-center gap-1.5 ml-1">
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                  Custom priority active ({savedOrder.length} tasks)
                </span>
                <button
                  type="button"
                  onClick={handleResetToSkillsOrder}
                  className="text-[11px] font-semibold text-[#6D3DF5] hover:text-[#5B2FD6] underline underline-offset-2 transition-colors cursor-pointer"
                  title="Reset custom drag-and-drop order back to skill-based recommendation"
                >
                  Reset to Skills Match
                </button>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <GripVertical size={13} className="text-[#6D3DF5]" />
            <span>Drag card handles or use arrows to prioritize</span>
          </div>
        </div>
      </div>

      {/* 3. Tasks Grid with Drag-and-Drop Reordering */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredTasks.map((task) => {
            const taskId = String(task.id || task._id);
            const sub = userSubmissions.find(
              (s) => String(s.taskId?._id || s.taskId) === taskId
            );
            const isAccepted = Boolean(sub && sub.status !== "rejected");
            const isSolutionSubmitted = Boolean(
              sub &&
              (sub.repoUrl ||
                sub.videoUrl ||
                sub.driveUrl ||
                sub.projectTitle ||
                ["submitted", "reviewed", "shortlisted", "interview_scheduled", "hired"].includes(
                  String(sub.status || "").toLowerCase()
                ))
            );
            const isApplying = applyingTaskId === taskId;

            const isBookmarked =
              bookmarkedTaskIds.has(taskId) ||
              bookmarkedTaskIds.has(task.id);

            const isDragging = draggedTaskId === taskId;
            const isDropTarget = dropTargetTaskId === taskId && draggedTaskId !== taskId;

            return (
              <TaskCard
                key={taskId}
                task={task}
                isBookmarked={isBookmarked}
                onToggleBookmark={() => handleToggleTaskBookmark(taskId, task)}
                isAccepted={isAccepted}
                isSolutionSubmitted={isSolutionSubmitted}
                isApplying={isApplying}
                mentorRequest={mentorRequests.find(
                  (req) => String(req.task?._id || req.task) === taskId
                )}
                onOpenInstructions={handleOpenInstructions}
                onApplyDirect={handleApplyDirect}
                onOpenSubmitTask={handleOpenSubmitTask}
                onOpenMentorRequest={handleOpenMentorRequest}
                // Drag & Reorder
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                isDragging={isDragging}
                isDropTarget={isDropTarget}
                onMoveTask={handleMoveTask}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] border border-[#E1E8F2] flex items-center justify-center mx-auto mb-3">
            <Search size={24} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#172554] mb-1">No tasks found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            No challenges match your current search and filter criteria. Try adjusting or clearing your filters.
          </p>
          {(searchQuery || selectedProgress !== 'all' || selectedCategory !== 'All' || selectedMode !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedProgress('all');
                setSelectedCategory('All');
                setSelectedMode('All');
                sessionStorage.removeItem('vibe_taskmania_search');
                sessionStorage.removeItem('vibe_taskmania_progress');
                sessionStorage.removeItem('vibe_taskmania_category');
                sessionStorage.removeItem('vibe_taskmania_mode');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-[#6D3DF5] bg-[#F3EEFF] hover:bg-[#EDE9FE] rounded-xl transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedTaskForInstructions && (() => {
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
            ["submitted", "reviewed", "shortlisted", "interview_scheduled", "hired"].includes(
              String(sub.status || "").toLowerCase()
            ))
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
    </div>
  );
};

export default TaskManiaView;
