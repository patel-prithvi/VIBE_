import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../shared/Avatar';
import { useToast } from '../Toast';
import {
  ShieldCheck,
  Zap,
  Star,
  Target,
  Award,
  ExternalLink,
  Share2,
  Download,
  Briefcase,
  Code2,
  CheckCircle,
  MapPin,
  Github,
  Linkedin,
  GraduationCap,
  Building,
  Quote,
  ChevronDown,
  Layers,
  GitBranch,
  Palette,
  Brain,
  Users,
  Wrench,
  Terminal,
  Database,
  Plus,
  Trash2,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  Loader2,
  Clock,
} from 'lucide-react';
import api from "../../services/api";
import { auth } from "../../utils/auth";
import { SkillVerificationModal } from "./SkillVerificationModal";
import { SkillFeedbackModal } from "./SkillFeedbackModal";

const POPULAR_SKILLS = {
  Technical: [
    "React.js",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Express.js",
    "Python",
    "Java",
    "C++",
    "Data Structures & Algorithms",
    "MongoDB",
    "SQL / PostgreSQL",
    "REST APIs",
    "Tailwind CSS",
    "Next.js",
    "Docker",
  ],
  Tools: [
    "Git & GitHub",
    "VS Code",
    "Figma & UI/UX Design",
    "Postman",
    "Linux / Bash",
    "Jira",
    "Vite",
  ],
  "Soft Skills": [
    "Problem Solving",
    "Team Collaboration",
    "Communication",
    "Time Management",
    "Critical Thinking",
    "Adaptability",
    "Leadership",
  ],
};

