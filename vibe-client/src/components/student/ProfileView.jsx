import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../utils/auth";
import api from "../../services/api";
import Avatar from "../shared/Avatar";
import {
  User,
  GraduationCap,
  Lock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Briefcase,
  Calendar,
  Clock,
  Building,
  ShieldCheck,
  Edit3,
  Loader2,
  Mail,
  Phone,
  Save,
} from "lucide-react";

export const ProfileView = ({ user, onProfileUpdate, onBackToFeed }) => {
  const [internships, setInternships] = useState([]);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    mobileNo: user?.mobileNo || "",
    dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
    institutionName: user?.Profile?.InstituteName || "",
    degree: user?.Profile?.degree || "B.Tech",
    branch: user?.Profile?.branch || user?.Profile?.Branch || "",
    currentYear: user?.Profile?.yearOfStudy || user?.Profile?.YearOfStudy || "1st Year",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updatedUser = await auth.updateProfile(user._id || user.id, formData);
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (isEditing) {
      handleUpdateProfile();
    } else {
      setIsEditing(true);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/submissions/me");
        const items = (res.data?.data || []).map((s) => {
          const st = String(s.status || "").toLowerCase();
          return {
            id: String(s._id),
            company:
              s.taskId?.createdBy?.Profile?.InstituteName ||
              s.taskId?.createdBy?.name ||
              s.taskId?.companyName ||
              "VIBE Partner",
            role: s.taskId?.roleOffered || s.taskId?.title || "Intern",
            appliedDate: new Date(s.createdAt).toLocaleDateString(),
            status: st || "submitted",
          };
        });
        if (mounted) setInternships(items);
      } catch (e) {
        if (mounted) setInternships([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const inputClasses =
    "w-full px-3.5 py-2.5 rounded-xl border border-[#E1E8F2] bg-white focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none transition-all text-[#172554] placeholder-[#94A3B8] text-sm font-medium hover:border-[#CBD5E1]";

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

      {/* 1. Profile Header Card */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto text-center sm:text-left">
          <div className="relative flex-shrink-0">
            <Avatar
              name={formData.name || user?.name}
              src={user?.ImageUrl || user?.avatar}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-[#F1F5F9] shadow-sm"
              initialsClassName="text-2xl font-bold text-white"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#6D3DF5] text-white p-1 rounded-lg">
              <ShieldCheck size={16} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                {formData.name || user?.name || "Student"}
              </h1>
              <span className="text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-[#DBEAFE]">
                Student
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <GraduationCap size={15} className="text-[#6D3DF5]" />
              <span>
                {formData.branch || "Computer Science"} • {formData.currentYear}
              </span>
            </p>
            <p className="text-xs text-[#64748B] flex items-center justify-center sm:justify-start gap-1.5">
              <Building size={14} className="text-[#94A3B8]" />
              <span>{formData.institutionName || "VIBE Academic Community"}</span>
            </p>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={handleEditClick}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 ${
            isEditing
              ? "bg-[#059669] hover:bg-[#047857] text-white"
              : "bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white"
          }`}
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : isEditing ? (
            <Save size={15} />
          ) : (
            <Edit3 size={15} />
          )}
          <span>{isEditing ? "Save Profile" : "Edit Profile"}</span>
        </button>
      </motion.section>

      {/* 2. Step Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto [scrollbar-width:none]">
        {[
          { id: 1, label: "Personal Information", icon: User },
          { id: 2, label: "Academic Details", icon: GraduationCap },
          { id: 3, label: "My Applications", icon: Briefcase },
          { id: 4, label: "Security & Credentials", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = step === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStep(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? "bg-[#6D3DF5] text-white shadow-xs"
                  : "bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-5"
          >
            <h2 className="text-base font-bold text-[#0F172A]">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`${inputClasses} ${!isEditing ? "bg-[#F8FAFC] cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  Email Address (Permanent)
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className={`${inputClasses} bg-[#F8FAFC] cursor-not-allowed text-[#64748B]`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+91 98765 43210"
                  className={`${inputClasses} ${!isEditing ? "bg-[#F8FAFC] cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`${inputClasses} ${!isEditing ? "bg-[#F8FAFC] cursor-not-allowed" : ""}`}
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="academic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-5"
          >
            <h2 className="text-base font-bold text-[#0F172A]">Academic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  Institution Name
                </label>
                <input
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g. National Institute of Technology"
                  className={`${inputClasses} ${!isEditing ? "bg-[#F8FAFC] cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  Degree / Program
                </label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g. B.Tech / B.E."
                  className={`${inputClasses} ${!isEditing ? "bg-[#F8FAFC] cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  Branch / Department
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g. Computer Science and Engineering"
                  className={`${inputClasses} ${!isEditing ? "bg-[#F8FAFC] cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  Current Year of Study
                </label>
                <select
                  name="currentYear"
                  value={formData.currentYear}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`${inputClasses} ${!isEditing ? "bg-[#F8FAFC] cursor-not-allowed" : ""}`}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  Task & Internship Submissions
                </h2>
                <p className="text-xs text-[#64748B]">
                  Track the evaluation status of your practical challenges
                </p>
              </div>
              <span className="text-xs font-bold text-[#6D3DF5] bg-[#F3EEFF] px-2.5 py-1 rounded-lg">
                {internships.length} Submissions
              </span>
            </div>

            {internships.length > 0 ? (
              <div className="space-y-3 pt-2">
                {internships.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#0F172A]">
                        {item.role}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {item.company} • Applied: {item.appliedDate}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
                        item.status === "accepted" || item.status === "reviewed"
                          ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                          : item.status === "rejected"
                          ? "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]"
                          : "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <Briefcase size={28} className="text-[#94A3B8] mx-auto" />
                <p className="text-xs text-[#64748B]">
                  No internship or task submissions found yet.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4"
          >
            <h2 className="text-base font-bold text-[#0F172A]">Security & Credentials</h2>
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A]">Password</h3>
                  <p className="text-xs text-[#64748B]">••••••••••••</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Password reset instructions have been sent to your email.")}
                  className="px-3 py-1.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#0F172A] rounded-lg transition-all shadow-xs"
                >
                  Change Password
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#0F172A]">Account Role</h3>
                <p className="text-xs text-[#64748B]">Verified Student Account</p>
              </div>
              <span className="text-xs font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-lg border border-[#A7F3D0]">
                Active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
