import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  Users,
  Briefcase,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Star,
  Flame,
  MessageSquare,
  Zap,
  UserCheck,
  FileText,
  Calendar,
  ThumbsUp,
  Share2,
  Clock,
  MapPin,
  Lock,
  ExternalLink,
  Award,
  BookOpen,
  ChevronRight,
  Code,
  Check,
  QrCode,
  Copy,
  FolderGit2,
} from "lucide-react";
import {
  SparkDoodle,
  LoopDoodle,
  SpiralDoodle,
  StarDoodle,
} from "../components/public/Doodles";

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNT-UP NUMBER (ClassDojo style viewport trigger)
// ─────────────────────────────────────────────────────────────────────────────
const CountUpNumber = ({ target, suffix = "", duration = 1.6 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Smooth ease-out cubic curve
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums font-black">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE ROLE BADGE (ClassDojo friendly role selector)
// ─────────────────────────────────────────────────────────────────────────────
const RoleBadge = ({ role, label, icon, path, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(role)}
    className={`group min-h-[48px] px-5 py-3 rounded-2xl flex items-center gap-3 transition-all duration-200 text-left border ${
      isSelected
        ? "bg-white border-[#7540F5] shadow-[0_8px_24px_rgba(117,64,245,0.14)] -translate-y-0.5"
        : "bg-white/90 hover:bg-white border-slate-200/90 hover:border-[#7540F5]/50 hover:shadow-md hover:-translate-y-0.5"
    }`}
  >
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        isSelected
          ? "bg-[#F5F1FF] text-[#7540F5] scale-105"
          : "bg-slate-50 text-[#5A6482] group-hover:bg-[#F5F1FF] group-hover:text-[#7540F5]"
      }`}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <span
        className={`block text-sm font-bold leading-tight ${
          isSelected
            ? "text-[#111B5E]"
            : "text-[#111B5E] group-hover:text-[#7540F5]"
        }`}
      >
        {role}
      </span>
      <span className="block text-[11px] text-[#5A6482] font-medium leading-tight truncate">
        {label}
      </span>
    </div>
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE FEATURE ROW (Alternating storytelling row)
// ─────────────────────────────────────────────────────────────────────────────
const FeatureRow = ({
  reversed = false,
  tag,
  title,
  emoji,
  description,
  bullets = [],
  ctaText,
  ctaPath,
  mockup,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${
        reversed ? "md:flex-row-reverse" : "md:flex-row"
      } items-center gap-8 lg:gap-12 py-3 sm:py-5`}
    >
      {/* Left/Right Text Column */}
      <div className="flex-1 space-y-5 text-left max-w-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5F1FF] border border-[#E9E1FF] text-[#7540F5] text-xs font-black uppercase tracking-wider">
          <span>{emoji}</span>
          <span>{tag}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-[#111B5E] leading-tight">
          {title}
        </h3>

        <p className="text-base sm:text-lg text-[#5A6482] font-normal leading-relaxed">
          {description}
        </p>

        {bullets.length > 0 && (
          <ul className="space-y-2.5 pt-1">
            {bullets.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm sm:text-base text-[#111B5E] font-medium"
              >
                <div className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-2">
          <Link
            to={ctaPath}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#7540F5] hover:text-[#6025EB] hover:underline underline-offset-4 group transition-colors"
          >
            <span>{ctaText}</span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>

      {/* Left/Right Interactive Mockup Surface */}
      <div className="flex-1 w-full max-w-lg">{mockup}</div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE TESTIMONIAL CARD (ClassDojo Wall of Love style)
// ─────────────────────────────────────────────────────────────────────────────
const TestimonialCard = ({
  name,
  role,
  institution,
  avatar,
  quote,
  verified = true,
  rating = 5,
  tag,
  isDuplicate = false,
}) => (
  <div
    aria-hidden={isDuplicate ? "true" : undefined}
    tabIndex={isDuplicate ? -1 : undefined}
    className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_20px_rgba(17,27,94,0.04)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.08)] hover:border-[#7540F5]/40 transition-all duration-300 flex flex-col justify-between h-full select-none group"
  >
    <div>
      {/* Top Stars & Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-[#FBBF24]">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} size={15} className="fill-current" />
          ))}
        </div>
        {tag && (
          <span className="px-2.5 py-0.5 rounded-full bg-[#F5F1FF] text-[#7540F5] text-[11px] font-bold">
            {tag}
          </span>
        )}
      </div>

      {/* Quote */}
      <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal mb-6">
        "{quote}"
      </p>
    </div>

    {/* Author Info */}
    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
      <img
        src={avatar}
        alt={isDuplicate ? "" : name}
        className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-bold text-[#111B5E] truncate">{name}</h4>
          {verified && (
            <ShieldCheck
              size={14}
              className="text-[#16A34A] flex-shrink-0"
              title={isDuplicate ? undefined : "Verified VIBE Member"}
            />
          )}
        </div>
        <p className="text-xs text-[#5A6482] truncate">
          {role} • {institution}
        </p>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HOME PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Home = () => {
  // Selected role state for hero quick-routing
  const [selectedRole, setSelectedRole] = useState("Student");
  const [copiedLink, setCopiedLink] = useState(false);

  // Role routing map (Student and Mentor)
  const rolePathMap = {
    Student: "/signup/student",
    Mentor: "/signup/faculty",
  };

  const handleCopyPublicCV = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  /* PLACEHOLDER DATA: Auto-scrolling community members strip (ClassDojo style) */
  const communityMembers = [
    {
      name: "Aarav Sharma",
      role: "Computer Science @ IIT Bombay",
      type: "Student",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces",
      tag: "3 Tasks Solved",
      highlight: "Internship Secured",
      badgeBg: "bg-[#EDF7FF] text-[#2F6DB5]",
    },
    {
      name: "Dr. Ananya Rao",
      role: "AI & ML Professor @ BITS Pilani",
      type: "Faculty Mentor",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
      tag: "Verified Guide",
      highlight: "48 Students Mentored",
      badgeBg: "bg-[#F5F1FF] text-[#7540F5]",
    },
    {
      name: "Priya Nair",
      role: "Staff Engineer @ CloudScale",
      type: "Industry Partner",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
      tag: "Hiring Lead",
      highlight: "Posted 8 Tasks",
      badgeBg: "bg-[#FEF3C7] text-[#D97706]",
    },
    {
      name: "Kabir Patel",
      role: "Full-Stack Dev @ NIT Trichy",
      type: "Student",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
      tag: "Virtual CV Active",
      highlight: "Top 5% Solver",
      badgeBg: "bg-[#DCFCE7] text-[#16A34A]",
    },
    {
      name: "Prof. Rajesh Verma",
      role: "Dean of Innovation @ DTU",
      type: "Partner College",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
      tag: "Campus Lead",
      highlight: "Placement Partner",
      badgeBg: "bg-[#FCE7F3] text-[#DB2777]",
    },
    {
      name: "Aditi Sen",
      role: "Talent Partner @ FinTech Labs",
      type: "Company Recruiter",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
      tag: "Verified Recruiter",
      highlight: "12 Interns Hired",
      badgeBg: "bg-[#EDE9FE] text-[#7C3AED]",
    },
  ];

  /* PLACEHOLDER DATA: Real VIBE Community Testimonials (Wall of Love) */
  const testimonials = [
    {
      name: "Arjun Nair",
      role: "CS Junior",
      institution: "IIT Delhi",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces",
      quote:
        "Task Mania completely changed my internship search. Instead of sending 50 cold resumes, I completed one real micro-task posted by CloudScale and landed an interview within 48 hours!",
      tag: "Hired via Task Mania",
    },
    {
      name: "Dr. Shalini Gupta",
      role: "Associate Professor",
      institution: "BITS Pilani",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=faces",
      quote:
        "VIBE provides a structured, transparent way to mentor students beyond regular lectures. Guiding ambitious students on verifiable industry problems has been deeply rewarding.",
      tag: "Faculty Mentor",
    },
    {
      name: "Vikramaditya Bose",
      role: "VP of Engineering",
      institution: "PayScale Labs",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces",
      quote:
        "We hired two interns through VIBE this summer. Having tangible proof-of-work and cryptographic verification in their Virtual CV eliminated resume speculation entirely.",
      tag: "Hiring Partner",
    },
    {
      name: "Rhea Sen",
      role: "ECE Senior",
      institution: "VIT Vellore",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=faces",
      quote:
        "The Virtual CV feature is pure gold. My projects, peer endorsements, and mentor reviews are consolidated into a live, shareable link that recruiters actually respect.",
      tag: "Student",
    },
    {
      name: "Prof. K. Venkatesh",
      role: "Director of Placements",
      institution: "SRM University",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces",
      quote:
        "VIBE gives our institution verified analytics on student competencies and corporate engagement. It bridges the critical gap between campus curriculum and real job demands.",
      tag: "Partner College",
    },
    {
      name: "Tanmay Joshi",
      role: "Graduate Fellow",
      institution: "IISc Bangalore",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&h=160&fit=crop&crop=faces",
      quote:
        "Finding an accredited mentor who genuinely reviews system designs and code quality seemed impossible. On VIBE, I booked weekly sessions that accelerated my master's project.",
      tag: "Mentorship",
    },
  ];

  return (
    <div className="roboto-bold min-h-screen bg-white text-[#111B5E] pt-14 md:pt-20 overflow-x-hidden selection:bg-[#7540F5] selection:text-white">
      {/* ======================================================== */}
      {/* 1. HERO SECTION                                         */}
      {/* ======================================================== */}
      <section className="relative pt-4 sm:pt-8 md:pt-12 pb-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Floating Doodles around Hero */}
        <div className="absolute top-8 left-6 hidden sm:block pointer-events-none vibe-doodle-float-1">
          <SparkDoodle color="#FBBF24" size={32} />
        </div>
        <div className="absolute top-10 right-10 hidden sm:block pointer-events-none vibe-doodle-float-2">
          <LoopDoodle color="#F472B6" size={36} />
        </div>
        <div className="absolute bottom-24 left-10 hidden md:block pointer-events-none vibe-doodle-float-2">
          <SpiralDoodle color="#7540F5" size={28} />
        </div>
        <div className="absolute top-44 right-16 hidden lg:block pointer-events-none vibe-doodle-float-1">
          <StarDoodle color="#38BDF8" size={24} />
        </div>

        {/* Eyebrow Trust Line */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDF7FF] border border-[#D3E3EE] text-[#2F6DB5] text-xs font-bold uppercase tracking-wider mb-3.5 md:mb-6"
        >
          <ShieldCheck size={14} className="text-[#16A34A]" />
          <span>Verified Opportunities • Free for Students</span>
        </motion.div>

        {/* Main Headline (Friendly, bold, ClassDojo style) */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-black tracking-tight leading-[1.14] text-[#111B5E] max-w-5xl mx-auto"
        >
          Turn student ambition into{" "}
          <motion.span
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
            className="bg-gradient-to-r from-[#2563EB] via-[#7540F5] to-[#6366F1] bg-clip-text text-transparent inline-block"
          >
            verified careers
          </motion.span>{" "}
          that top companies{" "}
          <span className="relative inline-block text-[#7540F5]">
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-block"
            >
              trust
            </motion.span>
            <span className="absolute -bottom-2.5 left-0 w-full pointer-events-none vibe-landing-underline">
              <svg
                className="w-full h-3 md:h-4 overflow-visible"
                viewBox="0 0 200 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M3 11C45 4 155 3 197 9C165 14 60 15 15 13"
                  stroke="#FBBF24"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.85, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
            </span>
            <motion.span
              initial={{ scale: 0, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 16,
                delay: 0.85,
              }}
              className="absolute -top-3 -right-6 hidden sm:inline-block pointer-events-none text-[#FBBF24]"
            />
          </span>
        </motion.h1>

        {/* Short Subline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-[#5A6482] max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Connect directly with certified faculty mentors, solve real-world industry tasks, and build an authenticated Virtual CV that unlocks genuine career doors.
        </motion.p>

        {/* "Get started as a..." Row of Rounded Role Badges (ClassDojo style) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 max-w-xl mx-auto"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-[#5A6482] mb-3.5">
            Get started as a...
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
            <RoleBadge
              role="Student"
              label="Tasks & Mentors"
              icon={<GraduationCap size={19} />}
              path="/signup/student"
              isSelected={selectedRole === "Student"}
              onSelect={setSelectedRole}
            />
            <RoleBadge
              role="Mentor"
              label="Guide Cohorts"
              icon={<Users size={19} />}
              path="/signup/faculty"
              isSelected={selectedRole === "Mentor"}
              onSelect={setSelectedRole}
            />
          </div>
        </motion.div>

        {/* Main "Sign up" CTA Button with dynamic role link */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to={rolePathMap[selectedRole] || "/signup"}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-full text-base font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] shadow-[0_8px_24px_rgba(117,64,245,0.28)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.36)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Sign up as {selectedRole}</span>
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            to="/how-it-works"
            className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-full text-base font-bold text-[#111B5E] bg-white border border-slate-200 hover:border-[#7540F5] hover:text-[#7540F5] transition-all flex items-center justify-center gap-1.5"
          >
            <span>How it works</span>
          </Link>
        </motion.div>

        {/* Trust Proof Micro-Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#5A6482]"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-[#16A34A]" /> Institutional Domain Vetted
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-[#16A34A]" /> Zero Cold Resumes
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-[#16A34A]" /> 100% Free for Students
          </span>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 2. AUTO-SCROLLING COMMUNITY CAROUSEL STRIP (ClassDojo)   */}
      {/* ======================================================== */}
      <section className="relative py-6 bg-[#F8FAFF] border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A6482]">
            Active Students, Mentors & Recruiter Teams
          </span>
        </div>

        {/* Infinite Marquee Track */}
        <div className="relative w-full overflow-hidden">
          <div className="animate-vibe-marquee py-2 flex items-center gap-4">
            {/* Double the list for seamless continuous infinite scrolling */}
            {[...communityMembers, ...communityMembers].map((member, idx) => (
              <div
                key={idx}
                className="w-72 sm:w-80 flex-shrink-0 bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#7540F5]/40 transition-all flex items-center gap-3.5 select-none"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-[#111B5E] truncate">
                      {member.name}
                    </p>
                    <ShieldCheck
                      size={13}
                      className="text-[#16A34A] flex-shrink-0"
                    />
                  </div>
                  <p className="text-xs text-[#5A6482] truncate">
                    {member.role}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${member.badgeBg}`}
                    >
                      {member.tag}
                    </span>
                    <span className="text-[10px] text-[#5A6482] font-medium truncate">
                      {member.highlight}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SECTION HEADING & ANIMATED STAT COUNTER              */}
      {/* ======================================================== */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#F5F1FF] text-[#7540F5] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Users size={24} />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black tracking-tight text-[#111B5E] leading-tight">
            Keeping students, mentors and companies connected
          </h2>

          <p className="mt-3.5 text-base sm:text-lg md:text-xl text-[#5A6482] max-w-2xl mx-auto font-normal leading-relaxed">
            From first-year technical exploration to verified corporate placement — VIBE gives every participant transparent, certified tools for growth.
          </p>

          {/* Animated Stat Counters (Viewport triggered) */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs text-left hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#EDF7FF] text-[#2F6DB5] flex items-center justify-center mb-3">
                <GraduationCap size={20} />
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111B5E]">
                <CountUpNumber target={15000} suffix="+" />
              </p>
              <p className="text-xs sm:text-sm text-[#5A6482] font-semibold mt-1">
                Verified Students
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs text-left hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#F5F1FF] text-[#7540F5] flex items-center justify-center mb-3">
                <Users size={20} />
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111B5E]">
                <CountUpNumber target={1200} suffix="+" />
              </p>
              <p className="text-xs sm:text-sm text-[#5A6482] font-semibold mt-1">
                Faculty Mentors
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs text-left hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-3">
                <Briefcase size={20} />
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111B5E]">
                <CountUpNumber target={450} suffix="+" />
              </p>
              <p className="text-xs sm:text-sm text-[#5A6482] font-semibold mt-1">
                Industry Partners
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs text-left hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3">
                <Award size={20} />
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111B5E]">
                <CountUpNumber target={98} suffix="%" />
              </p>
              <p className="text-xs sm:text-sm text-[#5A6482] font-semibold mt-1">
                Verified Completion
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 4. ALTERNATING FEATURE ROWS (5 VIBE MODULES)             */}
      {/* ======================================================== */}
      <section className="pt-2 pb-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 sm:space-y-10">
        {/* ──────────────────────────────────────────────────────── */}
        {/* ROW 1: Community Posts (💬)                             */}
        {/* ──────────────────────────────────────────────────────── */}
        <FeatureRow
          tag="Community Module"
          title="Community Posts"
          emoji="💬"
          description="Engage in peer-driven campus discussions, share technical breakthroughs, and get instant guidance from your collegiate network."
          bullets={[
            "Post ideas, research findings, and technical dilemmas",
            "Give and receive positive vibes and peer endorsements",
            "Filter discussions by interest circles and university tags",
          ]}
          ctaText="Explore Community Feed"
          ctaPath="/signup"
          mockup={
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_10px_30px_rgba(17,27,94,0.06)] space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                  alt="Rohan Mehta"
                  className="w-11 h-11 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-[#111B5E]">
                      Rohan Mehta
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#EDF7FF] text-[#2F6DB5] text-[10px] font-bold">
                      IIT Delhi
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6482]">2 hours ago • Public Circle</p>
                </div>
              </div>

              <p className="text-sm text-slate-800 leading-relaxed font-normal">
                Built an open-source task scheduling visualizer using React & Web Workers! Looking for feedback on latency benchmarks. 🚀
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-[#5A6482]">
                  #ReactJS
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-[#5A6482]">
                  #WebWorkers
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-[#5A6482]">
                  #OpenSource
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#5A6482] font-semibold">
                <span className="flex items-center gap-1.5 text-[#7540F5] bg-[#F5F1FF] px-3 py-1.5 rounded-full">
                  <ThumbsUp size={14} /> 148 vibes
                </span>
                <span className="flex items-center gap-1.5 hover:text-[#111B5E]">
                  <MessageSquare size={14} /> 32 replies
                </span>
                <span className="flex items-center gap-1.5 hover:text-[#111B5E]">
                  <Share2 size={14} /> Share
                </span>
              </div>
            </div>
          }
        />

        {/* ──────────────────────────────────────────────────────── */}
        {/* ROW 2: TaskMania (⚡)                                    */}
        {/* ──────────────────────────────────────────────────────── */}
        <FeatureRow
          reversed
          tag="Practical Tasks"
          title="Task Mania"
          emoji="⚡"
          description="Solve vetted industry challenges posted by real tech teams. Submit working solutions and get noticed by recruiters on merit."
          bullets={[
            "Micro-internship challenges with transparent rubrics",
            "Clear milestone deliverables and automated code checks",
            "Stipend bounties and direct fast-track interviews",
          ]}
          ctaText="Browse Active Tasks"
          ctaPath="/signup"
          mockup={
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_10px_30px_rgba(17,27,94,0.06)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-black text-xs">
                    CS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111B5E]">CloudScale Systems</h4>
                    <span className="text-[10px] text-[#16A34A] font-bold flex items-center gap-1">
                      <ShieldCheck size={11} /> Verified Employer
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-black">
                  $450 Bounty
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#111B5E]">
                  Implement Real-Time Metrics Pipeline
                </h4>
                <p className="text-xs text-[#5A6482] mt-1 leading-relaxed">
                  Design a robust ingestion service handling 10k events/sec with resilient backpressure.
                </p>
              </div>

              {/* Progress Milestones */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#111B5E]">
                  <span>Milestone 3 of 4</span>
                  <span className="text-[#7540F5]">75% Ready</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#7540F5] rounded-full w-3/4" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#5A6482] pt-1">
                  <span>Due in 4 days</span>
                  <span>28 submissions</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap size={14} /> Submit Solution
              </button>
            </div>
          }
        />

        {/* ──────────────────────────────────────────────────────── */}
        {/* ROW 3: Profile (🌟)                                     */}
        {/* ──────────────────────────────────────────────────────── */}
        <FeatureRow
          tag="Verified Portfolio"
          title="Profile"
          emoji="🌟"
          description="Your authenticated academic and skill footprint. Showcase endorsed proficiencies, faculty ratings, and real project milestones."
          bullets={[
            "Authenticated college identity and enrollment status",
            "Peer endorsements and mentor rating breakdowns",
            "Comprehensive timeline of solved Task Mania challenges",
          ]}
          ctaText="Build Your Profile"
          ctaPath="/signup"
          mockup={
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_10px_30px_rgba(17,27,94,0.06)] space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces"
                    alt="Sneha Mukherjee"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center border-2 border-white">
                    <Check size={11} strokeWidth={3} />
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#111B5E]">
                    Sneha Mukherjee
                  </h4>
                  <p className="text-xs text-[#5A6482]">
                    CS Undergrad • BITS Pilani '26
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[#FBBF24]">
                    <Star size={13} className="fill-current" />
                    <span className="text-xs font-bold text-[#111B5E]">4.95</span>
                    <span className="text-[11px] text-[#5A6482]">(24 mentor ratings)</span>
                  </div>
                </div>
              </div>

              {/* Endorsed Skills */}
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-bold text-[#111B5E]">Endorsed Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#F5F1FF] text-[#7540F5] text-xs font-bold">
                    React & TypeScript
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#EDF7FF] text-[#2F6DB5] text-xs font-bold">
                    Distributed Systems
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#16A34A] text-xs font-bold">
                    FastAPI
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#5A6482] text-xs font-bold">
                    +4 more
                  </span>
                </div>
              </div>

              {/* Badges Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#5A6482]">
                <span className="flex items-center gap-1 font-semibold text-[#111B5E]">
                  <Award size={14} className="text-[#7540F5]" /> Task Mania Top 5%
                </span>
                <span className="flex items-center gap-1 font-semibold text-[#111B5E]">
                  <Flame size={14} className="text-[#FBBF24]" /> 18 Day Streak
                </span>
              </div>
            </div>
          }
        />

        {/* ──────────────────────────────────────────────────────── */}
        {/* ROW 4: Virtual CV (📄)                                   */}
        {/* ──────────────────────────────────────────────────────── */}
        <FeatureRow
          reversed
          tag="Living Credential"
          title="Virtual CV"
          emoji="📄"
          description="A dynamic, tamper-proof living resume that auto-syncs your completed tasks, mentorship hours, and certifications in real time."
          bullets={[
            "Cryptographic proof of work verifying project completion",
            "Instant public share link with embedded QR verification",
            "Exportable to clean, ATS-compliant formats with one click",
          ]}
          ctaText="Learn About Virtual CV"
          ctaPath="/signup"
          mockup={
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_10px_30px_rgba(17,27,94,0.06)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F5F1FF] text-[#7540F5] flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111B5E]">
                      VIBE Virtual CV #8492
                    </h4>
                    <span className="text-[10px] text-[#16A34A] font-bold flex items-center gap-1">
                      <ShieldCheck size={11} /> Cryptographically Signed
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                  SHA-256 ✓
                </span>
              </div>

              {/* Public link copy box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-[#5A6482] truncate">
                  vibe.app/cv/sneha-mukherjee-bits
                </span>
                <button
                  type="button"
                  onClick={handleCopyPublicCV}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#111B5E] hover:text-[#7540F5] hover:border-[#7540F5] flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  {copiedLink ? <Check size={12} className="text-[#16A34A]" /> : <Copy size={12} />}
                  <span>{copiedLink ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              {/* Micro-Timeline Preview */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#7540F5] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-[#111B5E]">
                      CloudScale Systems • Micro-Internship
                    </p>
                    <p className="text-[11px] text-[#5A6482]">
                      Oct 2026 • Verified by Staff Lead Priya Nair
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#16A34A] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-[#111B5E]">
                      AI Research Mentorship • 32 Hours
                    </p>
                    <p className="text-[11px] text-[#5A6482]">
                      Sep 2026 • Certified by Dr. Ananya Rao
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#5A6482]">
                <span className="flex items-center gap-1 text-[#7540F5] font-semibold">
                  <QrCode size={14} /> Scan-to-verify badge included
                </span>
                <span className="font-mono text-[10px]">Updated today</span>
              </div>
            </div>
          }
        />

        {/* ──────────────────────────────────────────────────────── */}
        {/* ROW 5: Verified Internships & Mentorship (🤝)           */}
        {/* ──────────────────────────────────────────────────────── */}
        <FeatureRow
          tag="Direct Pipelines"
          title="Verified Internships and Mentorship"
          emoji="🤝"
          description="Book 1-on-1 guidance with accredited university professors and vetted tech executives. Gain actionable feedback and direct internship referrals."
          bullets={[
            "Structured 1-on-1 mentoring sessions with personalized roadmaps",
            "Zero ghosting: guaranteed feedback and evaluation notes",
            "Direct internship pipelines verified by institutional pacts",
          ]}
          ctaText="Find Your Mentor"
          ctaPath="/signup"
          mockup={
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_10px_30px_rgba(17,27,94,0.06)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#F5F1FF] text-[#7540F5] text-xs font-bold">
                  Confirmed Mentorship Session
                </span>
                <span className="text-xs text-[#16A34A] font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Active Booking
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces"
                  alt="Dr. Meera Sharma"
                  className="w-12 h-12 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#111B5E]">
                    Dr. Meera Sharma
                  </h4>
                  <p className="text-xs text-[#5A6482]">
                    Professor @ IIT Delhi • AI Lead
                  </p>
                  <p className="text-[11px] text-[#7540F5] font-semibold mt-0.5">
                    Domain: Computer Vision & Career Prep
                  </p>
                </div>
              </div>

              <div className="bg-[#EDF7FF] p-3.5 rounded-2xl border border-[#D3E3EE] text-xs text-[#111B5E] space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <Calendar size={14} className="text-[#2F6DB5]" />
                  <span>Thursday, Oct 16 • 4:00 PM – 4:45 PM</span>
                </div>
                <p className="text-[11px] text-[#5A6482] pl-5">
                  Agenda: Codebase Architecture & Winter Internship Review
                </p>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Join Video Room</span>
                <ExternalLink size={13} />
              </button>
            </div>
          }
        />
      </section>

      {/* ======================================================== */}
      {/* 5. "OUR COMMUNITY IS OUR SUPERPOWER" WALL OF LOVE       */}
      {/* ======================================================== */}
      <section className="py-16 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black tracking-tight text-[#111B5E] leading-tight">
              Our community is our superpower
            </h2>

            <p className="mt-3.5 text-base sm:text-lg md:text-xl text-[#5A6482] max-w-2xl mx-auto font-normal leading-relaxed">
              Real stories from students who found certified opportunities and mentors who shaped future careers.
            </p>
          </motion.div>
        </div>

        {/* Continuous Horizontal Testimonial Carousel */}
        <div
          className="relative w-full overflow-hidden mt-12 group/testimonials"
          role="region"
          aria-label="Community Testimonials"
        >
          {/* Subtle Left & Right Edge Gradient Masks for Smooth Ingress / Egress */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 md:w-36 bg-gradient-to-r from-white via-white/80 to-transparent z-10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 md:w-36 bg-gradient-to-l from-white via-white/80 to-transparent z-10"
            aria-hidden="true"
          />

          {/* Infinite Marquee Track (Double Sub-Track for Exact Mathematical Seamless Looping) */}
          <div className="animate-vibe-testimonial-marquee py-4 flex items-stretch">
            {/* Primary Track Set */}
            <div className="flex items-stretch gap-6 shrink-0 pr-6">
              {testimonials.map((t, idx) => (
                <div
                  key={`primary-${idx}`}
                  className="w-[300px] sm:w-[360px] lg:w-[410px] shrink-0 text-left flex flex-col"
                >
                  <TestimonialCard
                    name={t.name}
                    role={t.role}
                    institution={t.institution}
                    avatar={t.avatar}
                    quote={t.quote}
                    tag={t.tag}
                    isDuplicate={false}
                  />
                </div>
              ))}
            </div>

            {/* Cloned Track Set (Marked aria-hidden="true" for Accessible Screen Reader Navigation) */}
            <div
              className="flex items-stretch gap-6 shrink-0 pr-6"
              aria-hidden="true"
            >
              {testimonials.map((t, idx) => (
                <div
                  key={`clone-${idx}`}
                  className="w-[300px] sm:w-[360px] lg:w-[410px] shrink-0 text-left flex flex-col"
                >
                  <TestimonialCard
                    name={t.name}
                    role={t.role}
                    institution={t.institution}
                    avatar={t.avatar}
                    quote={t.quote}
                    tag={t.tag}
                    isDuplicate={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. "PRIVACY FIRST, ALWAYS" TRUST SECTION                 */}
      {/* ======================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-[#EDF7FF]/70 border border-[#D3E3EE] rounded-3xl p-8 sm:p-12 md:p-14 relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#2F6DB5] flex items-center justify-center mx-auto mb-4 shadow-xs border border-[#D3E3EE]">
              <Lock size={22} />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#111B5E] tracking-tight">
              Privacy first, always
            </h2>

            <p className="mt-3.5 text-base sm:text-lg text-[#5A6482] leading-relaxed">
              We believe verified opportunity should never compromise student safety or institutional integrity. VIBE is engineered with strict academic data standards.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2.5 mb-2 text-[#16A34A]">
                  <ShieldCheck size={20} />
                  <h4 className="text-base font-bold text-[#111B5E]">
                    Institutional Authentication
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#5A6482] leading-relaxed">
                  Every student and mentor is verified against authorized institutional domains (.edu/ac.in) to keep campus circles safe from spam.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2.5 mb-2 text-[#7540F5]">
                  <CheckCircle2 size={20} />
                  <h4 className="text-base font-bold text-[#111B5E]">
                    Zero Data Selling
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#5A6482] leading-relaxed">
                  Your academic records and project files belong to you. We never monetize or sell personal candidate data to third-party ad networks.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2.5 mb-2 text-[#D97706]">
                  <Award size={20} />
                  <h4 className="text-base font-bold text-[#111B5E]">
                    Cryptographic Proof of Work
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#5A6482] leading-relaxed">
                  Virtual CV entries and Task Mania completions are signed and time-stamped to guarantee authenticity and eliminate resume inflation.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2.5 mb-2 text-[#0284C7]">
                  <Building2 size={20} />
                  <h4 className="text-base font-bold text-[#111B5E]">
                    FERPA & Campus Compliant
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#5A6482] leading-relaxed">
                  Built to adhere to modern university privacy guidelines, audit trails, and strict role-based permission boundaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. FINAL CTA BAND ("LET'S GET GROWING")                  */}
      {/* ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-8">
        <div className="bg-[#F5F1FF] border border-[#E9E1FF] rounded-3xl p-8 sm:p-12 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-white text-[#7540F5] text-xs font-black uppercase tracking-wider shadow-2xs">
              Join VIBE Today
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111B5E] tracking-tight leading-tight">
              Let's get growing
            </h2>

            <p className="text-base sm:text-lg text-[#5A6482] leading-relaxed">
              Whether you are a student hungry for practical projects or an educator passionate about mentorship — your place is here.
            </p>

            {/* Quick Role Badges inside CTA */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Link
                to="/signup/student"
                className="px-4 py-2 rounded-full bg-white hover:bg-[#7540F5] text-[#111B5E] hover:text-white border border-slate-200/90 text-xs font-bold transition-colors"
              >
                For Students
              </Link>
              <Link
                to="/signup/faculty"
                className="px-4 py-2 rounded-full bg-white hover:bg-[#7540F5] text-[#111B5E] hover:text-white border border-slate-200/90 text-xs font-bold transition-colors"
              >
                For Mentors
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-3 flex-shrink-0">
            <Link
              to="/signup"
              className="min-h-[48px] px-8 py-4 rounded-full text-base font-bold text-white bg-[#7540F5] hover:bg-[#6025EB] shadow-[0_8px_24px_rgba(117,64,245,0.3)] hover:shadow-[0_12px_32px_rgba(117,64,245,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 group"
            >
              <span>Get started — It's Free</span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <span className="text-xs text-[#5A6482]">
              No credit card required • Instant verification
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;