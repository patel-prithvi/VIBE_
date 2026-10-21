import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  FileText,
  UserPlus,
  Lock,
  ExternalLink,
  ChevronRight,
  Clock,
  Users,
  Share2,
  Check,
  Award,
  Download,
  Paperclip,
  FileSpreadsheet,
  FileArchive,
  Image,
  ShieldCheck,
  Video,
} from "lucide-react";
import Avatar from "../components/shared/Avatar";
import { auth } from "../utils/auth";
import api from "../services/api";
import { useToast } from "../components/Toast";
import { FacultyTopHeader } from "../components/faculty/FacultyTopHeader";
import { ApplicationFormModal } from "../components/TaskMania/ApplicationFormModal";
import { MentorRequestModal } from "../components/TaskMania/MentorRequestModal";

export const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = auth.getCurrentUser();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [acceptingTask, setAcceptingTask] = useState(false);
  const [mentorRequest, setMentorRequest] = useState(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isMentorRequestOpen, setIsMentorRequestOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const rawRole = (currentUser?.role || currentUser?.accountType || "").trim().toLowerCase();
  const isStudent = rawRole === "student";
  const isFaculty = rawRole === "faculty";
  const isIndustry = rawRole === "industry" || rawRole === "industry expert";

  useEffect(() => {
    let mounted = true;

    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/tasks/${taskId}`);
        if (!mounted) return;

        if (res.data && res.data.data) {
          const raw = res.data.data;
          const mapped = {
            ...raw,
            id: raw._id,
            company: raw.companyName || raw.createdBy?.name || "Company Partner",
            companyId: raw.createdBy?._id || raw.createdBy,
            role: raw.roleOffered,
            category: raw.category || "Development",
            mode: raw.location || "Remote",
            paid: raw.packageRange !== "Unpaid",
            deadline: new Date(raw.lastDateToSubmit).toLocaleDateString(),
            deadlineTs: new Date(raw.lastDateToSubmit).getTime(),
            tags: raw.skillsRequired || [],
            perksList: raw.perks && typeof raw.perks === "string"
              ? raw.perks.split(",").map((p) => p.trim()).filter(Boolean)
              : Array.isArray(raw.perks)
              ? raw.perks
              : [],
            instructions: Array.isArray(raw.instructions) ? raw.instructions : [],
            materials: Array.isArray(raw.materials) ? raw.materials : [],
            isMaterialsUnlocked: Boolean(raw.isMaterialsUnlocked),
          };
          setTask(mapped);
        } else {
          setError("Task not found or has been removed.");
        }
      } catch (err) {
        console.error("Error fetching task details:", err);
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Could not load task details. This task may have been removed or is unavailable."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (taskId) {
      fetchTaskDetails();
    }

    // Check if student has already applied
    if (isStudent && taskId) {
      (async () => {
        try {
          const [subsRes, mentorRes] = await Promise.all([
            api.get("/submissions/me"),
            api.get("/mentor-requests/my-requests"),
          ]);

          if (mounted && subsRes.data?.data) {
            const foundSub = subsRes.data.data.find(
              (s) => String(s.taskId?._id || s.taskId) === String(taskId)
            );
            if (foundSub) {
              setHasApplied(true);
              setApplicationStatus(foundSub.status || "applied");
              setExistingSubmission(foundSub);
            }
          }

          if (mounted && mentorRes.data?.data) {
            const foundReq = mentorRes.data.data.find(
              (r) => String(r.task?._id || r.task) === String(taskId)
            );
            if (foundReq) {
              setMentorRequest(foundReq);
            }
          }
        } catch (err) {
          console.warn("Could not check student task state:", err);
        }
      })();
    }

    return () => {
      mounted = false;
    };
  }, [taskId, isStudent]);

  const handleLogout = async () => {
    await auth.logout();
    navigate("/");
  };

  const getDashboardHome = () => {
    if (isFaculty) return "/dashboard/faculty";
    if (isIndustry) return "/dashboard/industry";
    return "/dashboard/student";
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Task link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAcceptTask = async () => {
    if (!taskId) return;
    try {
      setAcceptingTask(true);
      const res = await api.post(`/submissions/apply/${taskId}`);
      const subData = res.data?.data;
      setHasApplied(true);
      setApplicationStatus(subData?.status || "accepted");
      setExistingSubmission(subData);
      setTask((prev) => (prev ? { ...prev, isMaterialsUnlocked: true } : prev));
      toast.success("Task accepted! Materials have been unlocked.");
    } catch (err) {
      console.error("Error accepting task:", err);
      toast.error(
        err.response?.data?.message || "Failed to accept task. Please try again."
      );
    } finally {
      setAcceptingTask(false);
    }
  };

  const handleSubmitApplication = async (tId, formData) => {
    try {
      const payload = {
        taskId: tId || taskId,
        projectTitle: formData.projectTitle || "",
        repoUrl: formData.githubUrl || "",
        videoUrl: formData.videoUrl || "",
        driveUrl: formData.googleDriveUrl || "",
        additionalLinks: Array.isArray(formData.additionalLinks)
          ? formData.additionalLinks
          : [],
        message: formData.description || "",
      };

      const res = await api.post("/submissions/submit", payload);
      const subData = res.data?.data;
      setHasApplied(true);
      setApplicationStatus("submitted");
      setExistingSubmission(subData || payload);
      toast.success("Solution submitted successfully!");
      setIsApplicationOpen(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error(error.response?.data?.message || "Failed to submit application. Please try again.");
    }
  };

  const isClosed = task && typeof task.deadlineTs === "number" && Date.now() > task.deadlineTs;
  const isTaskCreator =
    task &&
    currentUser &&
    String(task.createdBy?._id || task.createdBy) === String(currentUser._id || currentUser.id);

  const hasAcceptedTask = Boolean(
    hasApplied && applicationStatus && applicationStatus !== "rejected"
  );
  const canDownloadMaterials = Boolean(
    isTaskCreator ||
    hasAcceptedTask ||
    task?.isMaterialsUnlocked ||
    currentUser?.isAdmin ||
    currentUser?.accountType === "admin"
  );
  const isSolutionSubmitted = Boolean(
    existingSubmission?.repoUrl ||
    existingSubmission?.videoUrl ||
    existingSubmission?.driveUrl ||
    existingSubmission?.projectTitle ||
    ["submitted", "reviewed", "shortlisted", "interview_scheduled", "hired"].includes(
      String(applicationStatus || "").toLowerCase()
    )
  );

  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const getFileIcon = (nameOrFormat) => {
    const ext = (nameOrFormat || "").toLowerCase().split(".").pop();
    if (["png", "jpg", "jpeg", "svg", "webp", "gif"].includes(ext)) {
      return <Image size={18} className="text-violet-600" />;
    }
    if (["csv", "xlsx", "xls"].includes(ext)) {
      return <FileSpreadsheet size={18} className="text-emerald-600" />;
    }
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
      return <FileArchive size={18} className="text-amber-600" />;
    }
    if (["pdf"].includes(ext)) {
      return <FileText size={18} className="text-rose-600" />;
    }
    return <FileText size={18} className="text-blue-600" />;
  };

  const handleDownloadMaterialsZip = async () => {
    if (!task?.id && !task?._id) return;
    const tId = task.id || task._id;
    setDownloadingZip(true);
    try {
      const response = await api.get(`/tasks/${tId}/download-materials`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/zip" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const sanitizedTitle = (task.title || "task").replace(/[^a-zA-Z0-9_-]/g, "_");
      link.setAttribute("download", `${sanitizedTitle}_materials.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Materials ZIP downloaded successfully!");
    } catch (err) {
      console.error("Failed to download task materials zip:", err);
      toast.error(
        err.response?.data?.message || "Failed to download materials archive. Please try again."
      );
    } finally {
      setDownloadingZip(false);
    }
  };

  const companyId = task?.createdBy?._id || task?.createdBy;
  const companyUser = task?.createdBy && typeof task.createdBy === "object" ? task.createdBy : null;
  const companyAvatar = companyUser?.Profile?.avatar || companyUser?.ImageUrl;
  const companyName = task?.companyName || companyUser?.name || "Industry Partner";

  const getMeetingUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#6D3DF5] selection:text-white">
      {/* 1. Header */}
      <FacultyTopHeader
        user={currentUser}
        onLogout={handleLogout}
        onNavigate={() => navigate(getDashboardHome())}
        onSearch={() => {}}
        isSidebarCollapsed={true}
        onToggleSidebar={() => {}}
      />

      {/* 2. Main Content */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {/* Back and Navigation Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate(getDashboardHome());
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-xs"
              title="Share task"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl border border-[#E1E8F2] p-16 flex flex-col items-center justify-center shadow-xs">
            <Loader2 className="w-10 h-10 text-[#6D3DF5] animate-spin mb-4" />
            <p className="text-sm font-bold text-[#64748B]">Loading task details...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && (error || !task) && (
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-red-100 p-8 text-center shadow-xs mt-8">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">Task Unavailable</h3>
            <p className="text-xs text-[#64748B] mb-6 leading-relaxed">
              {error || "The task you requested could not be found or has been removed."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
            >
              Return to Previous Page
            </button>
          </div>
        )}

        {/* Task Details Content */}
        {!loading && task && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Hero Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E1E8F2] shadow-xs relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D3DF5] bg-[#F3EEFF] px-3 py-1 rounded-full border border-[#E9E1FF]">
                      {task.roleOffered || "Challenge"}
                    </span>
                    <span className="text-[11px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-full flex items-center gap-1">
                      {task.location === "Remote" ? <Globe size={12} /> : <MapPin size={12} />}
                      {task.location || "Remote"}
                    </span>
                  </div>

                  {/* Status Pill */}
                  {isClosed ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Closed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-4">
                  {task.title}
                </h1>

                {/* Company Link and Metadata */}
                <div className="flex flex-wrap items-center gap-4 pt-2 pb-6 border-b border-[#F1F5F9]">
                  <div
                    onClick={() => {
                      if (companyId) navigate(`/profile/${companyId}?view=company`);
                    }}
                    className={`flex items-center gap-2.5 group cursor-pointer`}
                    title={companyId ? `View ${companyName}'s profile` : undefined}
                  >
                    <Avatar
                      name={companyName}
                      src={companyAvatar}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#F1F5F9] group-hover:ring-[#6D3DF5] transition-all"
                      initialsClassName="text-xs font-bold text-white"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#6D3DF5] transition-colors">
                          {companyName}
                        </span>
                        {companyId && (
                          <ChevronRight
                            size={14}
                            className="text-[#94A3B8] group-hover:text-[#6D3DF5] group-hover:translate-x-0.5 transition-all"
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B]">
                        {companyUser?.Profile?.position || "Industry Partner"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
                  <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-[#E2E8F0]">
                    <span className="text-[11px] font-semibold text-[#64748B] block mb-1">
                      Package / Stipend
                    </span>
                    <span className="text-sm font-bold text-[#0F172A]">
                      {task.packageRange || "Unspecified"}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-[#E2E8F0]">
                    <span className="text-[11px] font-semibold text-[#64748B] block mb-1">
                      Deadline
                    </span>
                    <span className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Clock size={13} className="text-[#6D3DF5]" />
                      {task.deadline}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-[#E2E8F0] col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-semibold text-[#64748B] block mb-1">
                      Applicants
                    </span>
                    <span className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Users size={13} className="text-[#6D3DF5]" />
                      {task.submissions?.length || 0} applied
                    </span>
                  </div>
                </div>
              </div>

              {/* Overview & Description */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E1E8F2] shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-[#0F172A]">
                  <Briefcase size={18} className="text-[#6D3DF5]" />
                  <h3 className="font-bold text-base">Challenge Overview</h3>
                </div>
                <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-line">
                  {task.description}
                </p>
              </div>

              {/* Instructions / Steps */}
              {task.instructions && task.instructions.length > 0 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E1E8F2] shadow-xs space-y-5">
                  <div className="flex items-center gap-2 text-[#0F172A]">
                    <FileText size={18} className="text-[#6D3DF5]" />
                    <h3 className="font-bold text-base">Steps to Complete</h3>
                  </div>

                  <div className="bg-[#F3EEFF]/60 rounded-2xl p-5 md:p-6 border border-[#E9E1FF]">
                    <ul className="space-y-3.5">
                      {task.instructions.map((step, idx) => (
                        <li key={idx} className="flex gap-3.5 items-start">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white text-[#6D3DF5] font-bold text-xs border border-[#E9E1FF] shadow-xs">
                            {idx + 1}
                          </span>
                          <span className="text-xs md:text-sm text-[#334155] pt-0.5 leading-relaxed font-medium">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Submission Notice from Modal */}
                  <div className="flex items-start gap-3 p-4 bg-[#F3EEFF] text-[#5B2FD6] rounded-2xl border border-[#E9E1FF] text-xs">
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#6D3DF5]" />
                    <p className="leading-relaxed font-medium">
                      Please ensure you read all requirements carefully. Submissions that do not meet the core criteria listed above will be automatically rejected by the system.
                    </p>
                  </div>
                </div>
              )}

              {/* Required Skills */}
              {task.tags && task.tags.length > 0 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E1E8F2] shadow-xs space-y-3">
                  <h3 className="font-bold text-sm text-[#0F172A]">Required Skills & Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#475569]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Perks */}
              {task.perksList && task.perksList.length > 0 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E1E8F2] shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-[#0F172A]">
                    <Award size={18} className="text-[#6D3DF5]" />
                    <h3 className="font-bold text-sm">Benefits & Perks</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {task.perksList.map((perk, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F3EEFF]/50 border border-[#E9E1FF] text-xs font-semibold text-[#5B2FD6]"
                      >
                        <CheckCircle2 size={14} className="text-[#6D3DF5] shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Resources / Links */}
              {(task.projectSubmissionFormatURL || task.additionalDocumentsURL) && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E1E8F2] shadow-xs space-y-3">
                  <h3 className="font-bold text-sm text-[#0F172A]">Resource Links</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {task.projectSubmissionFormatURL && (
                      <a
                        href={task.projectSubmissionFormatURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F2ECFF] text-xs font-bold text-[#6D3DF5] border border-[#E2E8F0] transition-colors"
                      >
                        <ExternalLink size={14} />
                        <span>Submission Format Guidelines</span>
                      </a>
                    )}
                    {task.additionalDocumentsURL && (
                      <a
                        href={task.additionalDocumentsURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F2ECFF] text-xs font-bold text-[#6D3DF5] border border-[#E2E8F0] transition-colors"
                      >
                        <ExternalLink size={14} />
                        <span>Additional Documents</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Required Task Materials & Assets Card */}
              {task.materials && task.materials.length > 0 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E1E8F2] shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          canDownloadMaterials
                            ? "bg-[#F3EEFF] text-[#6D3DF5]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {canDownloadMaterials ? <Paperclip size={20} /> : <Lock size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                          <span>Required Task Materials</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#EDE9FE] text-[#6D3DF5]">
                            {task.materials.length} {task.materials.length === 1 ? "file" : "files"}
                          </span>
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          {canDownloadMaterials
                            ? "Download all required materials (logos, CSV datasets, PDF briefs) in a single ZIP."
                            : "Proprietary task assets are protected and unlock automatically once you are accepted."}
                        </p>
                      </div>
                    </div>

                    {canDownloadMaterials ? (
                      <button
                        onClick={handleDownloadMaterialsZip}
                        disabled={downloadingZip}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold shadow-md shadow-[#6D3DF5]/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
                      >
                        {downloadingZip ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Creating ZIP...</span>
                          </>
                        ) : (
                          <>
                            <Download size={15} />
                            <span>Download All (.zip)</span>
                          </>
                        )}
                      </button>
                    ) : isStudent && !isClosed ? (
                      <button
                        onClick={handleAcceptTask}
                        disabled={acceptingTask}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold shadow-md shadow-[#6D3DF5]/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 shrink-0"
                      >
                        {acceptingTask ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Accepting...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Accept Task to Unlock</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold shrink-0">
                        <Lock size={12} className="text-amber-600" />
                        <span>Locked Until Accepted</span>
                      </div>
                    )}
                  </div>

                  {/* List of Material Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {task.materials.map((file, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          canDownloadMaterials
                            ? "bg-[#F8FAFC] border-slate-200/80 hover:border-[#6D3DF5]/40 hover:bg-[#FAF8FF]"
                            : "bg-slate-50/70 border-slate-200/50 opacity-80"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                            {getFileIcon(file.name || file.format)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                              {file.name || "Task Attachment"}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {file.size ? formatBytes(file.size) : "Attached asset"} • {file.format ? file.format.toUpperCase() : "FILE"}
                            </p>
                          </div>
                        </div>

                        {canDownloadMaterials && file.url ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-slate-400 hover:text-[#6D3DF5] hover:bg-white transition-colors"
                            title="Open / Download individual file"
                          >
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <Lock size={14} className="text-slate-400 mr-1.5" />
                        )}
                      </div>
                    ))}
                  </div>

                  {!canDownloadMaterials && (
                    <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck size={16} className="text-[#6D3DF5] shrink-0" />
                        <span>
                          Accept this challenge to unlock and download all required task materials (logos, CSV datasets, PDF briefs) in a bundled ZIP.
                        </span>
                      </div>
                      {isStudent && !isClosed && (
                        <button
                          onClick={handleAcceptTask}
                          disabled={acceptingTask}
                          className="px-4 py-1.5 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                        >
                          {acceptingTask ? "Accepting..." : "Accept Now"}
                        </button>
                      )}
                    </div>
                  )}

                  {canDownloadMaterials && (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2 text-xs text-emerald-800 font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>Task accepted! All task materials are unlocked and ready to download.</span>
                      </div>
                      <button
                        onClick={handleDownloadMaterialsZip}
                        disabled={downloadingZip}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <Download size={13} />
                        <span>Download ZIP</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Actions & Company Summary */}
            <div className="space-y-6">
              {/* Actions Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#E1E8F2] shadow-xs space-y-4 sticky top-24">
                <h3 className="font-bold text-sm text-[#0F172A]">Actions</h3>

                {/* Student specific action buttons */}
                {isStudent && (
                  <div className="space-y-3">
                    {!hasAcceptedTask ? (
                      isClosed ? (
                        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                          <Lock size={18} className="text-slate-500 mx-auto mb-1.5" />
                          <p className="text-xs font-bold text-slate-700">Submissions Closed</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">The deadline has passed.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={handleAcceptTask}
                            disabled={acceptingTask}
                            className="w-full py-3.5 px-4 rounded-2xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white font-bold text-xs shadow-md shadow-[#6D3DF5]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                          >
                            {acceptingTask ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Accepting Task...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={16} />
                                <span>Accept Task & Unlock Materials</span>
                              </>
                            )}
                          </button>
                          <p className="text-[11px] text-[#64748B] text-center">
                            Accept to access datasets, starter code, and submit your final solution.
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="space-y-3">
                        {isSolutionSubmitted ? (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                              <CheckCircle2 size={18} />
                            </div>
                            <p className="text-xs font-bold text-emerald-800">
                              Solution Submitted
                            </p>
                            <p className="text-[11px] text-emerald-600 mt-0.5 capitalize">
                              Status: {applicationStatus ? applicationStatus.replace("_", " ") : "Under Review"}
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-[#F4F0FF] border border-[#DDD6FE] text-center">
                            <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#6D3DF5] flex items-center justify-center mx-auto mb-2">
                              <CheckCircle2 size={18} />
                            </div>
                            <p className="text-xs font-bold text-[#5B2FD6]">
                              Task Accepted & In Progress
                            </p>
                            <p className="text-[11px] text-[#64748B] mt-0.5">
                              Download the materials, build your solution, and submit your project when ready.
                            </p>
                          </div>
                        )}

                        {/* Direct Download button if materials exist */}
                        {task.materials && task.materials.length > 0 && (
                          <button
                            onClick={handleDownloadMaterialsZip}
                            disabled={downloadingZip}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                          >
                            {downloadingZip ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Download size={14} />
                            )}
                            <span>Download Materials (.zip)</span>
                          </button>
                        )}

                        {/* Submit / Update Solution Button */}
                        <button
                          onClick={() => setIsApplicationOpen(true)}
                          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isSolutionSubmitted
                              ? "bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0]"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          <FileText size={14} className={isSolutionSubmitted ? "text-[#6D3DF5]" : "text-white"} />
                          <span>{isSolutionSubmitted ? "Update Submitted Solution" : "Submit Solution / Project"}</span>
                        </button>
                      </div>
                    )}

                    {/* Mentorship Section for Students */}
                    {mentorRequest ? (
                      mentorRequest.status === "accepted" ? (
                        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                              <UserPlus size={14} className="text-emerald-600" />
                              <span>Mentorship Requested</span>
                            </p>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Accepted
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-700">
                            Status: <span className="font-semibold">Accepted</span>
                          </p>

                          {getMeetingUrl(mentorRequest.meetLink) ? (
                            <a
                              href={getMeetingUrl(mentorRequest.meetLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full mt-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Video size={14} />
                              <span>Join Mentor Meeting</span>
                              <ExternalLink size={13} className="opacity-90" />
                            </a>
                          ) : (
                            <div className="mt-2 p-2 rounded-xl bg-white/80 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                              <Clock size={13} className="text-emerald-600 shrink-0" />
                              <span>Meeting link will be shared by the mentor soon.</span>
                            </div>
                          )}

                          {Array.isArray(mentorRequest.resources) && mentorRequest.resources.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-emerald-200/60 space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                                Shared Resources
                              </span>
                              {mentorRequest.resources.map((res, i) => {
                                const resUrl = getMeetingUrl(res.url);
                                return (
                                  <a
                                    key={i}
                                    href={resUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-emerald-200 text-xs text-emerald-900 hover:bg-emerald-50 transition-colors"
                                  >
                                    <span className="truncate text-[11px] font-medium">{res.label || "Resource"}</span>
                                    <ExternalLink size={12} className="text-emerald-600 shrink-0 ml-1.5" />
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : mentorRequest.status === "rejected" ? (
                        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                              <UserPlus size={14} className="text-rose-600" />
                              <span>Mentorship Requested</span>
                            </p>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              Declined
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-700">
                            Status: <span className="font-semibold">Declined</span>
                          </p>
                          <p className="text-[11px] text-rose-500 italic pt-0.5">
                            Your request was declined by the mentor.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-[#F3EEFF] border border-[#E9E1FF] space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[#6D3DF5] flex items-center gap-1.5">
                              <UserPlus size={14} />
                              <span>Mentorship Requested</span>
                            </p>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#6D3DF5] border-[#E9E1FF]">
                              Pending
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B]">
                            Status: <span className="font-semibold capitalize">{mentorRequest.status || "Pending"}</span>
                          </p>
                          <p className="text-[11px] text-[#6D3DF5] italic pt-0.5">
                            Waiting for mentor to review your request...
                          </p>
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => setIsMentorRequestOpen(true)}
                        className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-[#F3EEFF] text-[#6D3DF5] font-bold text-xs border border-[#E9E1FF] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UserPlus size={15} />
                        <span>Request Faculty Mentorship</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Creator Industry specific button */}
                {isTaskCreator && (
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                    <p className="text-xs font-bold text-[#0F172A]">You posted this challenge</p>
                    <p className="text-[11px] text-[#64748B]">
                      Manage submissions, applicants, and candidate hiring in your Industry dashboard.
                    </p>
                    <button
                      onClick={() => navigate("/dashboard/industry")}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Go to Industry Dashboard
                    </button>
                  </div>
                )}

                {/* Company Profile Card */}
                <div className="pt-4 border-t border-[#F1F5F9] space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Posted By
                  </span>
                  <div
                    onClick={() => {
                      if (companyId) navigate(`/profile/${companyId}?view=company`);
                    }}
                    className={`flex items-center gap-3 p-2 rounded-2xl -mx-2 hover:bg-[#F8FAFC] transition-colors ${
                      companyId ? "cursor-pointer group" : ""
                    }`}
                    title={companyId ? `View ${companyName}'s company profile` : undefined}
                  >
                    <Avatar
                      name={companyName}
                      src={companyAvatar}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#F1F5F9] group-hover:ring-[#6D3DF5] transition-all shrink-0"
                      initialsClassName="text-sm font-bold text-white"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-[#6D3DF5] transition-colors truncate">
                          {companyName}
                        </h4>
                        {companyId && (
                          <ChevronRight
                            size={14}
                            className="text-[#94A3B8] group-hover:text-[#6D3DF5] group-hover:translate-x-0.5 transition-all"
                          />
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] truncate">
                        {companyUser?.Profile?.position || "Verified Company"}
                      </p>
                    </div>
                  </div>

                  {companyId && (
                    <button
                      onClick={() => navigate(`/profile/${companyId}?view=company`)}
                      className="w-full py-2 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F2ECFF] text-xs font-bold text-[#6D3DF5] border border-[#E2E8F0] transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Building2 size={13} />
                      <span>View Company Profile</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Application Modal */}
      {isStudent && task && (
        <ApplicationFormModal
          isOpen={isApplicationOpen}
          onClose={() => setIsApplicationOpen(false)}
          task={task}
          onSubmit={handleSubmitApplication}
          existingData={existingSubmission}
        />
      )}

      {/* Mentorship Request Modal */}
      {isStudent && task && (
        <MentorRequestModal
          isOpen={isMentorRequestOpen}
          onClose={async () => {
            setIsMentorRequestOpen(false);
            if (isStudent && taskId) {
              try {
                const mentorRes = await api.get("/mentor-requests/my-requests");
                if (mentorRes.data?.data) {
                  const foundReq = mentorRes.data.data.find(
                    (r) => String(r.task?._id || r.task) === String(taskId)
                  );
                  if (foundReq) {
                    setMentorRequest(foundReq);
                  }
                }
              } catch (e) {
                // Ignore silent refresh error
              }
            }
          }}
          task={task}
        />
      )}
    </div>
  );
};

export default TaskDetailsPage;
