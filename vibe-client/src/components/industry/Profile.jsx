import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../utils/auth";
import api from "../../services/api";
import Avatar from "../shared/Avatar";
import { useToast } from "../Toast";
import {
  Building,
  Briefcase,
  Users,
  Lock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Edit3,
  Mail,
  MapPin,
} from "lucide-react";

export const Profile = ({ user, tasks = [], applicants = [], onProfileUpdate }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = false;
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: user?.name || user?.companyName || "",
    tagline: user?.Profile?.position || "",
    about: user?.Profile?.IndustryType || "",
    location: user?.Profile?.location || "",
    techStack: Array.isArray(user?.Profile?.ExpertiseDomains)
      ? user.Profile.ExpertiseDomains.join(", ")
      : user?.Profile?.ExpertiseDomains || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const payload = {
        name: formData.companyName,
        position: formData.tagline,
        location: formData.location,
        expertise: formData.techStack,
      };
      const updatedUser = await auth.updateProfile(user._id, payload);
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
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

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    try {
      setPwLoading(true);
      await api.post("/users/change-password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  // Shared input styles matching VIBE dashboard theme
  const inputClasses =
    "w-full px-3.5 py-2.5 rounded-xl border border-[#E1E8F2] bg-white focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none transition-all text-[#172554] placeholder-[#94A3B8] text-sm font-medium hover:border-[#CBD5E1]";

  const companyName = formData.companyName || "Company Name";
  const tagline = formData.tagline || "Leading Industry Solutions";
  const location = formData.location || "Location not set";

  const filledCount = [
    formData.companyName,
    formData.tagline,
    formData.location,
    formData.techStack,
  ].filter((v) => v && v.trim()).length;
  const completion = filledCount * 25;

  const activeTasksCount = (Array.isArray(tasks) ? tasks : []).filter(
    (t) => t.status === "Active" || t.status === "Ongoing"
  ).length;

  return (
    /* Centered content container with a sensible max width (~1150px) */
    <div className="max-w-[1150px] mx-auto w-full space-y-6 pb-12">
      {/* 1. Profile Header Card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto">
          {/* Avatar Container with Purple Theme */}
          <div className="relative group flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#6D3DF5] p-0.5 shadow-sm">
              <Avatar
                name={companyName}
                src={user?.ImageUrl || user?.avatar}
                variant="purple"
                className="w-full h-full rounded-[14px]"
                initialsClassName="text-xl md:text-2xl text-white font-bold"
              />
            </div>
          </div>

          {/* Details & Info */}
          <div className="text-center md:text-left space-y-1 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-xl md:text-2xl font-bold text-[#172554] tracking-tight">
                {companyName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F2ECFF] text-[#6D3DF5] text-[10px] font-bold uppercase tracking-wider border border-[#E9E1FF]">
                {user?.role || "Industry"}
              </span>
            </div>
            <p className="text-[#64748B] font-medium text-xs md:text-sm">
              {tagline} • {location}
            </p>

            {/* Profile Completion Bar */}
            <div className="pt-2 w-full max-w-xs mx-auto md:mx-0">
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className="text-xs font-semibold text-[#64748B]">
                  Profile Completion
                </span>
                <span className="text-xs font-bold text-[#6D3DF5]">
                  {completion}%
                </span>
              </div>
              <div className="h-2 w-full bg-[#F2ECFF] rounded-full overflow-hidden p-0.5 border border-[#E9E1FF]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#6D3DF5] rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        </motion.section>

      {/* 2. Stepper Form Section */}
      <section className="space-y-4">
        {/* Stepper Header */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              step === 1
                ? "bg-[#6D3DF5] text-white shadow-xs"
                : "bg-white text-[#64748B] border border-[#E1E8F2]"
            } transition-colors flex-shrink-0`}
          >
            <Building size={18} />
          </div>
          <div className="h-px w-4 md:w-6 bg-[#CBD5E1]" />
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              step === 2
                ? "bg-[#6D3DF5] text-white shadow-xs"
                : "bg-white text-[#64748B] border border-[#E1E8F2]"
            } transition-colors flex-shrink-0`}
          >
            <Briefcase size={18} />
          </div>
          <h3 className="text-lg font-bold text-[#172554] ml-1.5">
            {step === 1 ? "Company Information" : "Business Profile"}
          </h3>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClasses}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className={inputClasses + " opacity-60 cursor-not-allowed bg-[#F8FAFC]"}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                    />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={inputClasses + " pl-10"}
                      placeholder="e.g. Mumbai, Remote"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Tagline
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={inputClasses}
                    placeholder="e.g. Leading Industry Solutions"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#6D3DF5] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xs hover:bg-[#5B2FD6] transition-all group"
                  >
                    Next Step{" "}
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
              >
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    About the Company
                  </label>
                  <textarea
                    rows={4}
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Describe your company, industry focus and core values..."
                    className={inputClasses + " resize-none"}
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider ml-0.5">
                    Tech Stack & Domains
                  </label>
                  <input
                    type="text"
                    name="techStack"
                    value={formData.techStack}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Comma separated e.g. React, Node.js, AI/ML"
                    className={inputClasses}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2 text-xs text-[#64748B]">
                  <Mail size={14} className="text-[#94A3B8]" />
                  <span>
                    Contact email <span className="font-bold text-[#172554]">{user?.email || "—"}</span> is managed by VIBE verification.
                  </span>
                </div>
                <div className="md:col-span-2 flex flex-col md:flex-row justify-between gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-1.5 text-[#64748B] text-sm font-bold px-3 py-2 hover:text-[#6D3DF5] transition-colors"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Statistics Section (3 equal-width cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#F2ECFF] text-[#6D3DF5] border border-[#E9E1FF] flex items-center justify-center flex-shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
              Tasks Posted
            </span>
            <span className="text-2xl font-black text-[#172554] tracking-tight">
              {(Array.isArray(tasks) ? tasks : []).length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
              Active Tasks
            </span>
            <span className="text-2xl font-black text-[#172554] tracking-tight">
              {activeTasksCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FAF5FF] text-[#7C3AED] border border-[#EDE9FE] flex items-center justify-center flex-shrink-0">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
              Total Applicants
            </span>
            <span className="text-2xl font-black text-[#172554] tracking-tight">
              {(Array.isArray(applicants) ? applicants : []).length}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
