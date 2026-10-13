import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Sparkles,
  Award,
  ExternalLink,
  Share2,
  Download,
  Briefcase,
  Code,
  CheckCircle2,
  Check,
  ChevronLeft,
  Building,
  GraduationCap,
  Calendar,
  FileText,
  BarChart2,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import api from "../../services/api";

export const VirtualCVView = ({ user, onBackToFeed }) => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVirtualResume = async () => {
      const uid = user?._id || user?.id;
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
  }, [user]);

  const displayName = user?.name || "Student";
  const displayAvatar = user?.ImageUrl || user?.avatar;
  const institute = user?.Profile?.InstituteName || "VIBE Institute of Technology";
  const branch = user?.Profile?.Branch || user?.Profile?.branch || "Computer Science";
  const year = user?.Profile?.YearOfStudy || user?.Profile?.currentYear || "3rd Year";

  // Merged skills: prioritize backend skills if present, or profile skills, or standard academic skill categories
  const backendSkills = resumeData?.skills || [];
  const defaultSkills = [
    { name: "React.js", category: "Technical", level: "Advanced", verified: true },
    { name: "JavaScript / TypeScript", category: "Technical", level: "Advanced", verified: true },
    { name: "Node.js & Express", category: "Technical", level: "Intermediate", verified: true },
    { name: "Data Structures & Algorithms", category: "Technical", level: "Intermediate", verified: true },
    { name: "Git & Version Control", category: "Tools", level: "Advanced", verified: true },
    { name: "Figma & UI/UX Design", category: "Tools", level: "Intermediate", verified: false },
    { name: "Problem Solving", category: "Soft Skills", level: "Advanced", verified: true },
    { name: "Team Collaboration", category: "Soft Skills", level: "Advanced", verified: true },
  ];

  const displayedSkills =
    backendSkills.length > 0
      ? backendSkills.map((s) => ({
          name: s,
          category: "Technical",
          level: "Verified",
          verified: true,
        }))
      : defaultSkills;

  // Real or simulated experience/tasks
  const displayedExperience =
    resumeData?.experience && resumeData.experience.length > 0
      ? resumeData.experience.map((exp, idx) => ({
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
        ];

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("CV link copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[1150px] mx-auto w-full space-y-6 pb-12">
      {/* Back to Feed button */}
      {onBackToFeed && (
        <div className="flex items-center">
          <button
            onClick={onBackToFeed}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#6D3DF5] transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to Home Feed</span>
          </button>
        </div>
      )}

      {/* 1. Header Card: Student Profile & Action Controls */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto text-center sm:text-left">
          <div className="relative flex-shrink-0">
            <Avatar
              name={displayName}
              src={displayAvatar}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-[#F1F5F9] shadow-sm"
              initialsClassName="text-2xl font-bold text-white"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#6D3DF5] text-white p-1.5 rounded-lg shadow-sm" title="VIBE Verified Profile">
              <ShieldCheck size={16} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                {displayName}
              </h1>
              <span className="text-[11px] font-bold text-[#6D3DF5] bg-[#F3EEFF] px-2.5 py-0.5 rounded-full border border-[#E9D5FF]">
                Student CV
              </span>
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Share2 size={14} />
            <span>Share CV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Download size={14} />
            <span>Download CV</span>
          </button>
        </div>
      </motion.section>

      {/* 2. AI CV Analysis Scorecard & Insights */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {/* ATS Readiness Score */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              ATS Readiness
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center">
              <Sparkles size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0F172A]">92%</span>
            <span className="text-xs font-bold text-[#059669]">Excellent</span>
          </div>
          <div className="w-full bg-[#F1F5F9] rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-[#6D3DF5] h-2 rounded-full w-[92%]" />
          </div>
          <p className="text-[11px] text-[#64748B] mt-2">
            Tailored for tech roles and verified industry internship tasks.
          </p>
        </div>

        {/* Verified Competencies */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Verified Skills
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0F172A]">
              {displayedSkills.filter((s) => s.verified).length}
            </span>
            <span className="text-xs text-[#64748B]">out of {displayedSkills.length} total</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-3">
            Verified by faculty review and completed task submissions.
          </p>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Key Recommendations
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <BarChart2 size={15} />
            </div>
          </div>
          <ul className="space-y-1.5 text-xs text-[#334155] mt-1">
            <li className="flex items-start gap-1.5">
              <Check size={13} className="text-[#6D3DF5] shrink-0 mt-0.5" />
              <span>Highlight live project links & GitHub repos</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Check size={13} className="text-[#6D3DF5] shrink-0 mt-0.5" />
              <span>Connect with a faculty mentor for code reviews</span>
            </li>
          </ul>
        </div>
      </motion.section>

      {/* 3. Skills Matrix Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center">
            <Code size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Skills & Competencies</h2>
            <p className="text-xs text-[#64748B]">
              Verified technical, tooling, and communication abilities
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {displayedSkills.map((skill, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#0F172A] truncate">{skill.name}</p>
                <p className="text-[10px] text-[#64748B]">{skill.level}</p>
              </div>
              {skill.verified && (
                <div className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0" title="Verified Skill">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* 4. Experience & Projects Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <Briefcase size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Project & Internship Experience</h2>
            <p className="text-xs text-[#64748B]">
              Real industry challenges solved through VIBE
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {displayedExperience.map((exp) => (
            <div
              key={exp.id}
              className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0F172A]">
                    {exp.role}
                  </h3>
                  <p className="text-xs text-[#6D3DF5] font-semibold">{exp.company}</p>
                </div>
                <span className="text-[11px] text-[#94A3B8] font-medium">
                  {exp.duration}
                </span>
              </div>
              <p className="text-xs text-[#334155] leading-relaxed">
                {exp.description}
              </p>
              {exp.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {exp.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white border border-[#E2E8F0] text-[#64748B] rounded-md text-[10px] font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};