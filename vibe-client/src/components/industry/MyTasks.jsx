import React, { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
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
  Upload,
  BookOpen,
  AlertCircle,
  Trash2,
  Github,
  Youtube,
  Link as LinkIcon,
  File,
  Pencil,
  Sparkles,
  Layers,
  GraduationCap,
  RotateCcw,
} from "lucide-react";

export const MyTasks = ({
  tasks,
  onAddTask,
  onUpdateTask,
  applicants,
  onUpdateApplicantStatus,
  user,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTask, setActiveTask] = useState(null); // For Applicant View
  const [previewInstructions, setPreviewInstructions] = useState(null); // For Instruction Modal
  const [selectedApplicant, setSelectedApplicant] = useState(null); // For Submission Details Modal
  const [showApplicantsDrawer, setShowApplicantsDrawer] = useState(false); // Main Applicants Drawer
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

  // Helper to parse "30 Aug 2025" to "2025-08-30" for input type date
  const parseDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
    return "";
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
        return "bg-blue-100 text-blue-700 border border-blue-200";
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
        alert("Please fill interview date, time and mode.");
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
      <div className="fixed inset-0 z-50 flex items-stretch bg-slate-900/40 backdrop-blur-sm">
        <div className="ml-auto h-full w-full max-w-5xl bg-white rounded-l-3xl shadow-2xl border-l border-orange-100 flex flex-col">
          <div className="p-6 border-b border-orange-100 flex items-start justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
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

          <div className="p-6 overflow-auto">
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
                          <div className="flex items-center gap-3">
                            <img
                              src={a.avatar}
                              alt={a.name}
                              className="w-10 h-10 rounded-full border-2 border-orange-50 object-cover"
                            />
                            <div>
                              <div className="text-sm font-bold text-slate-900">
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
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200 transition-colors"
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
                              className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all flex items-center gap-2"
                            >
                              <FileText size={14} /> View Submission
                            </button>
                          </div>

                          {status === "APPLIED" && (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleStatusUpdate(a.id, "SHORTLISTED")}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
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
                                        value={interviewData.date}
                                        onChange={(e) =>
                                          setInterviewData((d) => ({
                                            ...d,
                                            date: e.target.value,
                                          }))
                                        }
                                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-slate-500">
                                        Interview Time
                                      </label>
                                      <input
                                        type="time"
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
    setFormData({
      title: task.title,
      role: task.role,
      category: task.category,
      deadline: parseDateForInput(task.deadline),
      payment: task.payment,
      type: task.type,
      skills: Array.isArray(task.skills) ? task.skills.join(", ") : task.skills,
      perks: Array.isArray(task.perks) ? task.perks.join(", ") : task.perks,
      overview: task.instructions.overview,
      note: task.instructions.note || "",
    });
    setNewSteps(
      task.instructions.steps.length > 0 ? task.instructions.steps : [""],
    );
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingId(null);
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
  };

  const handlePublish = () => {
    if (!formData.title || !formData.role || !formData.deadline) {
      alert("Please fill in the required fields (Title, Role, Deadline).");
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
      deadline: new Date(formData.deadline).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
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

  // ----------------------------------------------------------------------------------
  // VIEW: Instruction Preview Modal (Student Perspective)
  // ----------------------------------------------------------------------------------
  const InstructionModal = ({ task, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col relative overflow-hidden">
        {/* Modal Header - Fixed */}
        <div className="p-8 pb-4 bg-white border-b border-orange-50 shrink-0">
          <div className="flex justify-between items-start mb-2">
            <span className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">
              <BookOpen size={16} /> Task Instructions
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1">
            {task.title}
          </h2>
          <p className="text-slate-500 font-medium">{task.company}</p>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="overflow-y-auto p-8 pt-6 space-y-8">
          {/* Overview */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Overview</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {task.instructions?.overview || "No overview provided."}
            </p>
          </div>

          {/* Steps */}
          <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100/50">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              Steps to Complete
            </h3>
            <div className="space-y-4">
              {task.instructions?.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm shadow-sm shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 text-sm pt-1.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Perks & Benefits */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Perks & Benefits</h3>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(task.perks) ? task.perks : (task.perks?.split(',') || [])).map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-100 rounded-xl text-sm font-bold">
                  <Sparkles size={14} />
                  {perk.trim()}
                </div>
              ))}
              {(!task.perks || (Array.isArray(task.perks) && task.perks.length === 0)) && (
                <p className="text-slate-500 text-sm italic">No perks specified.</p>
              )}
            </div>
          </div>

          {/* Warning/Note */}
          {task.instructions?.note && (
            <div className="bg-blue-50 rounded-xl p-4 flex gap-3 border border-blue-100 text-blue-900">
              <AlertCircle
                size={20}
                className="shrink-0 text-blue-600 mt-0.5"
              />
              <p className="text-xs font-medium leading-relaxed">
                {task.instructions.note}
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Got it, close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ----------------------------------------------------------------------------------
  // VIEW: Submission Details Modal
  // ----------------------------------------------------------------------------------
  const SubmissionModal = ({ applicant, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-4 bg-white border-b border-orange-50 shrink-0">
          <div className="flex justify-between items-start mb-2">
            <span className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">
              <Check size={16} /> Solution Submitted
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {applicant.submission.projectTitle}
          </h2>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-slate-500 text-sm flex items-center gap-2">
              Submitted by{" "}
              <span className="font-bold text-slate-800">{applicant.name}</span> •{" "}
              {applicant.college}
            </p>
            {applicant.submission.githubLink && (
              <a
                href={applicant.submission.githubLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-colors"
                title="Open GitHub repository"
              >
                <Github size={14} /> View GitHub
              </a>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 pt-6 space-y-6">
          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Student Project Title</h3>
              <p className="text-slate-700 text-sm">
                {applicant.submission.projectTitle}
              </p>
            </div>
            {applicant.submission.githubLink && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-2">GitHub Repository</h3>
                <a
                  href={applicant.submission.githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-orange-700 hover:text-orange-800 underline break-all"
                >
                  {applicant.submission.githubLink}
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Description / Approach
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100">
              {applicant.submission.description}
            </div>
          </div>

          {/* Links Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Submitted Assets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Resume - NEW */}
              {applicant.resumeLink && (
                <a
                  href={applicant.resumeLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-violet-600 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-violet-700">
                      Submission URL
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      View Link
                    </p>
                  </div>
                  <ExternalLink
                    size={16}
                    className="text-slate-300 group-hover:text-violet-400"
                  />
                </a>
              )}

              {/* Github */}
              {applicant.submission.githubLink && (
                <a
                  href={applicant.submission.githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-orange-600 transition-colors">
                    <Github size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-orange-700">
                      GitHub Repository
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {applicant.submission.githubLink}
                    </p>
                  </div>
                  <ExternalLink
                    size={16}
                    className="text-slate-300 group-hover:text-orange-400"
                  />
                </a>
              )}

              {/* Video */}
              {applicant.submission.videoLink && (
                <a
                  href={applicant.submission.videoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-red-600 transition-colors">
                    <Youtube size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-red-700">
                      Video Demo
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {applicant.submission.videoLink}
                    </p>
                  </div>
                  <ExternalLink
                    size={16}
                    className="text-slate-300 group-hover:text-red-400"
                  />
                </a>
              )}

              {/* Drive */}
              {applicant.submission.driveLink && (
                <a
                  href={applicant.submission.driveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                    <File size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">
                      Additional Resources
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Google Drive
                    </p>
                  </div>
                  <ExternalLink
                    size={16}
                    className="text-slate-300 group-hover:text-blue-400"
                  />
                </a>
              )}

              {/* Other Links */}
              {applicant.submission.otherLinks?.filter(Boolean).map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-orange-600 transition-colors">
                    <LinkIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-orange-700">
                      Link #{i + 1}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{link}</p>
                  </div>
                  <ExternalLink
                    size={16}
                    className="text-slate-300 group-hover:text-orange-400"
                  />
                </a>
              ))}
              {/* Attachments */}
              {applicant.attachments?.filter(Boolean).map((url, i) => (
                <a
                  key={`att-${i}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                    <File size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700">
                      Attachment #{i + 1}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{url}</p>
                  </div>
                  <ExternalLink
                    size={16}
                    className="text-slate-300 group-hover:text-emerald-400"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
          {applicant.status === "Pending" ? (
            <>
              <button
                onClick={() => handleStatusUpdate(applicant.id, "Rejected")}
                className="px-6 py-2.5 rounded-xl font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all text-sm flex items-center gap-2"
              >
                Reject Solution
              </button>
              <button
                onClick={() => handleStatusUpdate(applicant.id, "Approved")}
                className="px-6 py-2.5 rounded-xl font-bold bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-all text-sm flex items-center gap-2"
              >
                <Check size={16} /> Approve Solution
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleStatusUpdate(applicant.id, "Pending")}
                className="px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-sm flex items-center gap-2"
                title="Undo Decision"
              >
                <RotateCcw size={16} /> Undo
              </button>
              <div
                className={`px-6 py-2.5 rounded-xl font-bold text-sm ${
                  applicant.status === "Approved"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {applicant.status === "Approved" ? "Accepted" : "Rejected"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // (Removed alternate applicant page; using single Drawer for applicants)

  // ----------------------------------------------------------------------------------
  // VIEW: Main Task List
  // ----------------------------------------------------------------------------------
  return (
    <div className="animate-in fade-in duration-500 relative pb-20">
      {/* Enhanced Animated Header */}
      <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl group-hover:bg-white/15 transition-all duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl group-hover:scale-110 transition-transform duration-1000"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3 animate-in slide-in-from-bottom-2 duration-700 delay-100">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg shadow-sm">
              <Layers size={20} className="text-white" />
            </div>
            <span className="font-bold tracking-widest uppercase text-xs bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              Task Management
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-in slide-in-from-bottom-3 duration-700 delay-200 drop-shadow-sm">
            Manage Your Industry
          </h1>
          <p className="text-orange-50 max-w-xl text-sm md:text-base font-medium leading-relaxed animate-in slide-in-from-bottom-4 duration-700 delay-300">
            Create new challenges, track applicant submissions in real-time, and
            discover the perfect talent for your next big project.
          </p>
        </div>
      </div>

      {/* Search Bar & Create Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full md:w-96 group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search tasks by title, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-orange-100 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-sm transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setShowCreateModal(true);
          }}
          className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-orange-400/20"
        >
          <Plus size={20} />{" "}
          <span className="whitespace-nowrap">Create New Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-[2rem] p-5 shadow-md border border-slate-100 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/10 hover:scale-[1.02] hover:ring-4 hover:ring-orange-500/20 transition-all duration-300 flex flex-col h-full group relative overflow-hidden"
            >
              {/* Top Row: Badges & Edit */}
              <div className="flex justify-between items-start mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                  {getCategoryIcon(task.category)}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {task.category}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(task)}
                      className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <Pencil size={14} />
                    </button>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                      <Globe size={12} />
                      <span className="text-xs font-bold">{task.type}</span>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      task.payment === "Paid"
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
                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {task.title}
                </h3>
              </div>

              {/* Role Info */}
              <div className="flex items-center gap-3 mb-3">
                <Briefcase size={16} className="text-orange-500 shrink-0" />
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
                <div className="flex items-start gap-2 p-3 bg-gradient-to-br from-orange-50 to-transparent border border-orange-100 rounded-xl">
                  <div className="p-1.5 bg-white rounded-lg text-orange-500 shadow-sm shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-orange-700 block mb-0.5">
                      Perks & Benefits
                    </span>
                    <p className="text-sm text-slate-600 leading-snug line-clamp-2">
                      {Array.isArray(task.perks) ? task.perks.join(", ") : task.perks}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer: Date & Buttons */}
              <div className="mt-auto pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-orange-400 text-sm font-bold mb-3">
                  <Calendar size={14} />{" "}
                  <span className="text-slate-500">Due {task.deadline}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPreviewInstructions(task)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-orange-200 text-orange-600 font-bold text-sm hover:bg-orange-50 transition-colors"
                  >
                    <FileText size={16} /> Instructions
                  </button>
                  <button
                    onClick={() => {
                      setActiveTask(task);
                      setShowApplicantsDrawer(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                  >
                    Applicants <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-70 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-orange-300" />
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
        />
      )}

      {/* Create/Edit Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white px-8 py-5 border-b border-orange-100 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {editingId ? (
                  <Pencil className="text-orange-500" />
                ) : (
                  <Plus className="text-orange-500" />
                )}
                {editingId ? "Edit Task" : "Create New Task"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Standard Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Task Title
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm font-medium"
                    placeholder="e.g. Backend API Development"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Role
                  </label>
                  <input
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm font-medium"
                    placeholder="e.g. Backend Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none bg-white text-sm font-medium appearance-none"
                    >
                      <option>Development</option>
                      <option>Design</option>
                      <option>Marketing</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight className="rotate-90" size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Deadline
                  </label>
                  <input
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm font-medium text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Payment Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="Paid"
                        checked={formData.payment === "Paid"}
                        onChange={(e) =>
                          handleRadioChange("payment", e.target.value)
                        }
                        className="accent-orange-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        Paid
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="Unpaid"
                        checked={formData.payment === "Unpaid"}
                        onChange={(e) =>
                          handleRadioChange("payment", e.target.value)
                        }
                        className="accent-orange-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        Unpaid
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Location
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="Remote"
                        checked={formData.type === "Remote"}
                        onChange={(e) =>
                          handleRadioChange("type", e.target.value)
                        }
                        className="accent-orange-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        Remote
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="Onsite"
                        checked={formData.type === "Onsite"}
                        onChange={(e) =>
                          handleRadioChange("type", e.target.value)
                        }
                        className="accent-orange-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        Onsite
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Skills & Perks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Required Skills
                  </label>
                  <input
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm font-medium"
                    placeholder="e.g. React, Figma"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Perks
                  </label>
                  <input
                    name="perks"
                    value={formData.perks}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm font-medium"
                    placeholder="e.g. Certificate, Stipend"
                  />
                </div>
              </div>

              {/* Detailed Instructions Section */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-orange-500" />
                  Task Instructions for Students
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Overview / Problem Statement
                    </label>
                    <textarea
                      name="overview"
                      value={formData.overview}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none resize-none text-sm font-medium"
                      placeholder="Briefly describe the task..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Steps to Complete
                    </label>
                    <div className="space-y-2">
                      {newSteps.map((step, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="w-8 h-10 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500 font-bold text-sm shrink-0">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) =>
                              handleStepChange(index, e.target.value)
                            }
                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                            placeholder={`Step ${index + 1}`}
                          />
                          {newSteps.length > 1 && (
                            <button
                              onClick={() => handleRemoveStep(index)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleAddStep}
                      className="mt-3 text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Step
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Important Note (Optional)
                    </label>
                    <input
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm font-medium"
                      placeholder="e.g. Ensure you follow security best practices."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-8 py-5 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-white hover:text-slate-700 border border-transparent hover:border-slate-200 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="px-6 py-2.5 rounded-xl font-bold bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-all text-sm flex items-center gap-2"
              >
                <Check size={16} />{" "}
                {editingId ? "Save Changes" : "Publish Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
