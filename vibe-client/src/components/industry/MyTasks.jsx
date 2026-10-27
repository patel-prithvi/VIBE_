import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  X,
  MapPin,
  Globe,
  Check,
  Download,
  ExternalLink,
  Briefcase,
  Code,
  Palette,
  Laptop,
  FileText,
  ChevronRight,
  ChevronLeft,
  Upload,
  BookOpen,
  AlertCircle,
  Trash2,
  Github,
  Youtube,
  Link as LinkIcon,
  File,
  Pencil,
  Award,
  Layers,
  GraduationCap,
  RotateCcw,
  Image,
  FileSpreadsheet,
  FileArchive,
  Paperclip,
} from "lucide-react";
import { useToast } from "../Toast";
import Avatar from "../shared/Avatar";
import { useScrollLock } from "../../hooks/useScrollLock";
import { isTaskExpired } from "../../utils/taskRelevance";
import SubmissionModal from "./SubmissionModal";

export const MyTasks = ({
  tasks,
  onAddTask,
  onUpdateTask,
  applicants,
  onUpdateApplicantStatus,
  user,
  initialActiveTaskId,
  onClearInitialTaskId,
  initialOpenCreateModal,
  onClearOpenCreateModal,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [createModalStep, setCreateModalStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTask, setActiveTask] = useState(null); // For Applicant View
  const [previewInstructions, setPreviewInstructions] = useState(null); // For Instruction Modal
  const [selectedApplicant, setSelectedApplicant] = useState(null); // For Submission Details Modal
  const [showApplicantsDrawer, setShowApplicantsDrawer] = useState(false); // Main Applicants Drawer

  useScrollLock(
    Boolean(
      showCreateModal ||
      previewInstructions ||
      (showApplicantsDrawer && activeTask) ||
      selectedApplicant
    )
  );

  useEffect(() => {
    if (initialActiveTaskId && tasks && tasks.length > 0) {
      const match = tasks.find(
        (t) => String(t.id || t._id) === String(initialActiveTaskId)
      );
      if (match) {
        setActiveTask(match);
        setShowApplicantsDrawer(true);
      }
      if (onClearInitialTaskId) onClearInitialTaskId();
    }
  }, [initialActiveTaskId, tasks, onClearInitialTaskId]);

  useEffect(() => {
    if (initialOpenCreateModal) {
      setEditingId(null);
      setCreateModalStep(1);
      setShowCreateModal(true);
      if (onClearOpenCreateModal) onClearOpenCreateModal();
    }
  }, [initialOpenCreateModal, onClearOpenCreateModal]);
  const [interviewFormFor, setInterviewFormFor] = useState(null); // Applicant ID for inline interview form
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    mode: "Online",
    link: "",
  });

  // Create/Edit Task Form State
  const [newSteps, setNewSteps] = useState([""]);
  const [formData, setFormData] = useState({
    title: "",
    role: "",
    category: "Development",
    deadline: "",
    payment: "Paid",
    type: "Remote",
    skills: "",
    perks: "",
    overview: "",
    note: "",
  });

  // Materials & Assets uploaded by industry
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [existingMaterials, setExistingMaterials] = useState([]);
  const [customDays, setCustomDays] = useState("");

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
    return <File size={18} className="text-blue-600" />;
  };

  const handleMaterialFilesAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedMaterials((prev) => [...prev, ...files]);
    }
    // reset input so re-selecting same file works
    e.target.value = "";
  };

  const handleRemoveNewMaterial = (index) => {
    setSelectedMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingMaterial = (index) => {
    setExistingMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    setNewSteps([...newSteps, ""]);
  };

  const handleStepChange = (index, value) => {
    const updated = [...newSteps];
    updated[index] = value;
    setNewSteps(updated);
  };

  const handleRemoveStep = (index) => {
    const updated = newSteps.filter((_, i) => i !== index);
    setNewSteps(updated);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusUpdate = (id, newStatus, details) => {
    onUpdateApplicantStatus(id, newStatus, details);
    if (selectedApplicant && selectedApplicant.id === id) {
      setSelectedApplicant((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }
    if (interviewFormFor === id && newStatus !== "SHORTLISTED") {
      setInterviewFormFor(null);
      setInterviewData({ date: "", time: "", mode: "Online", link: "" });
    }
  };

  // Get today's local date as "YYYY-MM-DD"
  const getTodayStr = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Get current local time as "HH:mm"
  const getCurrentTimeStr = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // Helper to parse dates to "YYYY-MM-DD" for input type date
  const parseDateForInput = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return "";
  };

  // Compute days from today for a given date string
  const getDaysFromToday = (dateStr) => {
    if (!dateStr) return null;
    let target;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-").map(Number);
      target = new Date(y, m - 1, d);
    } else {
      target = new Date(dateStr);
    }
    if (isNaN(target.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  };

  // Set deadline date relative to today (+X days)
  const setDeadlineDaysFromNow = (days) => {
    const num = parseInt(days, 10);
    if (isNaN(num) || num < 0) return;
    const target = new Date();
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() + num);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    const newDeadline = `${yyyy}-${mm}-${dd}`;
    setFormData((prev) => ({ ...prev, deadline: newDeadline }));
  };

  // Format date nicely (e.g. "Mon, 26 Oct 2026")
  const formatDeadlineDate = (dateStr) => {
    if (!dateStr) return "";
    let date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-").map(Number);
      date = new Date(y, m - 1, d);
    } else {
      date = new Date(dateStr);
    }
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Badge label and subtitle for "Open Upto" feature
  const getDeadlineBadge = (deadlineStr) => {
    if (!deadlineStr) return null;
    const days = getDaysFromToday(deadlineStr);
    if (days === null) return null;

    if (days < 0) {
      return {
        label: `Past Date (${Math.abs(days)}d ago)`,
        sub: "Invalid: Date is in the past",
        isPast: true,
      };
    }
    if (days === 0) {
      return {
        label: "Open Today",
        sub: "Closes tonight (11:59 PM)",
        isPast: false,
      };
    }
    if (days === 1) {
      return {
        label: "Open Upto 1 Day",
        sub: "Closes tomorrow",
        isPast: false,
      };
    }
    if (days === 7) {
      return {
        label: "Open Upto 1 Week",
        sub: "7 days duration",
        isPast: false,
      };
    }
    if (days === 14) {
      return {
        label: "Open Upto 2 Weeks",
        sub: "14 days duration",
        isPast: false,
      };
    }
    if (days === 30) {
      return {
        label: "Open Upto 1 Month",
        sub: "30 days duration",
        isPast: false,
      };
    }
    return {
      label: `Open Upto ${days} Days`,
      sub: `${days} days duration`,
      isPast: false,
    };
  };

  const normalizeStatus = (s) => {
    const val = String(s || "").toLowerCase();
    switch (val) {
      case "pending":
        return "APPLIED";
      case "approved":
        return "SELECTED";
      case "rejected":
        return "REJECTED";
      case "shortlisted":
        return "SHORTLISTED";
      case "interview_scheduled":
        return "INTERVIEW_SCHEDULED";
      case "submitted":
        return "SHORTLISTED";
      case "reviewed":
        return "SHORTLISTED";
      case "hired":
        return "SELECTED";
      case "applied":
        return "APPLIED";
      default:
        // Preserve already-normalized UI labels if present
        if (s === "APPLIED" || s === "SHORTLISTED" || s === "INTERVIEW_SCHEDULED" || s === "SELECTED" || s === "REJECTED") {
          return s;
        }
        return "APPLIED";
    }
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-slate-100 text-slate-700 border border-slate-200";
      case "SHORTLISTED":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "INTERVIEW_SCHEDULED":
        return "bg-[#F5F1FF] text-[#7C3AED] border border-[#EDE9FE]";
      case "SELECTED":
        return "bg-green-100 text-green-700 border border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const ApplicantsDrawer = ({ task, onClose }) => {
    const taskApplicants = applicants.filter((a) => a.taskId === task.id);

    const handleScheduleSave = (appId) => {
      if (!interviewData.date || !interviewData.time || !interviewData.mode) {
        toast.error("Please fill interview date, time and mode.");
        return;
      }

      const todayStr = getTodayStr();
      const currentTimeStr = getCurrentTimeStr();

      if (interviewData.date < todayStr) {
        toast.error("Interview date cannot be in the past.");
        return;
      }

      if (interviewData.date === todayStr && interviewData.time < currentTimeStr) {
        toast.error("Interview time cannot be in the past for today.");
        return;
      }

      handleStatusUpdate(appId, "INTERVIEW_SCHEDULED", {
        interviewDate: interviewData.date,
        interviewTime: interviewData.time,
        interviewMode: interviewData.mode,
        interviewLink: interviewData.link,
      });
      setInterviewFormFor(null);
      setInterviewData({ date: "", time: "", mode: "Online", link: "" });
    };

    return (
      <div className="fixed inset-0 z-50 flex items-stretch bg-slate-900/40 backdrop-blur-sm touch-none">
        <div role="dialog" aria-modal="true" className="ml-auto h-full w-full max-w-5xl bg-white rounded-l-3xl shadow-2xl border-l border-[#EDE9FE] flex flex-col overscroll-contain">
          <div className="p-6 border-b border-[#EDE9FE] flex items-start justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-[#EDE9FE] text-[#5B2FD6] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                Applicants
              </span>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {task.title}
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                {taskApplicants.length} total applicants
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-auto overscroll-contain">
            <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="text-left text-slate-500 text-xs uppercase tracking-widest font-black bg-slate-50">
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Submitted Assets</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {taskApplicants.map((a) => {
                    const status = normalizeStatus(a.status);
                    return (
                      <tr key={a.id} className="border-t border-slate-100 align-top">
                        <td className="px-4 py-4">
                          <div
                            onClick={() => {
                              const sid = a.studentId || a.userId || a.createdBy;
                              if (sid) navigate(`/profile/${sid}`);
                            }}
                            className={`flex items-center gap-3 ${
                              a.studentId || a.userId || a.createdBy
                                ? "cursor-pointer group/app"
                                : ""
                            }`}
                          >
                            <Avatar
                              name={a.name}
                              src={a.avatar}
                              className="w-10 h-10 rounded-full flex-shrink-0 object-cover ring-2 ring-[#F3EEFF] group-hover/app:ring-[#6D3DF5]/30 transition-all"
                              initialsClassName="text-xs font-bold text-white"
                            />
                            <div>
                              <div className="text-sm font-bold text-slate-900 group-hover/app:text-[#6D3DF5] transition-colors">
                                {a.name}
                              </div>
                              <div className="text-xs text-slate-500 font-medium">
                                {a.college}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-slate-700">{a.email || "—"}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClass(status)}`}>
                            {status.replace("_", " ")}
                          </span>
                        </td>
                        {/* Submitted Assets column */}
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {a.submission?.githubLink && (
                              <a
                                href={a.submission.githubLink}
                                target="_blank"
                                rel="noreferrer"
                                title="GitHub Repository"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                              >
                                <Github size={13} /> Repo
                              </a>
                            )}
                            {a.submission?.videoLink && (
                              <a
                                href={a.submission.videoLink}
                                target="_blank"
                                rel="noreferrer"
                                title="Video Demo"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                              >
                                <Youtube size={13} /> Video
                              </a>
                            )}
                            {a.submission?.driveLink && (
                              <a
                                href={a.submission.driveLink}
                                target="_blank"
                                rel="noreferrer"
                                title="Google Drive"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                              >
                                <File size={13} /> Drive
                              </a>
                            )}
                            {a.submission?.otherLinks?.filter(Boolean).map((link, i) => (
                              <a
                                key={i}
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                title={link}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#EDE9FE] text-[#5B2FD6] hover:bg-[#E9E1FF] border border-[#E9E1FF] transition-colors"
                              >
                                <LinkIcon size={13} /> Link
                              </a>
                            ))}
                            {!a.submission?.githubLink && !a.submission?.videoLink && !a.submission?.driveLink && (
                              <span className="text-xs text-slate-400 italic">No assets yet</span>
                            )}
                          </div>
                          {a.submission?.projectTitle && (
                            <div className="mt-1.5 text-xs text-slate-500 font-medium truncate max-w-[200px]" title={a.submission.projectTitle}>
                              📄 {a.submission.projectTitle}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {/* View Submission */}
                          <div className="mb-2">
                            <button
                              onClick={() => setSelectedApplicant(a)}
                              className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-[#F3EEFF] hover:border-[#C4B5FD] hover:text-[#5B2FD6] transition-all flex items-center gap-2"
                            >
                              <FileText size={14} /> View Submission
                            </button>
                          </div>

                          {status === "APPLIED" && (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleStatusUpdate(a.id, "SHORTLISTED")}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-[#6D3DF5] text-white hover:bg-[#5B2FD6] shadow-sm"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(a.id, "REJECTED")}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {status === "SHORTLISTED" && (
                            <div className="space-y-3">
                              <button
                                onClick={() =>
                                  setInterviewFormFor(
                                    interviewFormFor === a.id ? null : a.id,
                                  )
                                }
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                              >
                                Schedule Interview
                              </button>

                              {interviewFormFor === a.id && (
                                <div className="mt-3 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-bold text-slate-500">
                                        Interview Date
                                      </label>
                                      <input
                                        type="date"
                                        min={getTodayStr()}
                                        value={interviewData.date}
                                        onChange={(e) => {
                                          const selectedDate = e.target.value;
                                          const isToday = selectedDate === getTodayStr();
                                          setInterviewData((d) => {
                                            const nextTime =
                                              isToday && d.time && d.time < getCurrentTimeStr()
                                                ? ""
                                                : d.time;
                                            return {
                                              ...d,
                                              date: selectedDate,
                                              time: nextTime,
                                            };
                                          });
                                        }}
                                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-slate-500">
                                        Interview Time
                                      </label>
                                      <input
                                        type="time"
                                        min={
                                          interviewData.date === getTodayStr()
                                            ? getCurrentTimeStr()
                                            : undefined
                                        }
                                        value={interviewData.time}
                                        onChange={(e) =>
                                          setInterviewData((d) => ({
                                            ...d,
                                            time: e.target.value,
                                          }))
                                        }
                                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-bold text-slate-500">
                                        Mode
                                      </label>
                                      <select
                                        value={interviewData.mode}
                                        onChange={(e) =>
                                          setInterviewData((d) => ({
                                            ...d,
                                            mode: e.target.value,
                                          }))
                                        }
                                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                                      >
                                        <option>Online</option>
                                        <option>Offline</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-slate-500">
                                        Meeting Link
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="https://meet.example.com/..."
                                        value={interviewData.link}
                                        onChange={(e) =>
                                          setInterviewData((d) => ({
                                            ...d,
                                            link: e.target.value,
                                          }))
                                        }
                                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleScheduleSave(a.id)}
                                      className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setInterviewFormFor(null);
                                        setInterviewData({
                                          date: "",
                                          time: "",
                                          mode: "Online",
                                          link: "",
                                        });
                                      }}
                                      className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {status === "INTERVIEW_SCHEDULED" && (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleStatusUpdate(a.id, "SELECTED")}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-green-600 text-white hover:bg-green-700 shadow-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(a.id, "REJECTED")}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {(status === "SELECTED" || status === "REJECTED") && (
                            <div className={`inline-flex px-3 py-2 rounded-xl text-xs font-bold ${statusBadgeClass(status)}`}>
                              {status === "SELECTED" ? "Selected" : "Rejected"}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleEditClick = (task) => {
    setEditingId(task.id);
    setCreateModalStep(1);
    const parsedDeadline = parseDateForInput(task.deadline);
    setFormData({
      title: task.title,
      role: task.role,
      category: task.category,
      deadline: parsedDeadline,
      payment: task.payment,
      type: task.type,
      skills: Array.isArray(task.skills) ? task.skills.join(", ") : task.skills,
      perks: Array.isArray(task.perks) ? task.perks.join(", ") : task.perks,
      overview: task.instructions.overview,
      note: task.instructions.note || "",
    });
    const days = getDaysFromToday(parsedDeadline);
    setCustomDays(days !== null && days >= 0 ? String(days) : "");
    setNewSteps(
      task.instructions.steps.length > 0 ? task.instructions.steps : [""],
    );
    setExistingMaterials(task.materials || []);
    setSelectedMaterials([]);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCreateModalStep(1);
    setEditingId(null);
    setCustomDays("");
    setFormData({
      title: "",
      role: "",
      category: "Development",
      deadline: "",
      payment: "Paid",
      type: "Remote",
      skills: "",
      perks: "",
      overview: "",
      note: "",
    });
    setNewSteps([""]);
    setSelectedMaterials([]);
    setExistingMaterials([]);
  };

  const handlePublish = () => {
    if (!formData.title || !formData.role || !formData.deadline) {
      toast.error("Please fill in the required fields (Title, Role, Deadline).");
      return;
    }

    const todayStr = getTodayStr();
    if (formData.deadline < todayStr) {
      toast.error("Deadline cannot be in the past. Please select today or a future date.");
      return;
    }

    const taskData = {
      id: editingId || Date.now().toString(),
      title: formData.title,
      category: formData.category,
      role: formData.role,
      company: user?.name || user?.companyName || "Industry Partner",
      location: formData.type,
      type: formData.type,
      payment: formData.payment,
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      perks: formData.perks,
      deadline: (() => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(formData.deadline)) {
          const [y, m, d] = formData.deadline.split("-").map(Number);
          return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
        return new Date(formData.deadline).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      })(),
      lastDateToSubmit: formData.deadline,
      status: "Active",
      applicantsCount: editingId
        ? tasks.find((t) => t.id === editingId)?.applicantsCount || 0
        : 0,
      postedAt: editingId
        ? tasks.find((t) => t.id === editingId)?.postedAt ||
          new Date().toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      instructions: {
        overview: formData.overview,
        steps: newSteps.filter((s) => s.trim() !== ""),
        note: formData.note,
      },
      materialsFiles: selectedMaterials,
      existingMaterials: existingMaterials,
    };

    if (editingId) {
      onUpdateTask(taskData);
    } else {
      onAddTask(taskData);
    }

    handleCloseModal();
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "development":
        return <Laptop size={14} />;
      case "design":
        return <Palette size={14} />;
      default:
        return <Briefcase size={14} />;
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const activeFilteredTasks = filteredTasks.filter((t) => !isTaskExpired(t));
  const expiredFilteredTasks = filteredTasks.filter((t) => isTaskExpired(t));
  const orderedFilteredTasks = [...activeFilteredTasks, ...expiredFilteredTasks];

  // ----------------------------------------------------------------------------------
  // VIEW: Instruction Preview Modal (Student Perspective)
  // ----------------------------------------------------------------------------------
  const InstructionModal = ({ task, onClose }) => {
    const [instructionStep, setInstructionStep] = useState(1);

    const handleOpenFullPage = () => {
      const targetId = task.id || task._id;
      if (!targetId) return;
      onClose();
      navigate(`/tasks/${targetId}`, {
        state: {
          from: "/dashboard/industry",
          fromTab: "tasks",
        },
      });
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 touch-none">
        <div role="dialog" aria-modal="true" className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col relative overflow-hidden">
          {/* Modal Header */}
          <div className="p-6 pb-4 bg-white border-b border-[#F3EEFF] shrink-0">
            <div className="flex justify-between items-start mb-2">
              <span className="flex items-center gap-2 text-xs font-bold text-[#6D3DF5] uppercase tracking-widest">
                <BookOpen size={16} /> Task Instructions
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1 truncate">
              {task.title}
            </h2>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-slate-500 font-medium text-sm">{task.company}</p>
              {/* Step indicator */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setInstructionStep(1)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                    instructionStep === 1
                      ? "bg-[#6D3DF5] text-white shadow-xs"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  1. Overview & Perks
                </button>
                <button
                  type="button"
                  onClick={() => setInstructionStep(2)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                    instructionStep === 2
                      ? "bg-[#6D3DF5] text-white shadow-xs"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  2. Steps to Complete
                </button>
              </div>
            </div>
          </div>

          {/* Modal Content - Not Scrollable */}
          <div className="p-6 space-y-4">
            {instructionStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Overview */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#6D3DF5]">
                    Overview
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 leading-relaxed text-sm min-h-[80px]">
                    {task.instructions?.overview || "No overview provided."}
                  </div>
                </div>

                {/* Perks & Benefits */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#6D3DF5]">
                    Perks & Benefits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(task.perks) ? task.perks : (task.perks?.split(',') || [])).map((perk, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3.5 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-bold">
                        <Award size={13} />
                        {perk.trim()}
                      </div>
                    ))}
                    {(!task.perks || (Array.isArray(task.perks) && task.perks.length === 0)) && (
                      <p className="text-slate-500 text-xs italic">No perks specified.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {instructionStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Steps */}
                <div className="bg-[#F3EEFF]/50 rounded-2xl p-4 border border-[#EDE9FE]/50">
                  <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                    Steps to Complete
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {task.instructions?.steps && task.instructions.steps.length > 0 ? (
                      task.instructions.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-white p-2.5 rounded-xl border border-[#EDE9FE]/70">
                          <div className="w-6 h-6 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#6D3DF5] font-bold text-xs shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-slate-700 text-xs leading-relaxed pt-0.5">{step}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-xs italic">No specific steps defined for this task.</p>
                    )}
                  </div>
                </div>

                {/* Warning/Note */}
                {task.instructions?.note && (
                  <div className="bg-blue-50 rounded-xl p-3 flex gap-2.5 border border-blue-100 text-blue-900">
                    <AlertCircle
                      size={18}
                      className="shrink-0 text-blue-600 mt-0.5"
                    />
                    <p className="text-xs font-medium leading-relaxed">
                      {task.instructions.note}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0 rounded-b-3xl">
            <div className="flex items-center gap-2">
              {instructionStep === 1 ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-white transition-all cursor-pointer"
                >
                  Close
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setInstructionStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ChevronLeft size={14} />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenFullPage}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#6D3DF5] bg-white border border-[#E9E1FF] hover:bg-[#F3EEFF] hover:border-[#C4B5FD] transition-all cursor-pointer shadow-xs"
                title="Open full task instructions page"
              >
                <ExternalLink size={13} />
                <span>View Full Instructions</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {instructionStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setInstructionStep(2)}
                  className="bg-[#6D3DF5] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#5B2FD6] transition-colors shadow-md shadow-[#6D3DF5]/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next: Steps to Complete</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/20 cursor-pointer"
                >
                  Got it, close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // (Removed alternate applicant page; using single Drawer for applicants)

  // ----------------------------------------------------------------------------------
  // VIEW: Main Task List
  // ----------------------------------------------------------------------------------
  return (
    <div className="animate-in fade-in duration-500 relative pb-20">
      {/* Header Section */}
      <div className="mb-8 bg-white rounded-2xl p-6 md:p-8 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] flex items-center justify-center flex-shrink-0">
              <Layers size={20} className="text-[#6D3DF5]" />
            </div>
            <span className="font-bold tracking-widest uppercase text-xs bg-[#F3EEFF] text-[#6D3DF5] px-3 py-1 rounded-full border border-[#E9D5FF]">
              Task Management
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-2 tracking-tight">
            Manage Your Industry
          </h1>
          <p className="text-[#64748B] max-w-2xl text-xs md:text-sm font-medium leading-relaxed">
            Create new challenges, track applicant submissions in real-time, and
            discover the perfect talent for your next big project.
          </p>
        </div>
      </div>

      {/* Search Bar & Create Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full md:w-96 group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6D3DF5] transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search tasks by title, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-[#EDE9FE] rounded-xl focus:ring-4 focus:ring-[#6D3DF5]/10 focus:border-[#6D3DF5] outline-none text-sm transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setCreateModalStep(1);
            setShowCreateModal(true);
          }}
          className="w-full md:w-auto bg-[#6D3DF5] hover:bg-[#6D3DF5] text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-[#6D3DF5]/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-[#8B5CF6]/20"
        >
          <Plus size={20} />{" "}
          <span className="whitespace-nowrap">Create New Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orderedFilteredTasks.length > 0 ? (
          orderedFilteredTasks.map((task) => {
            const isClosed = isTaskExpired(task);
            return (
              <div
                key={task.id}
                className={`rounded-[2rem] p-5 shadow-md border transition-all duration-300 flex flex-col h-full group relative overflow-hidden ${
                  isClosed
                    ? "bg-slate-50/70 border-slate-200/90 shadow-2xs hover:border-slate-300 opacity-85"
                    : "bg-white border-slate-100 hover:border-[#8B5CF6] hover:shadow-xl hover:shadow-[#6D3DF5]/10 hover:scale-[1.02] hover:ring-4 hover:ring-[#6D3DF5]/20"
                }`}
              >
                {/* Top Row: Badges & Edit */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                      isClosed
                        ? "bg-slate-100 text-slate-600 border-slate-200"
                        : "bg-[#F3EEFF] text-[#6D3DF5] border-[#EDE9FE]"
                    }`}>
                      {getCategoryIcon(task.category)}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {task.category}
                      </span>
                    </div>
                    {isClosed && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                        <Clock size={12} className="text-rose-600" />
                        <span>Deadline Passed</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="p-1.5 text-slate-400 hover:text-[#6D3DF5] hover:bg-[#F3EEFF] rounded-lg transition-colors cursor-pointer"
                        title="Edit Task / Extend Deadline"
                      >
                        <Pencil size={14} />
                      </button>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
                        isClosed
                          ? "bg-slate-100 text-slate-600 border-slate-200"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        <Globe size={12} />
                        <span className="text-xs font-bold">{task.type}</span>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isClosed
                          ? "bg-slate-100 text-slate-500 border-slate-200"
                          : task.payment === "Paid"
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}
                    >
                      {task.payment}
                    </div>
                  </div>
                </div>

                {/* Title (Company Name Removed) */}
                <div className="mb-3 h-[3.5rem]">
                  <h3 className={`text-xl font-bold leading-tight mb-2 transition-colors line-clamp-2 ${
                    isClosed
                      ? "text-slate-800"
                      : "text-slate-900 group-hover:text-[#6D3DF5]"
                  }`}>
                    {task.title}
                  </h3>
                </div>

                {/* Role Info */}
                <div className="flex items-center gap-3 mb-3">
                  <Briefcase size={16} className={isClosed ? "text-slate-500 shrink-0" : "text-[#6D3DF5] shrink-0"} />
                  <span className="text-sm font-bold text-slate-800 truncate">
                    Role: {task.role}
                  </span>
                </div>

                {/* Skills */}
                <div className="mb-3 h-[2.5rem] overflow-hidden">
                  <div className="flex flex-wrap gap-2">
                    {task.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Perks (Enhanced UI) */}
                <div className="mb-3 flex-1">
                  <div className={`flex items-start gap-2 p-3 bg-gradient-to-br border rounded-xl ${
                    isClosed
                      ? "from-slate-100/70 to-transparent border-slate-200/80"
                      : "from-[#F3EEFF] to-transparent border-[#EDE9FE]"
                  }`}>
                    <div className={`p-1.5 rounded-lg shadow-sm shrink-0 ${
                      isClosed ? "bg-slate-200 text-slate-600" : "bg-white text-[#6D3DF5]"
                    }`}>
                      <Award size={14} />
                    </div>
                    <div>
                      <span className={`text-sm font-bold block mb-0.5 ${
                        isClosed ? "text-slate-700" : "text-[#5B2FD6]"
                      }`}>
                        Perks & Benefits
                      </span>
                      <p className="text-sm text-slate-600 leading-snug line-clamp-2">
                        {Array.isArray(task.perks) ? task.perks.join(", ") : task.perks}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer: Date & Buttons */}
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className={`flex items-center gap-2 text-sm font-bold mb-3 ${
                    isClosed ? "text-rose-600" : "text-[#8B5CF6]"
                  }`}>
                    <Calendar size={14} className={isClosed ? "text-rose-600" : ""} />{" "}
                    <span className={isClosed ? "text-rose-600 font-semibold" : "text-slate-500"}>
                      {isClosed ? "Deadline Passed: " : ""}Due {task.deadline}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPreviewInstructions(task)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#E9E1FF] text-[#6D3DF5] font-bold text-sm hover:bg-[#F3EEFF] transition-colors cursor-pointer"
                    >
                      <FileText size={16} /> Instructions
                    </button>
                    <button
                      onClick={() => {
                        setActiveTask(task);
                        setShowApplicantsDrawer(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#6D3DF5] text-white font-bold text-sm hover:bg-[#5B2FD6] shadow-lg shadow-[#6D3DF5]/20 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Applicants <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-70 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#F3EEFF] rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-[#C4B5FD]" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No tasks found
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn't find any tasks matching "{searchQuery}". Try adjusting
              your search terms or create a new task.
            </p>
          </div>
        )}
      </div>

      {/* Instruction Preview Modal */}
      {previewInstructions && (
        <InstructionModal
          task={previewInstructions}
          onClose={() => setPreviewInstructions(null)}
        />
      )}

      {/* Applicants Drawer */}
      {showApplicantsDrawer && activeTask && (
        <ApplicantsDrawer
          task={activeTask}
          onClose={() => {
            setShowApplicantsDrawer(false);
            setActiveTask(null);
            setInterviewFormFor(null);
            setInterviewData({ date: "", time: "", mode: "Online", link: "" });
          }}
        />
      )}

      {/* Submission Details Modal */}
      {selectedApplicant && (
        <SubmissionModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Create/Edit Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 touch-none">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white px-8 py-4 border-b border-[#EDE9FE] flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {editingId ? (
                    <Pencil className="text-[#6D3DF5]" size={20} />
                  ) : (
                    <Plus className="text-[#6D3DF5]" size={20} />
                  )}
                  {editingId ? "Edit Task" : "Create New Task"}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setCreateModalStep(1)}
                    className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${
                      createModalStep === 1
                        ? "bg-[#6D3DF5] text-white shadow-xs"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    1. Task Details
                  </button>
                  <ChevronRight size={14} className="text-slate-300" />
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.title?.trim() || !formData.role?.trim() || !formData.deadline) {
                        toast.error("Please fill in Title, Role, and Deadline first.");
                        return;
                      }
                      setCreateModalStep(2);
                    }}
                    className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${
                      createModalStep === 2
                        ? "bg-[#6D3DF5] text-white shadow-xs"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    2. Instructions & Assets
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step 1: Basic Information */}
            {createModalStep === 1 && (
              <div className="p-8 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#E9E1FF] outline-none transition-all text-sm font-medium"
                      placeholder="e.g. Backend API Development"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#E9E1FF] outline-none transition-all text-sm font-medium"
                      placeholder="e.g. Backend Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#E9E1FF] outline-none bg-white text-sm font-medium appearance-none"
                      >
                        <option>Development</option>
                        <option>Design</option>
                        <option>Marketing</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight className="rotate-90" size={16} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Deadline <span className="text-red-500">*</span>
                      </label>
                      {formData.deadline && (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            getDaysFromToday(formData.deadline) < 0
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : "bg-[#F3E8FF] text-[#6D3DF5] border border-[#DDD6FE]"
                          }`}
                        >
                          <Clock size={11} />
                          {getDeadlineBadge(formData.deadline)?.label}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        name="deadline"
                        value={formData.deadline}
                        onChange={(e) => {
                          handleInputChange(e);
                          const days = getDaysFromToday(e.target.value);
                          setCustomDays(days !== null && days >= 0 ? String(days) : "");
                        }}
                        min={getTodayStr()}
                        type="date"
                        className={`w-full px-3.5 py-2 rounded-xl border outline-none text-sm font-medium transition-all ${
                          formData.deadline && getDaysFromToday(formData.deadline) < 0
                            ? "border-red-300 text-red-600 bg-red-50/50"
                            : "border-slate-200 focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#E9E1FF] text-slate-700 bg-white"
                        }`}
                      />
                    </div>

                    {/* Open Upto Quick Selector */}
                    <div className="mt-1.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Calendar size={11} className="text-[#6D3DF5]" />
                          Open Task Upto
                        </span>
                        {formData.deadline && getDaysFromToday(formData.deadline) >= 0 && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            Closes {formatDeadlineDate(formData.deadline)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1">
                        {[
                          { label: "3 Days", days: 3 },
                          { label: "1 Week", days: 7 },
                          { label: "2 Weeks", days: 14 },
                          { label: "1 Month", days: 30 },
                        ].map((preset) => {
                          const isSelected =
                            getDaysFromToday(formData.deadline) === preset.days;
                          return (
                            <button
                              key={preset.days}
                              type="button"
                              onClick={() => {
                                setDeadlineDaysFromNow(preset.days);
                                setCustomDays(String(preset.days));
                              }}
                              className={`px-2 py-0.5 text-[11px] rounded-lg font-medium transition-all ${
                                isSelected
                                  ? "bg-[#6D3DF5] text-white shadow-xs font-semibold"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}

                        {/* Custom X Days input */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5 focus-within:border-[#6D3DF5] focus-within:ring-1 focus-within:ring-[#6D3DF5]">
                          <span className="text-[10px] text-slate-400 font-medium">Upto</span>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            placeholder="X"
                            value={customDays}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomDays(val);
                              if (val && !isNaN(val) && Number(val) >= 0) {
                                setDeadlineDaysFromNow(Number(val));
                              }
                            }}
                            className="w-7 text-[11px] font-semibold text-slate-800 bg-transparent outline-none text-center"
                          />
                          <span className="text-[10px] text-slate-500 font-medium">days</span>
                        </div>
                      </div>
                    </div>

                    {formData.deadline && getDaysFromToday(formData.deadline) < 0 && (
                      <p className="mt-1 text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle size={11} />
                        Past dates are not allowed.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                      Payment Type
                    </label>
                    <div className="flex gap-4 pt-0.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="Paid"
                          checked={formData.payment === "Paid"}
                          onChange={(e) =>
                            handleRadioChange("payment", e.target.value)
                          }
                          className="accent-[#6D3DF5] w-3.5 h-3.5"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          Paid
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="Unpaid"
                          checked={formData.payment === "Unpaid"}
                          onChange={(e) =>
                            handleRadioChange("payment", e.target.value)
                          }
                          className="accent-[#6D3DF5] w-3.5 h-3.5"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          Unpaid
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                      Location
                    </label>
                    <div className="flex gap-4 pt-0.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="Remote"
                          checked={formData.type === "Remote"}
                          onChange={(e) =>
                            handleRadioChange("type", e.target.value)
                          }
                          className="accent-[#6D3DF5] w-3.5 h-3.5"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          Remote
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="Onsite"
                          checked={formData.type === "Onsite"}
                          onChange={(e) =>
                            handleRadioChange("type", e.target.value)
                          }
                          className="accent-[#6D3DF5] w-3.5 h-3.5"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          Onsite
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Skills & Perks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                      Required Skills
                    </label>
                    <input
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#E9E1FF] outline-none text-sm font-medium"
                      placeholder="e.g. React, Figma"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                      Perks
                    </label>
                    <input
                      name="perks"
                      value={formData.perks}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#E9E1FF] outline-none text-sm font-medium"
                      placeholder="e.g. Certificate, Stipend"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Instructions & Materials */}
            {createModalStep === 2 && (
              <div className="p-8 space-y-3.5 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Overview / Problem Statement
                  </label>
                  <textarea
                    name="overview"
                    value={formData.overview}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#E9E1FF] outline-none resize-none text-sm font-medium"
                    placeholder="Briefly describe the task objective and student expectations..."
                  ></textarea>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Steps to Complete
                    </label>
                    <button
                      type="button"
                      onClick={handleAddStep}
                      className="text-xs font-bold text-[#6D3DF5] hover:text-[#5B2FD6] flex items-center gap-1"
                    >
                      <Plus size={13} /> Add Step
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {newSteps.map((step, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="w-6 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500 font-bold text-xs shrink-0">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) =>
                            handleStepChange(index, e.target.value)
                          }
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#E9E1FF] outline-none text-xs"
                          placeholder={`Step ${index + 1}`}
                        />
                        {newSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(index)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Important Note (Optional)
                  </label>
                  <input
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#E9E1FF] outline-none text-xs font-medium"
                    placeholder="e.g. Ensure you follow security best practices."
                  />
                </div>

                {/* Task Materials & Assets Section */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip size={14} className="text-[#6D3DF5]" />
                      Materials & Assets
                    </h3>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>

                  {/* Drag and Drop / Click Upload Area */}
                  <label className="block border-2 border-dashed border-[#DDD6FE] hover:border-[#6D3DF5] bg-[#FAF8FF] hover:bg-[#F5F1FF] rounded-xl p-2.5 text-center cursor-pointer transition-all group">
                    <input
                      type="file"
                      multiple
                      onChange={handleMaterialFilesAdd}
                      className="hidden"
                      accept="image/*,.pdf,.csv,.xlsx,.xls,.zip,.rar,.tar,.gz,.txt,.docx,.doc"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                      <div className="w-5 h-5 rounded-md bg-white border border-[#EDE9FE] text-[#6D3DF5] flex items-center justify-center shrink-0">
                        <Upload size={12} />
                      </div>
                      <span>Upload reference files or datasets</span>
                      <span className="text-slate-400 font-normal text-[11px]">(ZIP, PDF, CSV, Images)</span>
                    </div>
                  </label>

                  {/* Existing & New Materials badges/list */}
                  {(existingMaterials.length > 0 || selectedMaterials.length > 0) && (
                    <div className="mt-2 space-y-1 max-h-20 overflow-y-auto pr-1">
                      {existingMaterials.map((mat, idx) => (
                        <div
                          key={`existing-${idx}`}
                          className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-slate-500">{getFileIcon(mat.name || mat.format)}</span>
                            <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                              {mat.name || "Task Document"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatBytes(mat.size)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingMaterial(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded"
                            title="Remove file"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      {selectedMaterials.map((file, idx) => (
                        <div
                          key={`new-${idx}`}
                          className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-violet-50/70 border border-violet-100 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[#6D3DF5]">{getFileIcon(file.name)}</span>
                            <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-[#6D3DF5]">
                              {formatBytes(file.size)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewMaterial(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded"
                            title="Remove file"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-3.5 border-t border-slate-100 flex justify-between items-center rounded-b-3xl shrink-0">
              {createModalStep === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-white hover:text-slate-700 border border-transparent hover:border-slate-200 transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.title?.trim() || !formData.role?.trim() || !formData.deadline) {
                        toast.error("Please fill in Title, Role, and Deadline.");
                        return;
                      }
                      const todayStr = getTodayStr();
                      if (formData.deadline < todayStr) {
                        toast.error("Deadline cannot be in the past. Please select today or a future date.");
                        return;
                      }
                      setCreateModalStep(2);
                    }}
                    className="px-5 py-2 rounded-xl font-bold bg-[#6D3DF5] text-white hover:bg-[#5B2FD6] shadow-md shadow-[#6D3DF5]/20 transition-all text-xs flex items-center gap-1.5"
                  >
                    <span>Next: Instructions & Assets</span>
                    <ChevronRight size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setCreateModalStep(1)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-white hover:text-slate-800 border border-slate-200 transition-all text-xs flex items-center gap-1.5"
                  >
                    <ChevronLeft size={14} />
                    <span>Back</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-3.5 py-2 rounded-xl font-bold text-slate-500 hover:bg-white hover:text-slate-700 border border-transparent hover:border-slate-200 transition-all text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePublish}
                      className="px-5 py-2 rounded-xl font-bold bg-[#6D3DF5] text-white hover:bg-[#5B2FD6] shadow-md shadow-[#6D3DF5]/20 transition-all text-xs flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>{editingId ? "Save Changes" : "Publish Task"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