export const VirtualCVView = ({ user, onBackToFeed }) => {
  const toast = useToast();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentUser = auth.getCurrentUser();
  const currentUserId = currentUser?._id || currentUser?.id;
  const targetUserId = user?._id || user?.id;
  const effectiveUserId = targetUserId || currentUserId;
  const isOwner = !targetUserId || String(targetUserId) === String(currentUserId);

  // Separate modal states: Add New Skill vs Configure Skills
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);

  // Skill Verification states
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [activeVerificationAttempt, setActiveVerificationAttempt] = useState(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [feedbackAttempt, setFeedbackAttempt] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [verifyingSkillName, setVerifyingSkillName] = useState(null);

  // Add Skill state
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Technical");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");
  const [savingAddSkill, setSavingAddSkill] = useState(false);

  // Configure Skills state
  const [editingSkills, setEditingSkills] = useState([]);
  const [configureFilterCategory, setConfigureFilterCategory] = useState("All");
  const [savingConfigureSkills, setSavingConfigureSkills] = useState(false);

  const fetchStudentAttempts = useCallback(async () => {
    if (!isOwner) return;
    try {
      const res = await api.get("/skill-verification/student/active");
      if (res.data?.success) {
        setStudentAttempts(res.data.data || []);
      }
    } catch (err) {
      console.warn("Could not load student verification attempts:", err);
    }
  }, [isOwner]);

  useEffect(() => {
    fetchStudentAttempts();
  }, [fetchStudentAttempts]);

  const attemptsBySkill = useMemo(() => {
    const map = {};
    studentAttempts.forEach((att) => {
      if (att.skillName) {
        map[att.skillName.toLowerCase().trim()] = att;
      }
    });
    return map;
  }, [studentAttempts]);

  const handleInitiateVerification = async (skillName, skillLevel = "Intermediate") => {
    try {
      setVerifyingSkillName(skillName);
      const res = await api.post("/skill-verification/request", {
        skillName,
        difficulty: skillLevel,
      });
      if (res.data?.success) {
        const attemptData = res.data.data;
        setActiveVerificationAttempt(attemptData);
        setIsVerificationModalOpen(true);
        await fetchStudentAttempts();
      }
    } catch (err) {
      console.error("Verification initiation error:", err);
      toast.error(err.response?.data?.message || "Failed to initiate verification task");
    } finally {
      setVerifyingSkillName(null);
    }
  };

  useEffect(() => {
    const fetchVirtualResume = async () => {
      const uid = effectiveUserId;
      if (!uid) return;
      try {
        setLoading(true);
        const res = await api.get(`/virtual-resume/${uid}`);
        if (res.data?.data) {
          setResumeData(res.data.data);
        }
      } catch (err) {
        console.warn("Could not load backend virtual resume, using profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVirtualResume();
  }, [effectiveUserId]);

  const displayName = user?.name || currentUser?.name || "Student";
  const displayAvatar = user?.ImageUrl || user?.avatar || currentUser?.ImageUrl;
  const institute = user?.Profile?.InstituteName || currentUser?.Profile?.InstituteName || "VIBE Institute of Technology";
  const branch = user?.Profile?.Branch || user?.Profile?.branch || currentUser?.Profile?.branch || "Computer Science";
  const year = user?.Profile?.YearOfStudy || user?.Profile?.currentYear || currentUser?.Profile?.yearOfStudy || "3rd Year";

  // Merged skills: prioritize backend skills if present, or standard academic skill categories
  const backendSkills = resumeData?.skills || [];
  const hasCustomSkills = Boolean(resumeData?.hasCustomSkills || (backendSkills.length > 0 && resumeData?.hasCustomSkills !== false));

  const defaultSkills = [
    { name: "React.js", category: "Technical", level: "Advanced", score: 92, verified: true },
    { name: "JavaScript / TypeScript", category: "Technical", level: "Advanced", score: 85, verified: true },
    { name: "Node.js & Express", category: "Technical", level: "Intermediate", score: 78, verified: true },
    { name: "Data Structures & Algorithms", category: "Technical", level: "Intermediate", score: 82, verified: true },
    { name: "Git & Version Control", category: "Tools", level: "Advanced", score: 95, verified: true },
    { name: "Figma & UI/UX Design", category: "Tools", level: "Intermediate", score: 88, verified: false },
    { name: "Problem Solving", category: "Soft Skills", level: "Advanced", score: 90, verified: true },
    { name: "Team Collaboration", category: "Soft Skills", level: "Advanced", score: 90, verified: true },
  ];

  const displayedSkills =
    backendSkills.length > 0
      ? backendSkills.map((s) => ({
          name: typeof s === "string" ? s : s.name,
          category: s.category || "Technical",
          level: s.level || "Intermediate",
          score: typeof s.score === "number" ? s.score : 85,
          verified: Boolean(s.verified),
        }))
      : defaultSkills;

  // Helper to persist updated skills to backend
  const saveSkillsToBackend = async (skillsToSave) => {
    if (!effectiveUserId) throw new Error("User ID not found");
    try {
      const res = await api.put(`/virtual-resume/${effectiveUserId}/skills`, {
        skills: skillsToSave,
      });
      return res.data?.data?.skills || skillsToSave;
    } catch (err) {
      console.warn("Primary skills update failed, trying fallback /users endpoint:", err);
      await api.put(`/users/${effectiveUserId}`, { skills: skillsToSave });
      return skillsToSave;
    }
  };

  // Open "Add New Skill" modal
  const handleOpenAddModal = (initialCategory = "Technical") => {
    setNewSkillCategory(initialCategory);
    setNewSkillName("");
    setNewSkillLevel("Intermediate");
    setIsConfigureModalOpen(false);
    setIsAddModalOpen(true);
  };

  // Open "Configure Skills" modal
  const handleOpenConfigureModal = (initialCategory = "All") => {
    const list = displayedSkills.map((s) => ({
      name: typeof s === "string" ? s : s.name,
      category: s.category || "Technical",
      level: s.level || "Intermediate",
      score: typeof s.score === "number" ? s.score : 85,
      verified: Boolean(s.verified),
    }));
    setEditingSkills(list);
    setConfigureFilterCategory(initialCategory);
    setIsAddModalOpen(false);
    setIsConfigureModalOpen(true);
  };

  // Backward compatibility alias
  const handleOpenSkillsModal = (initialCategory = "Technical") => {
    handleOpenAddModal(initialCategory);
  };

  // Add new skill handler
  const handleAddNewSkill = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newSkillName.trim();
    if (!trimmed) {
      toast.error("Please enter a skill name");
      return;
    }
    const alreadyExists = displayedSkills.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyExists) {
      toast.info(`"${trimmed}" is already in your skills list.`);
      return;
    }

    const newSkillItem = {
      name: trimmed,
      category: newSkillCategory,
      level: newSkillLevel,
      score: newSkillLevel === "Expert" ? 95 : newSkillLevel === "Advanced" ? 90 : 80,
      verified: false,
    };

    const updatedSkills = [newSkillItem, ...displayedSkills];

    try {
      setSavingAddSkill(true);
      const saved = await saveSkillsToBackend(updatedSkills);
      setResumeData((prev) => ({
        ...prev,
        skills: saved,
        hasCustomSkills: true,
      }));
      setNewSkillName("");
      setIsAddModalOpen(false);
      toast.success(`"${trimmed}" added! Generating your verification task...`);
      // Automatically trigger task assignment for the new skill
      handleInitiateVerification(trimmed, newSkillLevel);
    } catch (err) {
      console.error("Add skill error:", err);
      toast.error(err.response?.data?.message || "Failed to add skill");
    } finally {
      setSavingAddSkill(false);
    }
  };

  // Configure modal handlers
  const handleRemoveFromEditing = (skillNameToRemove) => {
    setEditingSkills((prev) => prev.filter((s) => s.name !== skillNameToRemove));
  };

  const handleLoadStarterTemplate = () => {
    setEditingSkills([...defaultSkills]);
    toast.info("Loaded starter skills template into configuration");
  };

  const handleClearAllSkills = () => {
    setEditingSkills([]);
    toast.info("Cleared all skills in configuration");
  };

  const handleSaveConfigureSkills = async () => {
    if (!effectiveUserId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    try {
      setSavingConfigureSkills(true);
      const savedSkills = await saveSkillsToBackend(editingSkills);
      setResumeData((prev) => ({
        ...prev,
        skills: savedSkills,
        hasCustomSkills: true,
      }));
      setIsConfigureModalOpen(false);
      toast.success("Skills matrix configured successfully!");
    } catch (err) {
      console.error("Save configured skills error:", err);
      toast.error(err.response?.data?.message || "Failed to save skills configuration");
    } finally {
      setSavingConfigureSkills(false);
    }
  };

  const handleQuickDeleteSkill = async (skillNameToDelete) => {
    if (!isOwner || !effectiveUserId) return;
    const updated = displayedSkills.filter((s) => s.name !== skillNameToDelete);

    setResumeData((prev) => ({
      ...prev,
      skills: updated,
      hasCustomSkills: true,
    }));

    try {
      await saveSkillsToBackend(updated);
      toast.success(`Removed "${skillNameToDelete}"`);
    } catch (err) {
      console.warn("Could not save deleted skill to backend:", err);
    }
  };

  // Experience section expansion state
  const [showAllExperience, setShowAllExperience] = useState(false);

  // Real or simulated experience/tasks (latest first)
  const rawBackendExperience = resumeData?.experience || [];
  const displayedExperience =
    rawBackendExperience.length > 0
      ? [...rawBackendExperience]
          .sort((a, b) => {
            if (a.completedAt && b.completedAt) {
              return new Date(b.completedAt) - new Date(a.completedAt);
            }
            return 0;
          })
          .map((exp, idx) => ({
            id: String(idx),
            role: exp.taskTitle || "Industry Challenge",
            company: "VIBE Partner Organization",
            duration: exp.completedAt ? new Date(exp.completedAt).toLocaleDateString() : "Recent",
            description: exp.problemStatement || "Completed real industry task requirements with verified submission.",
            verified: true,
            techStack: Array.isArray(exp.techStack) ? exp.techStack : [],
          }))
      : [
          {
            id: "1",
            role: "Full-Stack Development Contributor",
            company: "Academic Project & Industry Tasks",
            duration: "2025 - Present",
            description: "Developed modern web application modules using React and Node.js with component-based architecture.",
            verified: true,
            techStack: ["React", "Tailwind CSS", "REST APIs"],
          },
          {
            id: "2",
            role: "Frontend UI Engineering Intern",
            company: "TechFlow Solutions",
            duration: "Summer 2024",
            description: "Built accessible responsive components, optimized bundle size and integrated RESTful endpoints.",
            verified: true,
            techStack: ["React", "TypeScript", "Tailwind CSS"],
          },
          {
            id: "3",
            role: "Open Source Contributor & Peer Mentor",
            company: "VIBE Community",
            duration: "Early 2024",
            description: "Mentored student developers on version control workflows and participated in open-source sprint challenges.",
            verified: true,
            techStack: ["Git", "GitHub", "JavaScript"],
          },
          {
            id: "4",
            role: "Backend API Challenge Participant",
            company: "CloudScale Systems",
            duration: "Late 2023",
            description: "Designed secure JWT authentication services and MongoDB schema indexing for high throughput.",
            verified: true,
            techStack: ["Node.js", "Express", "MongoDB"],
          },
          {
            id: "5",
            role: "Hackathon Finalist - Smart Campus App",
            company: "VIBE Innovation Summit",
            duration: "Mid 2023",
            description: "Led a 4-person team to prototype an interactive campus tracking dashboard that won top 5 rank.",
            verified: true,
            techStack: ["React Native", "Firebase", "Figma"],
          },
        ];

  const visibleExperience = showAllExperience
    ? displayedExperience
    : displayedExperience.slice(0, 3);
  const hasMoreExperience = displayedExperience.length > 3;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("CV link copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const skillCategories = ["Technical", "Tools", "Soft Skills"];

  const [openCategories, setOpenCategories] = useState({
    Technical: true,
    Tools: false,
    "Soft Skills": false,
  });

  const toggleCategory = (cat) => {
    setOpenCategories((prev) => {
      const current = prev[cat] ?? (cat === "Technical");
      return {
        ...prev,
        [cat]: !current,
      };
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. CV Header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto">
          {/* Avatar with Purple Theme */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#6D3DF5] p-0.5 shadow-sm">
              <Avatar
                name={displayName}
                src={displayAvatar}
                variant="purple"
                className="w-full h-full rounded-[14px]"
                initialsClassName="text-xl md:text-2xl text-white font-bold"
              />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-white text-[#16A34A] border border-[#E1E8F2] flex items-center justify-center shadow-xs">
              <ShieldCheck size={15} />
            </div>
          </div>

          {/* Details & Info */}
          <div className="text-center md:text-left space-y-1 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold text-[#172554] tracking-tight">{displayName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F2ECFF] text-[#6D3DF5] text-[10px] font-bold uppercase tracking-wider border border-[#E9E1FF]">
                Verified Student
              </span>
            </div>
            <p className="text-[#64748B] font-medium text-xs md:text-sm">
              B.Tech in Computer Science Engineering • 3rd Year
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#94A3B8]" /> Gujarat, India</span>
              <span className="flex items-center gap-1.5 text-[#16A34A]"><CheckCircle size={13} /> Available for Internship</span>
            </div>

            {/* Social Links & Actions */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2.5">
              <div className="flex gap-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E1E8F2] text-[#475569] hover:text-[#6D3DF5] hover:border-[#E9E1FF] hover:bg-[#F2ECFF] flex items-center justify-center transition-all"
                >
                  <Github size={16} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E1E8F2] text-[#475569] hover:text-[#6D3DF5] hover:border-[#E9E1FF] hover:bg-[#F2ECFF] flex items-center justify-center transition-all"
                >
                  <Linkedin size={16} />
                </a>
              </div>
              <button onClick={handleCopyLink} className="flex items-center gap-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all">
                <Share2 size={14} /> Share Profile
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-[#F2ECFF] text-[#172554] hover:text-[#6D3DF5] border border-[#E1E8F2] px-5 py-2.5 rounded-xl text-xs font-bold transition-all">
                <Download size={14} /> Export CV
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <GraduationCap size={15} className="text-[#6D3DF5]" />
              <span>{branch} • {year}</span>
            </p>
            <p className="text-xs text-[#64748B] flex items-center justify-center sm:justify-start gap-1.5">
              <Building size={14} className="text-[#94A3B8]" />
              <span>{institute}</span>
            </p>
          </div>
        </div>

        {/* Credibility Score */}
        <div className="w-full md:w-auto flex-shrink-0 bg-[#F8FAFC] border border-[#E1E8F0] rounded-2xl px-6 py-4 text-center min-w-[160px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">Credibility Score</span>
          <div className="text-3xl font-black text-[#172554] tracking-tight mb-2">940</div>
          <div className="h-2 w-full bg-[#E9E1FF] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-[#6D3DF5] rounded-full"
            />
          </div>
        </div>
      </motion.section>

      {/* 2. Performance Snapshot */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        <StatCard icon={Briefcase} label="Internships" value="3" color="orange" />
        <StatCard icon={Target} label="Task Accuracy" value="98%" color="emerald" />
        <StatCard icon={Star} label="Mentor Rating" value="4.9" color="amber" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Skills Matrix */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] flex items-center justify-center flex-shrink-0">
                <Zap size={18} />
              </div>
              <h3 className="text-lg font-bold text-[#172554]">Skills Matrix</h3>
            </div>
            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenConfigureModal()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#475569] bg-[#F8FAFC] hover:bg-[#F1F5F9] hover:text-[#172554] border border-[#E2E8F0] px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Configure and manage existing skills"
                >
                  <SlidersHorizontal size={13} />
                  <span>Configure Skills</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#6D3DF5] hover:bg-[#5B2FD6] px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Add new skills to your matrix"
                >
                  <Plus size={14} />
                  <span>Add Skill</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
            {skillCategories.map((cat, idx) => {
              const isExpanded = openCategories[cat] ?? (cat === "Technical");
              const categorySkills = displayedSkills.filter((s) => s.category === cat);

              return (
                <div key={cat} className={`space-y-2.5 ${idx > 0 ? "pt-3 border-t border-[#F1F5F9]" : ""}`}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center justify-between py-1 px-1 rounded-lg text-left hover:bg-[#F8FAFC] transition-colors group select-none cursor-pointer"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="text-[11px] font-bold text-[#64748B] group-hover:text-[#172554] uppercase tracking-widest transition-colors">
                        {cat}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F1F5F9] group-hover:bg-[#E9E1FF] group-hover:text-[#6D3DF5] text-[#64748B] transition-colors">
                        {categorySkills.length}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[#94A3B8] group-hover:text-[#6D3DF5]"
                    >
                      <ChevronDown size={15} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key={`cat-content-${cat}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden space-y-2"
                      >
                        {categorySkills.length === 0 ? (
                          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center">
                            <p className="text-[11px] text-[#94A3B8]">
                              No {cat.toLowerCase()} skills added yet.
                            </p>
                          </div>
                        ) : (
                          categorySkills.map((skill) => {
                            const attempt = attemptsBySkill[skill.name.toLowerCase().trim()];
                            const isVerified = Boolean(
                              skill.verified ||
                                (attempt &&
                                  (attempt.status === "approved" ||
                                    attempt.review?.decision === "approved"))
                            );

                            return (
                              <div
                                key={skill.name}
                                className="group/skill flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/60 hover:border-[#E9E1FF] hover:bg-[#FDFBFF] transition-all"
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <SkillIcon name={skill.name} category={cat} />
                                  <span className="text-xs font-semibold text-[#172554] truncate flex items-center gap-1.5">
                                    {skill.name}
                                    {isVerified && (
                                      <ShieldCheck
                                        size={14}
                                        className="text-emerald-600 shrink-0"
                                        title="Verified Credential"
                                      />
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Verification Status Action / Badge */}
                                  {isVerified ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFeedbackAttempt(
                                          attempt || {
                                            skillName: skill.name,
                                            score: skill.score || 85,
                                            review: {
                                              decision: "approved",
                                              score: skill.score || 85,
                                              pros: [
                                                "Audited by Verified Faculty Reviewer",
                                                "Meets implementation benchmark (>= 70%)",
                                              ],
                                            },
                                          }
                                        );
                                        setIsFeedbackModalOpen(true);
                                      }}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
                                      title="View verified credential proof"
                                    >
                                      <ShieldCheck size={12} className="text-emerald-600" />
                                      <span>Verified {skill.score ? `• ${skill.score}%` : ""}</span>
                                    </button>
                                  ) : attempt && attempt.status === "assigned" ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveVerificationAttempt(attempt);
                                        setIsVerificationModalOpen(true);
                                      }}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] text-[10px] font-bold hover:bg-[#6D3DF5] hover:text-white transition-all cursor-pointer"
                                      title="Task assigned! Click to view details and submit"
                                    >
                                      <Zap size={11} />
                                      <span>Complete Task</span>
                                    </button>
                                  ) : attempt &&
                                    (attempt.status === "under_review" ||
                                      attempt.status === "submitted") ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveVerificationAttempt(attempt);
                                        setIsVerificationModalOpen(true);
                                      }}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold hover:bg-amber-100 transition-all cursor-pointer"
                                      title="Under double-blind mentor evaluation"
                                    >
                                      <Clock size={11} />
                                      <span>Under Review</span>
                                    </button>
                                  ) : attempt && attempt.status === "rejected" ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFeedbackAttempt(attempt);
                                        setIsFeedbackModalOpen(true);
                                      }}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold hover:bg-rose-100 transition-all cursor-pointer"
                                      title="Needs revision (< 70%). Click to view feedback and retry."
                                    >
                                      <RotateCcw size={11} />
                                      <span>Needs Revision</span>
                                    </button>
                                  ) : (
                                    isOwner && (
                                      <button
                                        type="button"
                                        disabled={verifyingSkillName === skill.name}
                                        onClick={() =>
                                          handleInitiateVerification(skill.name, skill.level)
                                        }
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-[#6D3DF5] border border-[#CBD5E1] hover:border-[#6D3DF5] hover:bg-[#FAF5FF] text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
                                        title="Verify skill with an automated proof-of-work task"
                                      >
                                        {verifyingSkillName === skill.name ? (
                                          <Loader2 size={11} className="animate-spin" />
                                        ) : (
                                          <Zap size={11} />
                                        )}
                                        <span>Verify</span>
                                      </button>
                                    )
                                  )}

                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] uppercase tracking-wider">
                                    {skill.level || "Intermediate"}
                                  </span>

                                  {isOwner && (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickDeleteSkill(skill.name)}
                                      className="opacity-0 group-hover/skill:opacity-100 p-1 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                                      title={`Remove ${skill.name}`}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}

                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleOpenAddModal(cat)}
                            className="w-full py-1.5 px-2 rounded-xl border border-dashed border-[#CBD5E1] hover:border-[#6D3DF5] bg-white hover:bg-[#F8FAFF] text-[11px] font-bold text-[#64748B] hover:text-[#6D3DF5] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Add {cat} Skill</span>
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-[#64748B]">
            Tailored for tech roles and verified industry internship tasks.
          </p>
        </div>

        {/* 4. Experience Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                <Briefcase size={18} />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#172554]">Experience</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
                  {displayedExperience.length}
                </span>
              </div>
            </div>

            {hasMoreExperience && (
              <button
                type="button"
                onClick={() => setShowAllExperience((prev) => !prev)}
                className="text-xs font-bold text-[#6D3DF5] hover:text-[#5B2FD6] bg-[#F2ECFF] hover:bg-[#E9E1FF] px-3 py-1.5 rounded-xl border border-[#E9E1FF] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <span>{showAllExperience ? "Show Less" : `Show All (${displayedExperience.length})`}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${showAllExperience ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {visibleExperience.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex gap-4 group"
              >
                <div className="hidden sm:flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${exp.verified ? 'bg-[#6D3DF5] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                    {exp.company[0]}
                  </div>
                  {idx < visibleExperience.length - 1 && <div className="w-0.5 h-full bg-[#F1F5F9] my-3" />}
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-[#172554] group-hover:text-[#6D3DF5] transition-colors">{exp.role}</h4>
                      <div className="flex items-center gap-2 text-[#6D3DF5] font-bold text-xs mt-0.5">
                        {exp.company}
                        {exp.verified && <span className="bg-[#F3EEFF] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Verified By Vibe</span>}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E1E8F0] px-2.5 py-1 rounded-full shrink-0">{exp.duration}</span>
                  </div>
                  <p className="text-[#64748B] leading-relaxed text-xs">{exp.description}</p>
                  {exp.techStack && exp.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {exp.techStack.map((t) => (
                        <span key={t} className="px-2.5 py-1 bg-[#F3EEFF] text-[#6D3DF5] text-[10px] font-bold uppercase tracking-wider rounded-lg">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {hasMoreExperience && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllExperience((prev) => !prev)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#6D3DF5] hover:bg-[#F8FAFF] text-xs font-bold text-[#64748B] hover:text-[#6D3DF5] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>
                    {showAllExperience
                      ? "Show Less (Latest 3)"
                      : `Show All Experiences (+${displayedExperience.length - 3} more)`}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 group-hover:translate-y-0.5 ${showAllExperience ? "rotate-180 group-hover:-translate-y-0.5" : ""}`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Mentor Highlights */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FDF2F8] text-[#DB2777] border border-[#FCE7F3] flex items-center justify-center flex-shrink-0">
            <Quote size={18} />
          </div>
          <h3 className="text-lg font-bold text-[#172554]">Mentor Highlights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] shrink-0 overflow-hidden">
              <img src="https://picsum.photos/seed/mentor1/200" alt="Mentor" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2.5 min-w-0">
              <p className="text-xs text-[#475569] italic leading-relaxed">"Parth consistently delivers high-quality work. His attention to detail in UI performance is exceptional for a student."</p>
              <div>
                <h5 className="font-bold text-[#172554] text-xs">Prof. Anjali Sharma</h5>
                <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">HOD, Computer Engineering</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] shrink-0 overflow-hidden">
              <img src="https://picsum.photos/seed/mentor2/200" alt="Mentor" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2.5 min-w-0">
              <p className="text-xs text-[#475569] italic leading-relaxed">"Impressive growth in his React skills. He managed to solve complex state management issues during the hackathon."</p>
              <div>
                <h5 className="font-bold text-[#172554] text-xs">Rahul Verma</h5>
                <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">Lead Engineer @ TechFlow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <p className="text-center text-xs text-[#94A3B8]">Syncing with verified records…</p>
      )}

      {/* 7. Modal 1: Add New Skill Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl w-full max-w-lg flex flex-col shadow-2xl border border-[#E1E8F2] overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 md:p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-gradient-to-r from-[#FAF8FF] to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] flex items-center justify-center shrink-0">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#172554]">Add New Skill</h3>
                    <p className="text-xs text-[#64748B]">
                      Add technical, tools, or soft skills directly to your verified profile
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#172554] hover:bg-[#F8FAFC] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAddNewSkill} className="p-5 md:p-6 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
                {/* Category Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569]">Select Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Technical", "Tools", "Soft Skills"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewSkillCategory(cat)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          newSkillCategory === cat
                            ? "bg-[#6D3DF5] text-white border-[#6D3DF5] shadow-xs"
                            : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569]">Proficiency Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Beginner", "Intermediate", "Advanced", "Expert"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewSkillLevel(lvl)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                          newSkillLevel === lvl
                            ? "bg-[#172554] text-white border-[#172554] shadow-xs"
                            : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-white"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skill Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569]">Skill Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder={`e.g. ${newSkillCategory === "Technical" ? "React, Python, TypeScript, GraphQL..." : newSkillCategory === "Tools" ? "Git, Figma, Docker, Postman..." : "Problem Solving, Leadership, Teamwork..."}`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8]"
                    />
                    {newSkillName && (
                      <button
                        type="button"
                        onClick={() => setNewSkillName("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Suggestions */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      Popular {newSkillCategory} Suggestions
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">Click to select</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {(POPULAR_SKILLS[newSkillCategory] || []).map((suggestion) => {
                      const isAdded = displayedSkills.some(
                        (s) => s.name.toLowerCase() === suggestion.toLowerCase()
                      );
                      const isCurrentInput = newSkillName.toLowerCase() === suggestion.toLowerCase();

                      return (
                        <button
                          key={suggestion}
                          type="button"
                          disabled={isAdded}
                          onClick={() => setNewSkillName(suggestion)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            isAdded
                              ? "bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed opacity-60"
                              : isCurrentInput
                              ? "bg-[#F2ECFF] text-[#6D3DF5] border-[#6D3DF5] shadow-xs"
                              : "bg-white text-[#475569] border-[#E2E8F0] hover:border-[#6D3DF5] hover:text-[#6D3DF5]"
                          }`}
                        >
                          {isAdded ? `✓ ${suggestion}` : `+ ${suggestion}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      handleOpenConfigureModal();
                    }}
                    className="text-xs font-bold text-[#6D3DF5] hover:underline flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <SlidersHorizontal size={13} />
                    <span>Configure Existing ({displayedSkills.length})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingAddSkill || !newSkillName.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingAddSkill ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Adding…</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Add Skill</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Modal 2: Configure Skills Modal */}
      <AnimatePresence>
        {isConfigureModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E1E8F2] overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 md:p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-gradient-to-r from-[#FAF8FF] to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] flex items-center justify-center shrink-0">
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#172554]">Configure Skills</h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#F2ECFF] text-[#6D3DF5] text-[11px] font-bold">
                        {editingSkills.length} configured
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      Review, filter, remove, or reset skills on your verified virtual CV
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConfigureModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#172554] hover:bg-[#F8FAFC] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Filter Tabs & Quick Actions */}
              <div className="px-5 md:px-6 pt-4 pb-2 border-b border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2 bg-[#F8FAFC]">
                {/* Category Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {["All", "Technical", "Tools", "Soft Skills"].map((cat) => {
                    const count =
                      cat === "All"
                        ? editingSkills.length
                        : editingSkills.filter((s) => s.category === cat).length;
                    const isActive = configureFilterCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setConfigureFilterCategory(cat)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
                          isActive
                            ? "bg-[#6D3DF5] text-white border-[#6D3DF5] shadow-xs"
                            : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#CBD5E1]"
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Quick Reset / Clear */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadStarterTemplate}
                    className="text-[10px] font-bold text-[#6D3DF5] hover:underline cursor-pointer flex items-center gap-1"
                    title="Load standard starter set"
                  >
                    <RotateCcw size={11} /> Starter Set
                  </button>
                  {editingSkills.length > 0 && (
                    <>
                      <span className="text-[#CBD5E1]">•</span>
                      <button
                        type="button"
                        onClick={handleClearAllSkills}
                        className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer flex items-center gap-1"
                        title="Clear all skills"
                      >
                        <Trash2 size={11} /> Clear All
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Skills List Body */}
              <div className="p-5 md:p-6 overflow-y-auto space-y-2 flex-1 custom-scrollbar">
                {(() => {
                  const filteredSkills =
                    configureFilterCategory === "All"
                      ? editingSkills
                      : editingSkills.filter((s) => s.category === configureFilterCategory);

                  if (editingSkills.length === 0) {
                    return (
                      <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F2ECFF] text-[#6D3DF5] flex items-center justify-center">
                          <Zap size={22} />
                        </div>
                        <p className="text-xs text-[#64748B] font-medium">
                          Your skills matrix is currently empty.
                        </p>
                        <button
                          type="button"
                          onClick={handleLoadStarterTemplate}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D3DF5] bg-[#F2ECFF] px-4 py-2 rounded-xl border border-[#E9E1FF] hover:bg-[#E9E1FF] transition-colors cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          <span>Load Recommended Starter Set</span>
                        </button>
                      </div>
                    );
                  }

                  if (filteredSkills.length === 0) {
                    return (
                      <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center space-y-2">
                        <p className="text-xs text-[#64748B] font-medium">
                          No {configureFilterCategory.toLowerCase()} skills found in your configured matrix.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsConfigureModalOpen(false);
                            handleOpenAddModal(configureFilterCategory);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D3DF5] hover:underline cursor-pointer"
                        >
                          <Plus size={13} /> Add {configureFilterCategory} Skill
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-1.5">
                      {filteredSkills.map((s, idx) => (
                        <div
                          key={`${s.name}-${idx}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-xs transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <SkillIcon name={s.name} category={s.category} />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-[#172554] block truncate">
                                {s.name}
                              </span>
                              <span className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider">
                                {s.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] uppercase tracking-wider">
                              {s.level || "Intermediate"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromEditing(s.name)}
                              className="p-1.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title={`Remove ${s.name}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:p-5 border-t border-[#F1F5F9] bg-[#FAF8FF] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsConfigureModalOpen(false);
                    handleOpenAddModal();
                  }}
                  className="text-xs font-bold text-[#6D3DF5] hover:underline flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <Plus size={14} />
                  <span>Add New Skill</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigureModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={savingConfigureSkills}
                    onClick={handleSaveConfigureSkills}
                    className="px-5 py-2.5 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {savingConfigureSkills ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Saving Changes…</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skill Verification Task Modal */}
      <SkillVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        activeAttempt={activeVerificationAttempt}
        onSubmissionSuccess={() => {
          fetchStudentAttempts();
        }}
      />

      {/* Skill Feedback & Proof Modal */}
      <SkillFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        attempt={feedbackAttempt}
        onRetry={(skillName, difficulty) => {
          handleInitiateVerification(skillName, difficulty);
        }}
      />
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    orange: 'bg-[#F3EEFF] text-[#6D3DF5]',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-[#FFFBEB] text-[#D97706]',
  };

  return (
    <div
      className="bg-white p-5 rounded-2xl border border-[#E1E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color] || colors.orange}`}>
        <Icon size={22} />
      </div>
      <div>
        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">{label}</span>
        <span className="text-2xl font-black text-[#172554] tracking-tight">{value}</span>
      </div>
    </div>
  );
};

const SkillIcon = ({ name = '', category = '' }) => {
  const lower = name.toLowerCase();

  // 1. React
  if (lower.includes('react')) {
    return (
      <div className="w-6 h-6 rounded-md bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0 border border-[#BAE6FD]">
        <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-3.5 h-3.5 fill-current">
          <circle cx="0" cy="0" r="2.05" fill="#0284C7" />
          <g stroke="#0284C7" strokeWidth="1" fill="none">
            <ellipse rx="11" ry="4.2" />
            <ellipse rx="11" ry="4.2" transform="rotate(60)" />
            <ellipse rx="11" ry="4.2" transform="rotate(120)" />
          </g>
        </svg>
      </div>
    );
  }

  // 2. JavaScript / TypeScript
  if (lower.includes('javascript') || lower.includes('typescript') || lower.includes('js') || lower.includes('ts')) {
    const isTS = lower.includes('typescript') || (lower.includes('ts') && !lower.includes('javascript') && !lower.includes('js'));
    return (
      <div
        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-black text-[9px] border ${
          isTS
            ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
            : 'bg-[#FEF9C3] text-[#A16207] border-[#FDE047]'
        }`}
      >
        {isTS ? 'TS' : 'JS'}
      </div>
    );
  }

  // 3. Node.js & Express
  if (lower.includes('node') || lower.includes('express')) {
    return (
      <div className="w-6 h-6 rounded-md bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 border border-[#BBF7D0]">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l7.5 4.33v8.67L12 19.33l-7.5-4.33V6.33L12 2z" />
          <path d="M12 6.5v8.5" />
          <path d="M7.5 9l4.5 2.5 4.5-2.5" />
        </svg>
      </div>
    );
  }

  // 4. Data Structures & Algorithms
  if (lower.includes('data structure') || lower.includes('algorithm') || lower.includes('dsa')) {
    return (
      <div className="w-6 h-6 rounded-md bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center shrink-0 border border-[#E9D5FF]">
        <Layers size={13} />
      </div>
    );
  }

  // 5. Git & Version Control
  if (lower.includes('git') || lower.includes('github') || lower.includes('version control')) {
    return (
      <div className="w-6 h-6 rounded-md bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center shrink-0 border border-[#FED7AA]">
        <GitBranch size={13} />
      </div>
    );
  }

  // 6. Figma & UI/UX Design
  if (lower.includes('figma') || lower.includes('ui/ux') || lower.includes('design')) {
    return (
      <div className="w-6 h-6 rounded-md bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center shrink-0 border border-[#FBCFE8]">
        <Palette size={13} />
      </div>
    );
  }

  // 7. Problem Solving
  if (lower.includes('problem solving') || lower.includes('critical') || lower.includes('logic')) {
    return (
      <div className="w-6 h-6 rounded-md bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FDE68A]">
        <Brain size={13} />
      </div>
    );
  }

  // 8. Team Collaboration
  if (lower.includes('team') || lower.includes('collaboration') || lower.includes('communication') || lower.includes('leadership')) {
    return (
      <div className="w-6 h-6 rounded-md bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center shrink-0 border border-[#C7D2FE]">
        <Users size={13} />
      </div>
    );
  }

  // 9. Python
  if (lower.includes('python')) {
    return (
      <div className="w-6 h-6 rounded-md bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0 border border-[#BAE6FD]">
        <Terminal size={13} />
      </div>
    );
  }

  // 10. Database
  if (lower.includes('database') || lower.includes('sql') || lower.includes('mongo')) {
    return (
      <div className="w-6 h-6 rounded-md bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center shrink-0 border border-[#99F6E4]">
        <Database size={13} />
      </div>
    );
  }

  // Category-based fallback
  if (category === 'Tools') {
    return (
      <div className="w-6 h-6 rounded-md bg-[#F1F5F9] text-[#475569] flex items-center justify-center shrink-0 border border-[#E2E8F0]">
        <Wrench size={13} />
      </div>
    );
  }

  if (category === 'Soft Skills') {
    return (
      <div className="w-6 h-6 rounded-md bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center shrink-0 border border-[#FCE7F3]">
        <Users size={13} />
      </div>
    );
  }

  return (
    <div className="w-6 h-6 rounded-md bg-[#F2ECFF] text-[#6D3DF5] flex items-center justify-center shrink-0 border border-[#E9E1FF]">
      <Code2 size={13} />
    </div>
  );
};
