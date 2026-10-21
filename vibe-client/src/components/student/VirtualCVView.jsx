import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Terminal,
  Database,
} from 'lucide-react';
import api from "../../services/api";

export const VirtualCVView = ({ user, onBackToFeed }) => {
  const toast = useToast();
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

  // Merged skills: prioritize backend skills if present, or standard academic skill categories
  const backendSkills = resumeData?.skills || [];
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
          category: "Technical",
          level: "Verified",
          score: 90,
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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] flex items-center justify-center flex-shrink-0">
              <Zap size={18} />
            </div>
            <h3 className="text-lg font-bold text-[#172554]">Skills Matrix</h3>
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
                        {categorySkills.map((skill) => (
                          <div
                            key={skill.name}
                            className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/60 hover:border-[#E9E1FF] hover:bg-[#FDFBFF] transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <SkillIcon name={skill.name} category={cat} />
                              <span className="text-xs font-semibold text-[#172554] truncate flex items-center gap-1.5">
                                {skill.name}
                                {skill.verified && (
                                  <ShieldCheck size={13} className="text-[#6D3DF5] shrink-0" />
                                )}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] shrink-0 uppercase tracking-wider">
                              {skill.level || "Verified"}
                            </span>
                          </div>
                        ))}
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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7] flex items-center justify-center flex-shrink-0">
              <Briefcase size={18} />
            </div>
            <h3 className="text-lg font-bold text-[#172554]">Experience</h3>
          </div>

          <div className="space-y-4">
            {displayedExperience.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex gap-4 group"
              >
                <div className="hidden sm:flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${exp.verified ? 'bg-[#6D3DF5] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                    {exp.company[0]}
                  </div>
                  {idx < displayedExperience.length - 1 && <div className="w-0.5 h-full bg-[#F1F5F9] my-3" />}
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
        <Sparkles size={13} />
      </div>
    );
  }

  return (
    <div className="w-6 h-6 rounded-md bg-[#F2ECFF] text-[#6D3DF5] flex items-center justify-center shrink-0 border border-[#E9E1FF]">
      <Code2 size={13} />
    </div>
  );
};
