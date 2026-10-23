import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Mail,
  Phone,
  Edit3,
  Save,
  X,
  Loader2,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import { auth } from "../../utils/auth";
import api from "../../services/api";
import { useToast } from "../Toast";
import { StudentPostCard } from "../student/StudentPostCard";

export const UnifiedProfileView = ({
  user,
  currentUser,
  onProfileUpdate,
  onBack,
  onNavigateToSettings,
  roleOverride,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Determine whose profile is being viewed
  const targetUserId = user?._id || user?.id;
  const loggedInUser = currentUser || auth.getCurrentUser();
  const currentUserId = loggedInUser?._id || loggedInUser?.id;

  // Strict ownership check: only true if target user matches logged in user
  const isOwner = Boolean(
    targetUserId &&
      currentUserId &&
      String(targetUserId) === String(currentUserId)
  );

  // Normalize role (prioritize roleOverride e.g. "industry" or "company" when viewing company profile)
  const rawRole = (roleOverride || user?.accountType || user?.role || "").trim().toLowerCase();
  const isIndustry = rawRole === "industry" || rawRole === "industry expert" || rawRole === "company";
  const isFaculty = !isIndustry && rawRole === "faculty";
  const isStudent = !isIndustry && !isFaculty;

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("details");

  // Data states for tabs
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const [participatedTasks, setParticipatedTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [facultyRequests, setFacultyRequests] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);

  const [industryTasks, setIndustryTasks] = useState([]);
  const [industryLoading, setIndustryLoading] = useState(false);

  // Fetch Community Posts
  useEffect(() => {
    if (!targetUserId) return;
    let mounted = true;
    (async () => {
      try {
        setPostsLoading(true);
        const res = await api.get(`/posts/user/${targetUserId}`);
        if (mounted && res.data && res.data.data) {
          const mapped = res.data.data.map((p) => ({
            id: p._id,
            _id: p._id,
            author: {
              name: p.author?.name || user?.name || "Member",
              role: p.author?.accountType || user?.accountType || "Member",
              avatar: p.author?.ImageUrl || user?.avatar || user?.ImageUrl,
              details: p.author?.Profile?.Branch
                ? `${p.author.Profile.YearOfStudy ? `${p.author.Profile.YearOfStudy} yr` : "Student"}, ${p.author.Profile.Branch}`
                : "VIBE Member",
              _id: p.author?._id || targetUserId,
              id: p.author?._id || targetUserId,
            },
            time: new Date(p.createdAt).toLocaleDateString(),
            createdAt: p.createdAt,
            title: p.title,
            content: p.content,
            category: p.category || "General",
            tags: Array.isArray(p.tags) ? p.tags : [],
            attachments: p.attachments || [],
            vibes: p.vibes || {},
            vibeCount: p.vibes ? Object.keys(p.vibes).length : 0,
            commentCount: p.comments?.length || 0,
            comments: p.comments || [],
            repostOf: p.repostOf || null,
            repostComment: p.repostComment || "",
            repostCount: p.repostCount || (Array.isArray(p.reposts) ? p.reposts.length : 0),
          }));
          setUserPosts(mapped);
        }
      } catch (err) {
        console.warn("Could not load user posts:", err);
      } finally {
        if (mounted) setPostsLoading(false);
      }
    })();

    const handleDeleted = (e) => {
      const { postId } = e.detail || {};
      if (postId) {
        setUserPosts((prev) => prev.filter((post) => (post.id || post._id) !== postId));
      }
    };

    const handleUpdated = (e) => {
      const { post: updated } = e.detail || {};
      if (updated) {
        const uId = updated._id || updated.id;
        setUserPosts((prev) =>
          prev.map((post) =>
            (post.id || post._id) === uId
              ? {
                  ...post,
                  title: updated.title,
                  content: updated.content,
                  category: updated.category,
                  tags: Array.isArray(updated.tags) ? updated.tags : post.tags,
                  attachments: Array.isArray(updated.attachments)
                    ? updated.attachments
                    : post.attachments,
                }
              : post
          )
        );
      }
    };

    window.addEventListener("vibe:post_deleted", handleDeleted);
    window.addEventListener("vibe:post_updated", handleUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("vibe:post_deleted", handleDeleted);
      window.removeEventListener("vibe:post_updated", handleUpdated);
    };
  }, [targetUserId, user]);

  // Fetch Role-Specific Activity
  useEffect(() => {
    if (!targetUserId) return;
    let mounted = true;

    if (isStudent) {
      // Fetch participated tasks (submissions)
      (async () => {
        try {
          setTasksLoading(true);
          const endpoint = isOwner ? "/submissions/me" : `/submissions/user/${targetUserId}`;
          const res = await api.get(endpoint);
          if (mounted && res.data && res.data.data) {
            setParticipatedTasks(res.data.data);
          }
        } catch (err) {
          console.warn("Could not load student submissions:", err);
        } finally {
          if (mounted) setTasksLoading(false);
        }
      })();
    } else if (isFaculty) {
      // Fetch faculty mentor requests
      (async () => {
        try {
          setFacultyLoading(true);
          const endpoint = isOwner
            ? "/mentor-requests/faculty-requests"
            : `/mentor-requests/faculty/${targetUserId}`;
          const res = await api.get(endpoint);
          if (mounted && res.data && res.data.data) {
            setFacultyRequests(res.data.data);
          }
        } catch (err) {
          console.warn("Could not load faculty requests:", err);
        } finally {
          if (mounted) setFacultyLoading(false);
        }
      })();
    } else if (isIndustry) {
      // Fetch industry tasks
      (async () => {
        try {
          setIndustryLoading(true);
          const endpoint = isOwner ? "/tasks/myTasks" : `/tasks/company/${targetUserId}`;
          const res = await api.get(endpoint);
          if (mounted && res.data && res.data.data) {
            setIndustryTasks(res.data.data);
          }
        } catch (err) {
          console.warn("Could not load industry tasks:", err);
        } finally {
          if (mounted) setIndustryLoading(false);
        }
      })();
    }

    return () => {
      mounted = false;
    };
  }, [targetUserId, isOwner, isStudent, isFaculty, isIndustry]);

  // Profile completion calculation
  const getProfileCompletion = () => {
    if (isStudent) {
      const fields = [
        user?.name,
        user?.dob,
        user?.Profile?.InstituteName,
        user?.Profile?.degree,
        user?.Profile?.branch || user?.Profile?.Branch,
        user?.Profile?.yearOfStudy || user?.Profile?.YearOfStudy,
      ];
      if (isOwner && user?.mobileNo) fields.push(user.mobileNo);
      const filled = fields.filter((v) => v && (Array.isArray(v) ? v.length > 0 : String(v).trim())).length;
      return Math.min(100, Math.round((filled / fields.length) * 100));
    }
    if (isFaculty) {
      const fields = [
        user?.name,
        user?.Profile?.InstituteName,
        user?.Profile?.position,
        user?.Profile?.branch,
        user?.Profile?.YearOfExperience,
        user?.Profile?.ExpertiseDomains,
      ];
      if (isOwner && user?.mobileNo) fields.push(user.mobileNo);
      const filled = fields.filter((v) => v && (Array.isArray(v) ? v.length > 0 : String(v).trim())).length;
      return Math.min(100, Math.round((filled / fields.length) * 100));
    }
    if (isIndustry) {
      const fields = [
        user?.name,
        user?.Profile?.position,
        user?.Profile?.IndustryType,
        user?.Profile?.location,
        user?.Profile?.ExpertiseDomains,
      ];
      const filled = fields.filter((v) => v && (Array.isArray(v) ? v.length > 0 : String(v).trim())).length;
      return Math.min(100, Math.round((filled / fields.length) * 100));
    }
    return 80;
  };

  const completion = getProfileCompletion();

  // Tab definitions per role
  const getTabs = () => {
    if (isStudent) {
      return [
        { id: "details", label: "Details", icon: User },
        { id: "posts", label: "Community Posts", icon: MessageSquare, badge: userPosts.length },
        { id: "participated-tasks", label: "Participated Tasks", icon: Briefcase, badge: participatedTasks.length },
      ];
    }
    if (isFaculty) {
      const acceptedRequests = facultyRequests.filter((r) => r.status === "accepted");
      return [
        { id: "details", label: "Details", icon: User },
        { id: "posts", label: "Community Posts", icon: MessageSquare, badge: userPosts.length },
        { id: "mentored-tasks", label: "Mentored Tasks", icon: Award, badge: isOwner ? facultyRequests.length : acceptedRequests.length },
        { id: "mentor-students", label: "Mentor Students", icon: Users, badge: acceptedRequests.length },
      ];
    }
    if (isIndustry) {
      return [
        { id: "details", label: "Details", icon: Building2 },
        { id: "posts", label: "Community Posts", icon: MessageSquare, badge: userPosts.length },
        { id: "held-tasks", label: "Held Tasks", icon: Briefcase, badge: industryTasks.length },
      ];
    }
    return [
      { id: "details", label: "Details", icon: User },
      { id: "posts", label: "Community Posts", icon: MessageSquare },
    ];
  };

  const tabs = getTabs();

  return (
    <div className="max-w-[1150px] mx-auto w-full space-y-6 pb-12">
      {/* Top Back Button (if navigation callback provided) */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#6D3DF5] transition-colors py-1 cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
      )}

      {/* ======================================================== */}
      {/* 1. UNIFIED PROFILE SUMMARY CARD                          */}
      {/* ======================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-6 relative"
      >
        <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto">
          {/* Avatar Container with Purple Theme */}
          <div className="relative group flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#6D3DF5] p-0.5 shadow-sm">
              <Avatar
                name={user?.name || "User"}
                src={user?.ImageUrl || user?.avatar}
                variant="purple"
                className="w-full h-full rounded-[14px]"
                initialsClassName="text-xl md:text-2xl text-white font-bold"
              />
            </div>
          </div>

          {/* Details & Info */}
          <div className="text-center md:text-left space-y-1.5 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-xl md:text-2xl font-bold text-[#172554] tracking-tight">
                {user?.name || "VIBE Member"}
              </h2>

              {/* Role Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  isStudent
                    ? "bg-[#F2ECFF] text-[#6D3DF5] border-[#E9E1FF]"
                    : isFaculty
                    ? "bg-[#F3EEFF] text-[#6D3DF5] border-[#E9D5FF]"
                    : "bg-[#EDE9FE] text-[#6D3DF5] border-[#DDD6FE]"
                }`}
              >
                {isStudent ? "Student" : isFaculty ? "Faculty" : "Industry Expert"}
              </span>
            </div>

            {/* Subtitle / Role Specific Metadata */}
            <p className="text-[#64748B] font-medium text-xs md:text-sm">
              {isStudent && (
                <>
                  {user?.Profile?.degree || "B.Tech"} Student • {user?.Profile?.branch || user?.Profile?.Branch || "General"}
                </>
              )}
              {isFaculty && (
                <>
                  {user?.Profile?.position || "Faculty Member"} • {user?.Profile?.branch || "Academics"}
                </>
              )}
              {isIndustry && (
                <>
                  {user?.Profile?.position || user?.Profile?.IndustryType || "Industry Partner"}
                </>
              )}
            </p>

            {/* College / Location row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-[#475569] font-medium pt-0.5">
              {user?.Profile?.InstituteName && (
                <span className="flex items-center gap-1.5 truncate max-w-xs">
                  <Building2 size={14} className="text-[#6D3DF5] shrink-0" />
                  <span className="truncate">{user.Profile.InstituteName}</span>
                </span>
              )}
              {isStudent && user?.Profile?.yearOfStudy && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-[#6D3DF5] shrink-0" />
                  <span>{user.Profile.yearOfStudy}</span>
                </span>
              )}
              {isFaculty && user?.Profile?.YearOfExperience && (
                <span className="flex items-center gap-1.5">
                  <Award size={14} className="text-[#6D3DF5] shrink-0" />
                  <span>{user.Profile.YearOfExperience} Experience</span>
                </span>
              )}
              {user?.Profile?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#6D3DF5] shrink-0" />
                  <span>{user.Profile.location}</span>
                </span>
              )}
            </div>

            {/* Profile Completion Bar */}
            <div className="pt-2 w-full max-w-xs mx-auto md:mx-0">
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className="text-[11px] font-semibold text-[#64748B]">Profile Completion</span>
                <span className="text-[11px] font-bold text-[#6D3DF5]">{completion}%</span>
              </div>
              <div className="h-2 w-full bg-[#F2ECFF] rounded-full overflow-hidden p-0.5 border border-[#E9E1FF]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-[#6D3DF5] rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Action / Stats Area */}
        <div className="flex flex-col items-center md:items-end justify-between gap-4 w-full md:w-auto">
          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
            {isStudent && (
              <>
                <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                  <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider">Applied</span>
                  <span className="text-xs font-bold text-[#0F172A]">{participatedTasks.length}</span>
                </div>
                <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                  <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider">Posts</span>
                  <span className="text-xs font-bold text-[#0F172A]">{userPosts.length}</span>
                </div>
              </>
            )}
            {isFaculty && (
              <>
                <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                  <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider">Mentored</span>
                  <span className="text-xs font-bold text-[#0F172A]">
                    {facultyRequests.filter((r) => r.status === "accepted").length}
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                  <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider">Posts</span>
                  <span className="text-xs font-bold text-[#0F172A]">{userPosts.length}</span>
                </div>
              </>
            )}
            {isIndustry && (
              <>
                <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                  <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider">Tasks</span>
                  <span className="text-xs font-bold text-[#0F172A]">{industryTasks.length}</span>
                </div>
                <div className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                  <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider">Posts</span>
                  <span className="text-xs font-bold text-[#0F172A]">{userPosts.length}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.section>

      {/* ======================================================== */}
      {/* 2. HORIZONTAL NAVIGATION TABS                            */}
      {/* ======================================================== */}
      <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-[#E2E8F0] px-1 min-w-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 pt-1 text-sm font-bold tracking-tight whitespace-nowrap relative transition-colors shrink-0 cursor-pointer ${
                isActive
                  ? "text-[#6D3DF5]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Icon size={16} className={isActive ? "text-[#6D3DF5]" : "text-[#94A3B8]"} />
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold transition-colors ${
                    isActive
                      ? "bg-[#F3EEFF] text-[#6D3DF5] border border-[#E9E1FF]"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId="profileActiveTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#6D3DF5] rounded-full"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 3. TAB CONTENT                                           */}
      {/* ======================================================== */}
      <div>
        {/* TAB 1: DETAILS / COMPANY DETAILS */}
        {activeTab === "details" && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Card A: Institutional / Academic / Company Overview */}
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#64748B] flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
                    {isStudent ? (
                      <>
                        <GraduationCap size={16} className="text-[#6D3DF5]" />
                        <span>Academic Information</span>
                      </>
                    ) : isFaculty ? (
                      <>
                        <Award size={16} className="text-[#6D3DF5]" />
                        <span>Faculty & Department</span>
                      </>
                    ) : (
                      <>
                        <Building2 size={16} className="text-[#6D3DF5]" />
                        <span>Company Profile</span>
                      </>
                    )}
                  </h3>

                  <div className="space-y-3.5 text-sm">
                    {isStudent && (
                      <>
                        <div>
                          <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Institution</span>
                          <p className="font-semibold text-[#0F172A] mt-0.5">{user?.Profile?.InstituteName || "Not specified"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Degree</span>
                            <p className="font-semibold text-[#0F172A] mt-0.5">{user?.Profile?.degree || "B.Tech"}</p>
                          </div>
                          <div>
                            <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Branch</span>
                            <p className="font-semibold text-[#0F172A] mt-0.5">{user?.Profile?.branch || user?.Profile?.Branch || "General"}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Current Year</span>
                          <p className="font-semibold text-[#0F172A] mt-0.5">{user?.Profile?.yearOfStudy || user?.Profile?.YearOfStudy || "1st Year"}</p>
                        </div>
                      </>
                    )}

                    {isFaculty && (
                      <>
                        <div>
                          <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Institution</span>
                          <p className="font-semibold text-[#0F172A] mt-0.5">{user?.Profile?.InstituteName || "Not specified"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Designation</span>
                            <p className="font-semibold text-[#0F172A] mt-0.5">{user?.Profile?.position || "Faculty Mentor"}</p>
                          </div>
                          <div>
                            <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Experience</span>
                            <p className="font-semibold text-[#0F172A] mt-0.5">{user?.Profile?.YearOfExperience || "N/A"}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Department</span>
                          <p className="font-semibold text-[#0F172A] mt-0.5">{user?.Profile?.branch || "Academics"}</p>
                        </div>
                      </>
                    )}

                    {isIndustry && (
                      <>
                        <div>
                          <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Company</span>
                          <p className="font-semibold text-[#0F172A] mt-0.5">{user?.name || "Industry Partner"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Tagline</span>
                          <p className="font-semibold text-[#0F172A] mt-0.5">{user?.Profile?.position || "Innovating through Technology"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Domain</span>
                            <p className="font-semibold text-[#0F172A] mt-0.5">{user?.Profile?.IndustryType || "Technology"}</p>
                          </div>
                          <div>
                            <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider">Location</span>
                            <p className="font-semibold text-[#0F172A] mt-0.5">{user?.Profile?.location || "Remote"}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Card B: Contact & Specialization */}
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[#64748B] flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
                    <Sparkles size={16} className="text-[#6D3DF5]" />
                    <span>{isIndustry ? "Focus & Contacts" : "Expertise & Details"}</span>
                  </h3>

                  <div className="space-y-4 text-sm">
                    {/* Domains / Skills Pills */}
                    {(user?.Profile?.ExpertiseDomains || user?.Profile?.skills) && (
                      <div>
                        <span className="text-xs text-[#94A3B8] font-bold block uppercase tracking-wider mb-2">
                          {isFaculty ? "Areas of Guidance" : isIndustry ? "Tech Stack / Skills" : "Skills & Domains"}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(user.Profile.ExpertiseDomains)
                            ? user.Profile.ExpertiseDomains
                            : String(user.Profile.ExpertiseDomains || "")
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                          ).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-[#F3EEFF] text-[#6D3DF5] text-xs font-bold border border-[#E9E1FF]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact items */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                        <div className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#6D3DF5]">
                          <Mail size={14} />
                        </div>
                        <span className="font-semibold truncate">{user?.email || "Registered VIBE Email"}</span>
                      </div>

                      {/* Phone number visible ONLY to owner */}
                      {isOwner && user?.mobileNo && (
                        <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                          <div className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#6D3DF5]">
                            <Phone size={14} />
                          </div>
                          <span className="font-semibold">{user.mobileNo}</span>
                          <span className="text-[10px] text-[#94A3B8] italic">(Private to you)</span>
                        </div>
                      )}

                      {isOwner && user?.dob && (
                        <div className="flex items-center gap-2.5 text-xs text-[#475569]">
                          <div className="p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#6D3DF5]">
                            <Calendar size={14} />
                          </div>
                          <span className="font-semibold">{new Date(user.dob).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
          </div>
        )}

        {/* TAB 2: COMMUNITY POSTS */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            {postsLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] flex flex-col items-center justify-center">
                <Loader2 size={28} className="text-[#6D3DF5] animate-spin mb-3" />
                <p className="text-xs font-bold text-[#64748B]">Loading community posts...</p>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] shadow-xs">
                <div className="w-14 h-14 bg-[#F2ECFF] rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#6D3DF5]">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-bold text-sm text-[#0F172A] mb-1">No community posts yet</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  When this user shares questions, updates, or articles with the VIBE community, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <StudentPostCard
                    key={post.id}
                    post={post}
                    currentUser={loggedInUser}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STUDENT PARTICIPATED TASKS */}
        {activeTab === "participated-tasks" && isStudent && (
          <div className="space-y-4">
            {tasksLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] flex flex-col items-center justify-center">
                <Loader2 size={28} className="text-[#6D3DF5] animate-spin mb-3" />
                <p className="text-xs font-bold text-[#64748B]">Loading participated tasks...</p>
              </div>
            ) : participatedTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] shadow-xs">
                <div className="w-14 h-14 bg-[#F2ECFF] rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#6D3DF5]">
                  <Briefcase size={24} />
                </div>
                <h3 className="font-bold text-sm text-[#0F172A] mb-1">No participated tasks yet</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Tasks applied for or submitted through TaskMania will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participatedTasks.map((sub) => {
                  const task = sub.taskId || {};
                  const taskId =
                    typeof sub.taskId === "object" && sub.taskId?._id
                      ? sub.taskId._id
                      : typeof sub.taskId === "string"
                      ? sub.taskId
                      : null;
                  const hasValidTask = Boolean(taskId);
                  const companyId =
                    task.createdBy?._id ||
                    (typeof task.createdBy === "string" ? task.createdBy : null);
                  const companyUser =
                    typeof task.createdBy === "object" ? task.createdBy : null;
                  const companyName =
                    task.companyName || companyUser?.name || "Industry Partner";
                  const companyAvatar =
                    companyUser?.Profile?.avatar || companyUser?.ImageUrl;
                  const status = String(sub.status || "applied").toLowerCase();

                  return (
                    <div
                      key={sub._id}
                      role={hasValidTask ? "button" : undefined}
                      tabIndex={hasValidTask ? 0 : undefined}
                      onClick={() => {
                        if (hasValidTask) {
                          navigate(`/tasks/${taskId}`);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (hasValidTask && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          navigate(`/tasks/${taskId}`);
                        }
                      }}
                      className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-all group ${
                        hasValidTask
                          ? "cursor-pointer border-[#E1E8F2] hover:border-[#6D3DF5] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6D3DF5]/30"
                          : "border-[#E1E8F2] opacity-80"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D3DF5] bg-[#F3EEFF] px-2 py-0.5 rounded-full border border-[#E9E1FF]">
                              {task.roleOffered || "Challenge"}
                            </span>
                            <h4 className="font-bold text-sm text-[#0F172A] mt-1.5 leading-snug group-hover:text-[#6D3DF5] transition-colors truncate">
                              {task.title || "Industry Task"}
                            </h4>
                          </div>
                          <span
                            onClick={(e) => e.stopPropagation()}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                              status === "hired" || status === "selected"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : status === "rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : status === "interview_scheduled"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {status.replace("_", " ")}
                          </span>
                        </div>

                        {/* Separate Clickable Company Profile Link */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (companyId) {
                              navigate(`/profile/${companyId}?view=company`);
                            }
                          }}
                          className={`inline-flex items-center gap-2 text-xs text-[#64748B] ${
                            companyId
                              ? "cursor-pointer group/company hover:text-[#6D3DF5] transition-colors"
                              : ""
                          }`}
                          title={companyId ? `View ${companyName}'s profile` : undefined}
                        >
                          <div className="w-5 h-5 rounded-md bg-[#EDE9FE] text-[#6D3DF5] flex items-center justify-center shrink-0 overflow-hidden group-hover/company:bg-[#6D3DF5] group-hover/company:text-white transition-colors">
                            {companyAvatar ? (
                              <img
                                src={companyAvatar}
                                alt={companyName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 size={12} />
                            )}
                          </div>
                          <span className="font-medium group-hover/company:underline">
                            {companyName}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> Applied {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          {task.packageRange && (
                            <span className="font-bold text-[#0F172A]">{task.packageRange}</span>
                          )}
                          {!hasValidTask && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Task unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FACULTY MENTORED TASKS */}
        {activeTab === "mentored-tasks" && isFaculty && (
          <div className="space-y-4">
            {facultyLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] flex flex-col items-center justify-center">
                <Loader2 size={28} className="text-[#6D3DF5] animate-spin mb-3" />
                <p className="text-xs font-bold text-[#64748B]">Loading mentored tasks...</p>
              </div>
            ) : facultyRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] shadow-xs">
                <div className="w-14 h-14 bg-[#F2ECFF] rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#6D3DF5]">
                  <Award size={24} />
                </div>
                <h3 className="font-bold text-sm text-[#0F172A] mb-1">No mentored tasks yet</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Accepted task mentorship sessions will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facultyRequests.map((req) => {
                  const task = req.task || {};
                  const taskId =
                    typeof req.task === "object" && req.task?._id
                      ? req.task._id
                      : typeof req.task === "string"
                      ? req.task
                      : null;
                  const hasValidTask = Boolean(taskId);
                  const student = req.student || {};
                  const studentId = student._id || student.id;
                  const companyId =
                    task.createdBy?._id ||
                    (typeof task.createdBy === "string" ? task.createdBy : null);
                  const companyName =
                    task.companyName || task.createdBy?.name || "Industry Partner";

                  return (
                    <div
                      key={req._id}
                      role={hasValidTask ? "button" : undefined}
                      tabIndex={hasValidTask ? 0 : undefined}
                      onClick={() => {
                        if (hasValidTask) {
                          navigate(`/tasks/${taskId}`);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (hasValidTask && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          navigate(`/tasks/${taskId}`);
                        }
                      }}
                      className={`bg-white rounded-2xl p-5 border shadow-xs space-y-3 transition-all group ${
                        hasValidTask
                          ? "cursor-pointer border-[#E1E8F2] hover:border-[#6D3DF5] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6D3DF5]/30"
                          : "border-[#E1E8F2] opacity-80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D3DF5] bg-[#F3EEFF] px-2 py-0.5 rounded-full border border-[#E9E1FF]">
                            {req.task?.category || "Mentorship"}
                          </span>
                          <h4 className="font-bold text-sm text-[#0F172A] mt-1.5 leading-snug group-hover:text-[#6D3DF5] transition-colors truncate">
                            {req.task?.title || "Mentorship Session"}
                          </h4>
                        </div>
                        <span
                          onClick={(e) => e.stopPropagation()}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                            req.status === "accepted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : req.status === "rejected"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      {/* Company Name / Profile Link */}
                      {companyName && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (companyId) {
                              navigate(`/profile/${companyId}?view=company`);
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 text-xs text-[#64748B] ${
                            companyId
                              ? "cursor-pointer hover:text-[#6D3DF5] group/company"
                              : ""
                          }`}
                          title={companyId ? `View ${companyName}'s profile` : undefined}
                        >
                          <Building2 size={13} className="text-[#94A3B8]" />
                          <span className={companyId ? "group-hover/company:underline" : ""}>
                            {companyName}
                          </span>
                        </div>
                      )}

                      {/* Guided Student Profile Link */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (studentId) {
                            navigate(`/profile/${studentId}`);
                          }
                        }}
                        className={`flex items-center gap-2 pt-1 ${
                          studentId
                            ? "cursor-pointer group/student hover:text-[#6D3DF5] transition-colors"
                            : ""
                        }`}
                        title={studentId ? `View ${student.name}'s profile` : undefined}
                      >
                        <Avatar
                          name={student.name || "Student"}
                          src={student.ImageUrl || student.avatar}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-[#E2E8F0]"
                          initialsClassName="text-[10px] font-bold text-white"
                        />
                        <span className="text-xs font-semibold text-[#0F172A] group-hover/student:underline">
                          {student.name || "Guided Student"}
                        </span>
                      </div>

                      {req.meetLink && (isOwner || req.status === "accepted") && (
                        <a
                          href={req.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D3DF5] hover:text-[#5B2FD6] pt-1"
                        >
                          <ExternalLink size={13} />
                          <span>Join Mentorship Session</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FACULTY MENTOR STUDENTS */}
        {activeTab === "mentor-students" && isFaculty && (
          <div className="space-y-4">
            {facultyLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] flex flex-col items-center justify-center">
                <Loader2 size={28} className="text-[#6D3DF5] animate-spin mb-3" />
                <p className="text-xs font-bold text-[#64748B]">Loading students...</p>
              </div>
            ) : facultyRequests.filter((r) => r.status === "accepted").length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] shadow-xs">
                <div className="w-14 h-14 bg-[#F2ECFF] rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#6D3DF5]">
                  <Users size={24} />
                </div>
                <h3 className="font-bold text-sm text-[#0F172A] mb-1">No mentored students yet</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Students whose mentorship requests have been accepted will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facultyRequests
                  .filter((r) => r.status === "accepted")
                  .map((req) => {
                    const student = req.student || {};
                    const studentId = student._id || student.id;
                    return (
                      <div
                        key={req._id}
                        className="bg-white rounded-2xl p-4.5 border border-[#E1E8F2] shadow-xs flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            name={student.name || "Student"}
                            src={student.ImageUrl || student.avatar}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#F1F5F9] shrink-0"
                            initialsClassName="text-xs font-bold text-white"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-[#0F172A] truncate">
                              {student.name || "Student"}
                            </h4>
                            <p className="text-xs text-[#64748B] truncate">
                              {student.Profile?.branch || student.Profile?.InstituteName || "Student"}
                            </p>
                            <p className="text-[11px] text-[#94A3B8] truncate mt-1">
                              Task: {req.task?.title || "Mentorship"}
                            </p>
                          </div>
                        </div>

                        {studentId && (
                          <div className="pt-3 mt-3 border-t border-[#F1F5F9]">
                            <button
                              onClick={() => navigate(`/profile/${studentId}`)}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F2ECFF] text-xs font-bold text-[#6D3DF5] border border-[#E1E8F2] transition-colors cursor-pointer"
                            >
                              <span>View Profile</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INDUSTRY COMPANY TASKS */}
        {(activeTab === "held-tasks" || activeTab === "company-tasks") && isIndustry && (
          <div className="space-y-4">
            {industryLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] flex flex-col items-center justify-center">
                <Loader2 size={28} className="text-[#6D3DF5] animate-spin mb-3" />
                <p className="text-xs font-bold text-[#64748B]">Loading company tasks...</p>
              </div>
            ) : industryTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E1E8F2] shadow-xs">
                <div className="w-14 h-14 bg-[#F2ECFF] rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#6D3DF5]">
                  <Briefcase size={24} />
                </div>
                <h3 className="font-bold text-sm text-[#0F172A] mb-1">No company tasks yet</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Tasks published by this industry account will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {industryTasks.map((task) => {
                  const taskId = task._id;
                  const hasValidTask = Boolean(taskId);
                  const companyId =
                    task.createdBy?._id ||
                    (typeof task.createdBy === "string" ? task.createdBy : null) ||
                    targetUserId;
                  const companyUser =
                    typeof task.createdBy === "object" ? task.createdBy : user;
                  const companyName =
                    task.companyName || companyUser?.name || "Company Partner";
                  const companyAvatar =
                    companyUser?.Profile?.avatar || companyUser?.ImageUrl;
                  const isTaskClosed =
                    task.lastDateToSubmit &&
                    new Date(task.lastDateToSubmit).getTime() < Date.now();

                  return (
                    <div
                      key={task._id}
                      role={hasValidTask ? "button" : undefined}
                      tabIndex={hasValidTask ? 0 : undefined}
                      onClick={() => {
                        if (hasValidTask) {
                          navigate(`/tasks/${taskId}`);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (hasValidTask && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          navigate(`/tasks/${taskId}`);
                        }
                      }}
                      className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between space-y-3 transition-all group ${
                        hasValidTask
                          ? "cursor-pointer border-[#E1E8F2] hover:border-[#6D3DF5] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6D3DF5]/30"
                          : "border-[#E1E8F2] opacity-80"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D3DF5] bg-[#F3EEFF] px-2 py-0.5 rounded-full border border-[#E9E1FF]">
                            {task.location || "Remote"}
                          </span>
                          <span
                            onClick={(e) => e.stopPropagation()}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                              isTaskClosed
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isTaskClosed ? "Closed" : "Active"}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#0F172A] mt-2 leading-snug group-hover:text-[#6D3DF5] transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-xs text-[#64748B] mt-1">Role: {task.roleOffered}</p>

                        {/* Company Link / Avatar */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (companyId) {
                              navigate(`/profile/${companyId}?view=company`);
                            }
                          }}
                          className={`inline-flex items-center gap-2 text-xs text-[#64748B] mt-2.5 ${
                            companyId
                              ? "cursor-pointer group/company hover:text-[#6D3DF5] transition-colors"
                              : ""
                          }`}
                          title={companyId ? `View ${companyName}'s profile` : undefined}
                        >
                          <div className="w-5 h-5 rounded-md bg-[#EDE9FE] text-[#6D3DF5] flex items-center justify-center shrink-0 overflow-hidden group-hover/company:bg-[#6D3DF5] group-hover/company:text-white transition-colors">
                            {companyAvatar ? (
                              <img
                                src={companyAvatar}
                                alt={companyName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 size={12} />
                            )}
                          </div>
                          <span className="font-medium group-hover/company:underline">
                            {companyName}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
                        <span
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium flex items-center gap-1 text-[#64748B]"
                        >
                          <Users size={12} className="text-[#94A3B8]" />
                          {task.submissions?.length || 0} applicants
                        </span>
                        {task.packageRange && (
                          <span className="font-bold text-[#0F172A]">{task.packageRange}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedProfileView;
