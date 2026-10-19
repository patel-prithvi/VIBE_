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
  const [mentorRequest, setMentorRequest] = useState(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isMentorRequestOpen, setIsMentorRequestOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

      await api.post("/submissions/submit", payload);
      setHasApplied(true);
      setApplicationStatus("applied");
      toast.success("Application submitted successfully!");
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

  const companyId = task?.createdBy?._id || task?.createdBy;
  const companyUser = task?.createdBy && typeof task.createdBy === "object" ? task.createdBy : null;
  const companyAvatar = companyUser?.Profile?.avatar || companyUser?.ImageUrl;
  const companyName = task?.companyName || companyUser?.name || "Industry Partner";

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
                      if (companyId) navigate(`/profile/${companyId}`);
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
            </div>

            {/* Right Column: Actions & Company Summary */}
            <div className="space-y-6">
              {/* Actions Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#E1E8F2] shadow-xs space-y-4 sticky top-24">
                <h3 className="font-bold text-sm text-[#0F172A]">Actions</h3>

                {/* Student specific action buttons */}
                {isStudent && (
                  <div className="space-y-3">
                    {hasApplied ? (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                          <CheckCircle2 size={18} />
                        </div>
                        <p className="text-xs font-bold text-emerald-800">
                          Application Submitted
                        </p>
                        <p className="text-[11px] text-emerald-600 mt-0.5 capitalize">
                          Status: {applicationStatus ? applicationStatus.replace("_", " ") : "Under Review"}
                        </p>
                      </div>
                    ) : isClosed ? (
                      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                        <Lock size={18} className="text-slate-500 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-slate-700">Submissions Closed</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">The deadline has passed.</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsApplicationOpen(true)}
                        className="w-full py-3 px-4 rounded-2xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Apply For Task</span>
                        <ChevronRight size={15} />
                      </button>
                    )}

                    {/* Mentorship Request Button for Students */}
                    {mentorRequest ? (
                      <div className="p-3.5 rounded-2xl bg-[#F3EEFF] border border-[#E9E1FF]">
                        <p className="text-xs font-bold text-[#6D3DF5] flex items-center gap-1.5">
                          <UserPlus size={14} /> Mentorship Requested
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-1 capitalize">
                          Status: {mentorRequest.status}
                        </p>
                      </div>
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
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={companyName}
                      src={companyAvatar}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#F1F5F9] shrink-0"
                      initialsClassName="text-sm font-bold text-white"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#0F172A] truncate">{companyName}</h4>
                      <p className="text-xs text-[#64748B] truncate">
                        {companyUser?.Profile?.position || "Verified Company"}
                      </p>
                    </div>
                  </div>

                  {companyId && (
                    <button
                      onClick={() => navigate(`/profile/${companyId}`)}
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
        />
      )}

      {/* Mentorship Request Modal */}
      {isStudent && task && (
        <MentorRequestModal
          isOpen={isMentorRequestOpen}
          onClose={() => setIsMentorRequestOpen(false)}
          task={task}
        />
      )}
    </div>
  );
};

export default TaskDetailsPage;
