import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChevronDown,
  Briefcase,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Plus,
  Layers,
  TrendingUp,
  UserCheck,
  UserX,
  Video,
  Eye,
  FileCheck,
  Check,
} from "lucide-react";
import ChartErrorBoundary from "../ChartErrorBoundary";

// ---------------------------------------------------------------------------
// Helper: calculate days remaining from today
// ---------------------------------------------------------------------------
const getDaysFromToday = (targetDate) => {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetMidnight = new Date(target);
  targetMidnight.setHours(0, 0, 0, 0);

  const diffMs = targetMidnight.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

// ---------------------------------------------------------------------------
// Helper: categorize an applicant into an exact pipeline stage (mutually exclusive)
// ---------------------------------------------------------------------------
export const classifyApplicantStage = (app) => {
  const status = String(app.rawStatus || app.status || "").toLowerCase().trim();

  // Stage 5: Final Decision (Accepted / Rejected)
  if (["hired", "selected", "approved"].includes(status)) {
    return "accepted";
  }
  if (status === "rejected") {
    return "rejected";
  }

  // Stage 4: Interview Scheduled
  if (status === "interview_scheduled" || status === "interviewscheduled") {
    return "interview_scheduled";
  }

  // Stage 3: Submission Review (Under review or shortlisted, awaiting interview)
  if (status === "reviewed" || status === "shortlisted") {
    return "reviewed";
  }

  // Stage 2: Work Submitted (Work has been submitted, awaiting review)
  if (status === "submitted" || app.hasWorkSubmitted) {
    return "work_submitted";
  }

  // Stage 1: Applied (Registered / Accepted task, awaiting work submission)
  return "applied";
};

// ---------------------------------------------------------------------------
// Subcomponent: StatCard
// ---------------------------------------------------------------------------
const StatCard = ({ icon: Icon, label, value, subtitle, iconBg, iconColor }) => (
  <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full min-w-0">
    <div>
      <div className="flex items-center justify-between gap-1.5 mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        <span className="text-[10px] sm:text-[11px] font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full truncate max-w-[90px] sm:max-w-[140px]">
          {subtitle}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mb-1 tracking-tight">
        {value}
      </div>
    </div>
    <p className="text-xs sm:text-sm font-medium text-[#64748B] leading-tight mt-0.5 break-words">
      {label}
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Main Component: Overview
// ---------------------------------------------------------------------------
export const Overview = ({
  tasks = [],
  applicants = [],
  user = null,
  setActiveTab,
  onReviewTask,
  onCreateTask,
  onViewTaskDetails,
}) => {
  const [chartRange, setChartRange] = useState("7d");
  const [overviewMode, setOverviewMode] = useState("overall");

  // -------------------------------------------------------------------------
  // 1. Metric Calculations
  // -------------------------------------------------------------------------
  const totalTasks = tasks.length;

  const activeTasks = useMemo(() => {
    return tasks.filter((t) => {
      const deadline = t.deadlineRaw || t.lastDateToSubmit;
      if (!deadline) return t.status === "Active";
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) return t.status === "Active";
      return deadlineDate.setHours(23, 59, 59, 999) >= Date.now();
    });
  }, [tasks]);

  const totalSubmissions = applicants.length;

  const { hiredCount, rejectedCount, totalDecisions, acceptanceRate } = useMemo(() => {
    let hired = 0;
    let rejected = 0;

    applicants.forEach((a) => {
      const s = String(a.rawStatus || a.status || "").toLowerCase().trim();
      if (["hired", "selected", "approved"].includes(s)) hired++;
      else if (s === "rejected") rejected++;
    });

    const decisions = hired + rejected;
    const rate = decisions > 0 ? Math.round((hired / decisions) * 100) : 0;

    return {
      hiredCount: hired,
      rejectedCount: rejected,
      totalDecisions: decisions,
      acceptanceRate: rate,
    };
  }, [applicants]);

  // -------------------------------------------------------------------------
  // 2. Pipeline Stages Classification
  // -------------------------------------------------------------------------
  const pipelineGroups = useMemo(() => {
    const groups = {
      applied: [],
      work_submitted: [],
      reviewed: [],
      interview_scheduled: [],
      accepted: [],
      rejected: [],
    };

    applicants.forEach((app) => {
      const stage = classifyApplicantStage(app);
      if (groups[stage]) {
        groups[stage].push(app);
      }
    });

    return groups;
  }, [applicants]);

  // -------------------------------------------------------------------------
  // 3. Needs Your Attention Items
  // -------------------------------------------------------------------------
  const attentionItems = useMemo(() => {
    const items = [];

    // A. Submissions awaiting initial review (grouped by task)
    if (pipelineGroups.work_submitted.length > 0) {
      const taskMap = {};
      pipelineGroups.work_submitted.forEach((app) => {
        const tid = String(app.taskId || "unknown");
        if (!taskMap[tid]) {
          taskMap[tid] = {
            taskId: app.taskId,
            taskTitle: app.taskTitle || "Task Challenge",
            count: 0,
          };
        }
        taskMap[tid].count++;
      });

      Object.values(taskMap).forEach((group) => {
        items.push({
          id: `review-${group.taskId}`,
          type: "review",
          badge: "Review Needed",
          badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
          title: "Submissions awaiting review",
          taskTitle: group.taskTitle,
          countText: `${group.count} submission${group.count === 1 ? "" : "s"} waiting`,
          actionLabel: "Review Submissions",
          action: () => {
            if (onReviewTask && group.taskId) {
              onReviewTask(group.taskId);
            } else if (setActiveTab) {
              setActiveTab("tasks");
            }
          },
        });
      });
    }

    // B. Candidates reviewed / shortlisted, ready for interview scheduling
    if (pipelineGroups.reviewed.length > 0) {
      const taskMap = {};
      pipelineGroups.reviewed.forEach((app) => {
        const tid = String(app.taskId || "unknown");
        if (!taskMap[tid]) {
          taskMap[tid] = {
            taskId: app.taskId,
            taskTitle: app.taskTitle || "Task Challenge",
            count: 0,
          };
        }
        taskMap[tid].count++;
      });

      Object.values(taskMap).forEach((group) => {
        items.push({
          id: `interview-ready-${group.taskId}`,
          type: "schedule",
          badge: "Action Required",
          badgeColor: "bg-purple-50 text-[#6D3DF5] border-purple-200",
          title: "Candidates ready for interview",
          taskTitle: group.taskTitle,
          countText: `${group.count} candidate${group.count === 1 ? "" : "s"} shortlisted`,
          actionLabel: "Schedule Interview",
          action: () => {
            if (onReviewTask && group.taskId) {
              onReviewTask(group.taskId);
            } else if (setActiveTab) {
              setActiveTab("tasks");
            }
          },
        });
      });
    }

    // C. Interviews scheduled requiring attention / final decision
    if (pipelineGroups.interview_scheduled.length > 0) {
      pipelineGroups.interview_scheduled.slice(0, 3).forEach((app) => {
        const dateText = app.interviewDate
          ? `${app.interviewDate}${app.interviewTime ? ` at ${app.interviewTime}` : ""}`
          : "Scheduled";

        items.push({
          id: `interview-active-${app.id}`,
          type: "interview",
          badge: "Interview Scheduled",
          badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
          title: `Interview with ${app.name}`,
          taskTitle: app.taskTitle || "Hiring Task",
          countText: dateText,
          actionLabel: "Evaluate Candidate",
          action: () => {
            if (onReviewTask && app.taskId) {
              onReviewTask(app.taskId);
            } else if (setActiveTab) {
              setActiveTab("tasks");
            }
          },
        });
      });
    }

    // D. Active tasks closing within 5 days
    activeTasks.forEach((task) => {
      const days = getDaysFromToday(task.deadlineRaw || task.lastDateToSubmit);
      if (days !== null && days >= 0 && days <= 5) {
        items.push({
          id: `task-closing-${task.id}`,
          type: "deadline",
          badge: days === 0 ? "Closes Today" : "Deadline Approaching",
          badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
          title: "Submission deadline closing soon",
          taskTitle: task.title,
          countText: days === 0 ? "Closes tonight at 11:59 PM" : `${days} day${days === 1 ? "" : "s"} remaining`,
          actionLabel: "View Task",
          action: () => {
            if (onViewTaskDetails && task.id) {
              onViewTaskDetails(task.id);
            } else if (setActiveTab) {
              setActiveTab("tasks");
            }
          },
        });
      }
    });

    return items;
  }, [pipelineGroups, activeTasks, onReviewTask, onViewTaskDetails, setActiveTab]);

  // -------------------------------------------------------------------------
  // 4. Student Submissions Overview Chart Data
  // -------------------------------------------------------------------------
  const chartData = useMemo(() => {
    const daysCount = chartRange === "7d" ? 7 : chartRange === "14d" ? 14 : 30;
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: daysCount > 14 ? "numeric" : "short",
      });

      result.push({
        date: dateStr,
        name: label,
        submissions: 0,
      });
    }

    // Tally real submissions
    applicants.forEach((app) => {
      if (!app.submissionDate) return;
      const subDate = new Date(app.submissionDate).toISOString().split("T")[0];
      const entry = result.find((r) => r.date === subDate);
      if (entry) {
        entry.submissions++;
      }
    });

    return result;
  }, [applicants, chartRange]);

  const totalSubmissionsInRange = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.submissions, 0);
  }, [chartData]);

  const branchChartData = useMemo(() => {
    const daysCount = chartRange === "7d" ? 7 : chartRange === "14d" ? 14 : 30;
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (daysCount - 1));

    const branchCounts = {};

    applicants.forEach((app) => {
      if (!app.submissionDate) return;
      const subDate = new Date(app.submissionDate);
      if (isNaN(subDate.getTime()) || subDate < cutoff) return;

      const raw = app.branch;
      const branchName =
        typeof raw === "string" && raw.trim() ? raw.trim() : "General";

      branchCounts[branchName] = (branchCounts[branchName] || 0) + 1;
    });

    return Object.entries(branchCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [applicants, chartRange]);

  const totalBranchSubmissionsInRange = useMemo(() => {
    return branchChartData.reduce((sum, item) => sum + item.count, 0);
  }, [branchChartData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 w-full max-w-full">
      {/* ===================================================================== */}
      {/* 1. Four Statistic Cards (Top, preserved order)                       */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <StatCard
          icon={Layers}
          label="Total Tasks Posted"
          value={totalTasks}
          subtitle={`${totalTasks} challenges`}
          iconBg="bg-[#F3EEFF]"
          iconColor="text-[#6D3DF5]"
        />
        <StatCard
          icon={Clock}
          label="Active Tasks"
          value={activeTasks.length}
          subtitle={`${activeTasks.length} accepting work`}
          iconBg="bg-[#EFF6FF]"
          iconColor="text-[#2563EB]"
        />
        <StatCard
          icon={Users}
          label="Total Submissions"
          value={totalSubmissions}
          subtitle={`${pipelineGroups.work_submitted.length + pipelineGroups.reviewed.length + pipelineGroups.interview_scheduled.length + pipelineGroups.accepted.length + pipelineGroups.rejected.length} solutions received`}
          iconBg="bg-[#FAF5FF]"
          iconColor="text-[#8B5CF6]"
        />
        <StatCard
          icon={CheckCircle2}
          label="Acceptance Rate"
          value={`${acceptanceRate}%`}
          subtitle={totalDecisions > 0 ? `${hiredCount} of ${totalDecisions} decided` : "0 decisions yet"}
          iconBg="bg-[#ECFDF5]"
          iconColor="text-[#059669]"
        />
      </div>

      {/* ===================================================================== */}
      {/* 3. Section One — Needs Your Attention                                */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#F1F5F9] gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
              Needs Your Attention
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Review pending work and keep your hiring process moving.
            </p>
          </div>
          {attentionItems.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 self-start sm:self-auto">
              <AlertCircle size={13} />
              {attentionItems.length} action{attentionItems.length === 1 ? "" : "s"} required
            </span>
          )}
        </div>

        {attentionItems.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] mb-1">
              You're all caught up. No pending actions right now.
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              All student submissions have been reviewed and your hiring workflow is currently up to date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#E2E8F0] p-4 bg-[#FAFAFC] hover:bg-white hover:border-[#CBD5E1] transition-all flex flex-col justify-between shadow-2xs group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-[#64748B]">
                      {item.countText}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0F172A] leading-snug group-hover:text-[#6D3DF5] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-1">
                    For: <span className="font-medium text-[#334155]">{item.taskTitle}</span>
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-[#F1F5F9] flex items-center justify-end">
                  <button
                    onClick={item.action}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#6D3DF5] hover:bg-[#F3EEFF] text-xs font-bold text-[#0F172A] hover:text-[#6D3DF5] transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 4. Section Two — My Active Tasks                                     */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#F1F5F9] gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
              My Active Tasks
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Track your open opportunities and student participation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => (onCreateTask ? onCreateTask() : setActiveTab && setActiveTab("tasks"))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Task</span>
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab("tasks")}
              className="text-xs font-semibold text-[#6D3DF5] hover:text-[#5B2FD6] flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[#F3EEFF] transition-colors cursor-pointer"
            >
              <span>View All Tasks ({totalTasks})</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {activeTasks.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] text-[#6D3DF5] border border-[#E9D5FF] flex items-center justify-center mx-auto mb-3">
              <Briefcase size={22} />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              No Active Tasks
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mb-5 leading-relaxed">
              You don't have any challenges currently open for submission. Create a task to invite students to apply and submit solutions.
            </p>
            <button
              onClick={() => (onCreateTask ? onCreateTask() : setActiveTab && setActiveTab("tasks"))}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Task Challenge</span>
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Task Title & Role</th>
                    <th className="py-3.5 px-4">Type / Location</th>
                    <th className="py-3.5 px-4 text-center">Applied</th>
                    <th className="py-3.5 px-4 text-center">Submitted Work</th>
                    <th className="py-3.5 px-4">Deadline</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-sm">
                  {activeTasks.map((task) => {
                    const daysRemaining = getDaysFromToday(task.deadlineRaw || task.lastDateToSubmit);
                    return (
                      <tr key={task.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#0F172A] hover:text-[#6D3DF5] transition-colors line-clamp-1">
                            {task.title}
                          </div>
                          <div className="text-xs text-[#64748B] mt-0.5 line-clamp-1">
                            {task.role || "Task Challenge"} · {task.payment || "Paid"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#F1F5F9] text-[#475569]">
                            {task.location || task.type || "Remote"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-[#0F172A]">
                            {task.applicantsCount || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-[#6D3DF5] bg-[#F3EEFF] px-2.5 py-0.5 rounded-full text-xs">
                            {task.submissionsCount || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-semibold text-[#0F172A]">
                            {task.deadline}
                          </div>
                          {daysRemaining !== null && (
                            <span
                              className={`text-[11px] font-medium ${
                                daysRemaining <= 3
                                  ? "text-rose-600"
                                  : daysRemaining <= 7
                                  ? "text-amber-600"
                                  : "text-[#64748B]"
                              }`}
                            >
                              {daysRemaining === 0
                                ? "Closes today"
                                : daysRemaining === 1
                                ? "1 day left"
                                : `${daysRemaining} days left`}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                if (onReviewTask) onReviewTask(task.id);
                                else if (setActiveTab) setActiveTab("tasks");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                              title="Review Submissions"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => {
                                if (onViewTaskDetails) onViewTaskDetails(task.id);
                                else if (setActiveTab) setActiveTab("tasks");
                              }}
                              className="p-1.5 rounded-lg border border-[#CBD5E1] hover:bg-white text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Task Cards View */}
            <div className="md:hidden space-y-3.5">
              {activeTasks.map((task) => {
                const daysRemaining = getDaysFromToday(task.deadlineRaw || task.lastDateToSubmit);
                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-[#E2E8F0] bg-[#FAFAFC] space-y-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-[#0F172A] leading-tight">
                          {task.title}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] shrink-0">
                          {task.location || "Remote"}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B]">
                        {task.role} · {task.payment}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-white border border-[#F1F5F9] text-center text-xs">
                      <div>
                        <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Applied</div>
                        <div className="font-bold text-[#0F172A] mt-0.5">{task.applicantsCount || 0}</div>
                      </div>
                      <div className="border-x border-[#F1F5F9]">
                        <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Submitted</div>
                        <div className="font-bold text-[#6D3DF5] mt-0.5">{task.submissionsCount || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Deadline</div>
                        <div className="font-semibold text-[#0F172A] mt-0.5 text-[11px] truncate">
                          {daysRemaining !== null
                            ? daysRemaining === 0
                              ? "Today"
                              : `${daysRemaining}d left`
                            : task.deadline}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (onReviewTask) onReviewTask(task.id);
                          else if (setActiveTab) setActiveTab("tasks");
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#6D3DF5] text-white text-xs font-bold text-center cursor-pointer"
                      >
                        Review Submissions
                      </button>
                      <button
                        onClick={() => {
                          if (onViewTaskDetails) onViewTaskDetails(task.id);
                          else if (setActiveTab) setActiveTab("tasks");
                        }}
                        className="p-2 rounded-lg border border-[#CBD5E1] bg-white text-[#475569] cursor-pointer"
                        title="View Task Details"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. Student Submissions Overview Chart                                */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-6 border-b border-[#F1F5F9] gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
              Student Submissions Overview
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              {overviewMode === "overall"
                ? "Daily student solution submissions recorded across your challenges."
                : "Student submissions distribution grouped by department and branch."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* Overview Mode Dropdown */}
            <div className="relative">
              <select
                aria-label="Submissions Overview Mode"
                value={overviewMode}
                onChange={(e) => setOverviewMode(e.target.value)}
                className="appearance-none bg-white text-xs font-bold text-[#0F172A] border border-[#CBD5E1] hover:border-[#6D3DF5] rounded-xl pl-3.5 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#6D3DF5]/20 focus:border-[#6D3DF5] cursor-pointer shadow-2xs transition-all"
              >
                <option value="overall">Overall Submissions Overview</option>
                <option value="branch">Branch-wise Submissions Overview</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
              />
            </div>

            {/* Date Range Controls */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setChartRange("7d")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartRange === "7d"
                    ? "bg-white text-[#6D3DF5] shadow-2xs border border-[#E2E8F0]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setChartRange("14d")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartRange === "14d"
                    ? "bg-white text-[#6D3DF5] shadow-2xs border border-[#E2E8F0]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                14 Days
              </button>
              <button
                type="button"
                onClick={() => setChartRange("30d")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartRange === "30d"
                    ? "bg-white text-[#6D3DF5] shadow-2xs border border-[#E2E8F0]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
        </div>

        <div className="w-full h-72 sm:h-80 relative">
          <ChartErrorBoundary>
            {overviewMode === "overall" ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="submissionsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6D3DF5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6D3DF5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    allowDecimals={false}
                    dx={-5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "#0F172A", fontWeight: "bold" }}
                    labelStyle={{ color: "#64748B", marginBottom: "4px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    name="Submissions Received"
                    stroke="#6D3DF5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#submissionsAreaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={branchChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="branchBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6D3DF5" stopOpacity={1} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    tickFormatter={(val) => (val && val.length > 14 ? `${val.substring(0, 12)}…` : val)}
                    dy={10}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    allowDecimals={false}
                    dx={-5}
                  />
                  <Tooltip
                    cursor={{ fill: "#F8FAFC" }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-md text-xs">
                          <p className="font-bold text-[#0F172A]">{data.name}</p>
                          <p className="text-[#6D3DF5] font-semibold mt-1">
                            {data.count} submission{data.count === 1 ? "" : "s"}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Submissions"
                    fill="url(#branchBarGradient)"
                    radius={[6, 6, 0, 0]}
                    barSize={Math.min(48, Math.max(20, Math.floor(400 / (branchChartData.length || 1))))}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartErrorBoundary>

          {overviewMode === "overall" && totalSubmissionsInRange === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-xs px-4 py-2 rounded-xl border border-[#E2E8F0] shadow-xs text-center">
                <p className="text-xs font-semibold text-[#64748B]">
                  No student submissions recorded in this time range.
                </p>
              </div>
            </div>
          )}

          {overviewMode === "branch" && totalBranchSubmissionsInRange === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-xs px-4 py-2 rounded-xl border border-[#E2E8F0] shadow-xs text-center">
                <p className="text-xs font-semibold text-[#64748B]">
                  No branch submissions recorded in this time range.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. Section Three — Hiring Pipeline                                   */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#F1F5F9] gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Hiring Pipeline
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3EEFF] text-[#6D3DF5]">
                {applicants.length} Total Candidates
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Track student candidates through the VIBE hiring workflow.
            </p>
          </div>
        </div>

        {/* Desktop Connected Stepper Layout */}
        <div className="hidden lg:grid grid-cols-5 gap-3 items-stretch">
          {/* Stage 1: Applied */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between relative group hover:border-[#CBD5E1] transition-all">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#475569] mb-2">
                <span>1. Applied</span>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A] mb-1">
                {pipelineGroups.applied.length}
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Registered students awaiting work submission
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setActiveTab && setActiveTab("tasks")}
                className="text-[11px] font-bold text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 cursor-pointer"
              >
                <span>View Applicants</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Stage 2: Work Submitted */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between relative group hover:border-blue-300 transition-all">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-blue-700 mb-2">
                <span>2. Work Submitted</span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A] mb-1">
                {pipelineGroups.work_submitted.length}
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Submissions received awaiting initial review
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-blue-100">
              <button
                onClick={() => setActiveTab && setActiveTab("tasks")}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Review Work</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Stage 3: Submission Review */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 flex flex-col justify-between relative group hover:border-purple-300 transition-all">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#6D3DF5] mb-2">
                <span>3. Review Completed</span>
                <span className="w-2 h-2 rounded-full bg-[#6D3DF5]" />
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A] mb-1">
                {pipelineGroups.reviewed.length}
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Shortlisted submissions ready for interview
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-purple-100">
              <button
                onClick={() => setActiveTab && setActiveTab("tasks")}
                className="text-[11px] font-bold text-[#6D3DF5] hover:text-[#5B2FD6] flex items-center gap-1 cursor-pointer"
              >
                <span>Schedule Interview</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Stage 4: Interview Scheduled */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between relative group hover:border-amber-300 transition-all">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-2">
                <span>4. Interview</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A] mb-1">
                {pipelineGroups.interview_scheduled.length}
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Interviews scheduled and in progress
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-amber-100">
              <button
                onClick={() => setActiveTab && setActiveTab("tasks")}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Interviews</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Stage 5: Final Decision (Accepted / Rejected split card) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-[#FAFAFC] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] mb-2">
                <span>5. Final Decision</span>
                <span className="text-[10px] font-bold text-[#64748B]">{totalDecisions} total</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                    <UserCheck size={12} /> Accepted
                  </div>
                  <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
                    {hiredCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-center">
                  <div className="text-xs font-bold text-rose-800 flex items-center justify-center gap-1">
                    <UserX size={12} /> Rejected
                  </div>
                  <div className="text-xl font-extrabold text-rose-700 mt-0.5">
                    {rejectedCount}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setActiveTab && setActiveTab("tasks")}
                className="text-[11px] font-bold text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 cursor-pointer"
              >
                <span>View Decisions</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Responsive Pipeline Layout */}
        <div className="lg:hidden space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="text-[11px] font-bold text-[#64748B]">1. Applied</div>
              <div className="text-xl font-extrabold text-[#0F172A] mt-1">
                {pipelineGroups.applied.length}
              </div>
              <div className="text-[10px] text-[#94A3B8] mt-0.5">Awaiting work</div>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
              <div className="text-[11px] font-bold text-blue-700">2. Submitted</div>
              <div className="text-xl font-extrabold text-[#0F172A] mt-1">
                {pipelineGroups.work_submitted.length}
              </div>
              <div className="text-[10px] text-blue-600/80 mt-0.5">Needs review</div>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50">
              <div className="text-[11px] font-bold text-[#6D3DF5]">3. Reviewed</div>
              <div className="text-xl font-extrabold text-[#0F172A] mt-1">
                {pipelineGroups.reviewed.length}
              </div>
              <div className="text-[10px] text-purple-600/80 mt-0.5">Shortlisted</div>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
              <div className="text-[11px] font-bold text-amber-800">4. Interview</div>
              <div className="text-xl font-extrabold text-[#0F172A] mt-1">
                {pipelineGroups.interview_scheduled.length}
              </div>
              <div className="text-[10px] text-amber-700/80 mt-0.5">Scheduled</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
            <div className="text-xs font-bold text-[#0F172A] mb-2.5">
              5. Final Decisions ({totalDecisions} total decided)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-800">Accepted</div>
                  <div className="text-[11px] text-emerald-600">Hired candidates</div>
                </div>
                <div className="text-xl font-extrabold text-emerald-700">{hiredCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-800">Rejected</div>
                  <div className="text-[11px] text-rose-600">Not selected</div>
                </div>
                <div className="text-xl font-extrabold text-rose-700">{rejectedCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
