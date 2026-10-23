import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Save,
  RotateCcw,
  Building2,
  GraduationCap,
  Briefcase,
  Clock,
  ShieldCheck,
  Send,
  ChevronDown,
} from "lucide-react";
import { auth } from "../../utils/auth";
import api from "../../services/api";
import { useToast } from "../Toast";

export const SettingsView = ({ user, onProfileUpdate, onBack, initialSection = null }) => {
  const toast = useToast();
  const currentUser = user || auth.getCurrentUser();

  const rawRole = String(
    currentUser?.role || currentUser?.accountType || ""
  ).trim().toLowerCase();
  const isStudent = rawRole === "student";
  const isFaculty = rawRole === "faculty";
  const isIndustry = rawRole === "industry" || rawRole === "industry expert";

  // Collapsible state for each section — initially all collapsed to keep page compact
  const [openSections, setOpenSections] = useState({
    profile: initialSection === "profile",
    email: initialSection === "email",
    password: initialSection === "password",
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // --------------------------------------------------------------------------
  // SECTION A: Profile Update State, Change Detection & Handlers
  // --------------------------------------------------------------------------
  const [profileData, setProfileData] = useState({
    name: "",
    mobileNo: "",
    dob: "",
    // Student fields
    institutionName: "",
    degree: "",
    branch: "",
    currentYear: "",
    // Faculty fields
    position: "",
    department: "",
    expertise: "",
    experience: "",
    // Industry fields
    companyName: "",
    tagline: "",
    about: "",
    location: "",
    industryType: "",
    establishmentYear: "",
    internshipType: "",
    website: "",
  });

  const [initialProfileData, setInitialProfileData] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Initialize profile form with existing values from the backend user record
  useEffect(() => {
    if (currentUser) {
      const prof = currentUser.Profile || {};
      let dobString = "";
      if (currentUser.dob) {
        try {
          dobString = new Date(currentUser.dob).toISOString().split("T")[0];
        } catch {
          dobString = "";
        }
      }

      const initialData = {
        name: currentUser.name || "",
        mobileNo: currentUser.mobileNo || "",
        dob: dobString,
        institutionName: prof.InstituteName || "",
        degree: prof.degree || "",
        branch: prof.branch || "",
        currentYear: prof.yearOfStudy || "",
        position: prof.position || "",
        department: prof.branch || "",
        expertise: prof.ExpertiseDomains || "",
        experience: prof.YearOfExperience || "",
        companyName: currentUser.name || prof.InstituteName || "",
        tagline: prof.position || "",
        about: prof.IndustryType || "",
        location: prof.location || "",
        industryType: prof.IndustryType || "",
        establishmentYear: prof.establishmentYear || "",
        internshipType: prof.internshipType || "",
        website: prof.website || "",
      };

      setProfileData(initialData);
      setInitialProfileData(initialData);
    }
  }, [currentUser?._id]);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Normalizer: trims whitespace and maps null/undefined to empty string
  const normalizeVal = (val) =>
    val === null || val === undefined ? "" : String(val).trim();

  // Change detection: compares normalized current values with original baseline
  const hasProfileChanges = useMemo(() => {
    if (!initialProfileData) return false;

    const fieldsToCheck = isStudent
      ? ["name", "mobileNo", "institutionName", "degree", "branch", "currentYear", "dob"]
      : isFaculty
      ? ["name", "position", "institutionName", "department", "expertise", "experience", "mobileNo"]
      : isIndustry
      ? ["companyName", "tagline", "location", "industryType", "establishmentYear", "about", "mobileNo", "website"]
      : ["name", "mobileNo"];

    return fieldsToCheck.some((key) => {
      const currentVal = normalizeVal(profileData[key]);
      const initialVal = normalizeVal(initialProfileData[key]);
      return currentVal !== initialVal;
    });
  }, [profileData, initialProfileData, isStudent, isFaculty, isIndustry]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser?._id || !hasProfileChanges) return;

    try {
      setSavingProfile(true);

      let payload = {};
      if (isStudent) {
        if (!profileData.name.trim()) {
          toast.error("Full Name is required");
          setSavingProfile(false);
          return;
        }
        payload = {
          name: profileData.name.trim(),
          mobileNo: profileData.mobileNo.trim(),
          dob: profileData.dob || undefined,
          institutionName: profileData.institutionName.trim(),
          degree: profileData.degree.trim(),
          branch: profileData.branch.trim(),
          currentYear: profileData.currentYear.trim(),
        };
      } else if (isFaculty) {
        if (!profileData.name.trim()) {
          toast.error("Full Name is required");
          setSavingProfile(false);
          return;
        }
        payload = {
          name: profileData.name.trim(),
          mobileNo: profileData.mobileNo.trim(),
          dob: profileData.dob || undefined,
          institutionName: profileData.institutionName.trim(),
          position: profileData.position.trim(),
          branch: (profileData.department || profileData.branch).trim(),
          experience: profileData.experience.trim(),
          expertise: profileData.expertise.trim(),
        };
      } else if (isIndustry) {
        const compName = (profileData.companyName || profileData.name).trim();
        if (!compName) {
          toast.error("Company Name is required");
          setSavingProfile(false);
          return;
        }

        const websiteVal = (profileData.website || "").trim();
        if (websiteVal) {
          try {
            const parsed = new URL(websiteVal);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
              toast.error("Website must start with http:// or https://");
              setSavingProfile(false);
              return;
            }
          } catch {
            toast.error("Please enter a valid website URL (e.g. https://www.example.com)");
            setSavingProfile(false);
            return;
          }
        }

        payload = {
          name: compName,
          companyName: compName,
          mobileNo: profileData.mobileNo.trim(),
          tagline: profileData.tagline.trim(),
          position: profileData.tagline.trim(),
          about: (profileData.about || profileData.industryType).trim(),
          industryType: (profileData.industryType || profileData.about).trim(),
          location: profileData.location.trim(),
          establishmentYear: profileData.establishmentYear.trim(),
          internshipType: profileData.internshipType.trim(),
          website: websiteVal,
        };
      } else {
        payload = {
          name: profileData.name.trim(),
          mobileNo: profileData.mobileNo.trim(),
        };
      }

      const updatedUser = await auth.updateProfile(currentUser._id, payload);
      // Update baseline with the freshly saved values and disable the button
      setInitialProfileData({ ...profileData });
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
      toast.success("Profile details updated successfully!");
    } catch (err) {
      console.error("Settings profile update error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
      // Edits are preserved in profileData
    } finally {
      setSavingProfile(false);
    }
  };

  // --------------------------------------------------------------------------
  // SECTION B: Update Email Address State & Handlers
  // --------------------------------------------------------------------------
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState(
    currentUser?.pendingEmail?.email || ""
  );
  const [emailChangeStep, setEmailChangeStep] = useState(
    currentUser?.pendingEmail?.email ? "verify" : "request"
  );
  const [requestingEmail, setRequestingEmail] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [resendingEmailOtp, setResendingEmailOtp] = useState(false);
  const [cancellingEmail, setCancellingEmail] = useState(false);

  // Sync pendingEmail if user updates
  useEffect(() => {
    if (currentUser?.pendingEmail?.email) {
      setPendingEmail(currentUser.pendingEmail.email);
      setEmailChangeStep("verify");
    }
  }, [currentUser?.pendingEmail?.email]);

  const trimmedNewEmail = newEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isNewEmailValid = emailRegex.test(trimmedNewEmail);
  const isDifferentEmail =
    trimmedNewEmail !== (currentUser?.email || "").trim().toLowerCase();
  const canSendVerificationCode =
    isNewEmailValid && isDifferentEmail && !requestingEmail;

  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    if (!canSendVerificationCode) return;

    try {
      setRequestingEmail(true);
      const res = await api.post("/users/request-email-change", {
        newEmail: trimmedNewEmail,
      });
      setPendingEmail(trimmedNewEmail);
      setEmailChangeStep("verify");
      setEmailOtp("");
      toast.success(
        res.data?.message ||
          "Verification code sent! Please check your new email inbox."
      );
    } catch (err) {
      console.error("Email change request error:", err);
      toast.error(
        err.response?.data?.message || "Failed to send verification code"
      );
    } finally {
      setRequestingEmail(false);
    }
  };

  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();
    if (emailOtp.trim().length !== 6 || verifyingEmail) return;

    try {
      setVerifyingEmail(true);
      const res = await api.post("/users/verify-email-change", {
        otp: emailOtp.trim(),
      });
      const updatedUser = res.data?.data;
      if (updatedUser) {
        localStorage.setItem("vibe_user", JSON.stringify(updatedUser));
        if (onProfileUpdate) {
          onProfileUpdate(updatedUser);
        }
      }
      setPendingEmail("");
      setEmailChangeStep("request");
      setNewEmail("");
      setEmailOtp("");
      toast.success("Email address verified and updated successfully!");
    } catch (err) {
      console.error("Verify email change error:", err);
      toast.error(
        err.response?.data?.message || "Invalid or expired verification code"
      );
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (resendingEmailOtp) return;
    try {
      setResendingEmailOtp(true);
      const res = await api.post("/users/resend-email-change-otp");
      setEmailOtp("");
      toast.success(
        res.data?.message || "A new verification code has been sent."
      );
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error(
        err.response?.data?.message || "Failed to resend verification code"
      );
    } finally {
      setResendingEmailOtp(false);
    }
  };

  const handleCancelEmailChange = async () => {
    if (cancellingEmail) return;
    try {
      setCancellingEmail(true);
      await api.post("/users/cancel-email-change");
      setPendingEmail("");
      setEmailChangeStep("request");
      setNewEmail("");
      setEmailOtp("");
      toast.info("Email change request cancelled.");
    } catch (err) {
      console.error("Cancel email change error:", err);
      toast.error("Failed to cancel email change request");
    } finally {
      setCancellingEmail(false);
    }
  };

  // --------------------------------------------------------------------------
  // SECTION C: Change Password State & Handlers
  // --------------------------------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Button disabled until all required fields filled, >=6 chars, matches confirmation, and differs from current
  const canSubmitPasswordChange =
    Boolean(currentPassword.trim()) &&
    Boolean(newPassword) &&
    Boolean(confirmPassword) &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword &&
    newPassword !== currentPassword &&
    !updatingPassword;

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!canSubmitPasswordChange) return;

    try {
      setUpdatingPassword(true);
      await api.post("/users/change-password", {
        currentPassword,
        newPassword,
      });
      // Clear sensitive fields after success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const inputClasses =
    "w-full px-3.5 py-2.5 rounded-xl border border-[#E1E8F2] bg-white focus:border-[#6D3DF5] focus:ring-2 focus:ring-[#6D3DF5]/15 outline-none transition-all text-[#0F172A] placeholder-[#94A3B8] text-sm font-medium hover:border-[#CBD5E1]";

  return (
    <div className="w-full min-w-0 max-w-4xl mx-auto space-y-5 pb-16">
      {/* Page Header */}
      <div className="vibe-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center flex-shrink-0">
            <Settings size={20} className="animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Account Settings
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Manage your personal profile details, email address, and security credentials
            </p>
          </div>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D3DF5] hover:text-[#5B2FD6] transition-colors cursor-pointer self-start sm:self-center"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* ==================================================================== */}
      {/* CARD 1: Update Profile Information */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm">
        {/* Clickable Header Button */}
        <button
          type="button"
          onClick={() => toggleSection("profile")}
          aria-expanded={openSections.profile}
          aria-controls="settings-section-profile"
          className={`w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left transition-colors cursor-pointer select-none rounded-2xl hover:bg-[#FAF9FF]/60 ${
            openSections.profile ? "rounded-b-none border-b border-[#F1F5F9]" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center shrink-0">
              {isIndustry ? (
                <Building2 size={18} />
              ) : isFaculty ? (
                <Briefcase size={18} />
              ) : (
                <GraduationCap size={18} />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#0F172A] truncate sm:overflow-visible">
                Update Profile Information
              </h2>
              <p className="text-xs text-[#64748B] line-clamp-1 sm:line-clamp-none">
                {isStudent
                  ? "Update your academic profile, degree, branch, and contact information"
                  : isFaculty
                  ? "Update your designation, department, domain expertise, and contact details"
                  : "Update your organization name, location, domain, and company details"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center text-[11px] font-semibold text-[#6D3DF5] bg-[#F3EEFF] px-2.5 py-1 rounded-full uppercase tracking-wider">
              {isIndustry ? "Industry" : isFaculty ? "Faculty" : "Student"}
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#6D3DF5] hover:bg-[#F3EEFF] transition-all transform duration-200 ${
                openSections.profile ? "rotate-180 text-[#6D3DF5]" : ""
              }`}
            >
              <ChevronDown size={18} />
            </div>
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {openSections.profile && (
            <motion.div
              id="settings-section-profile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-5 md:p-6 pt-5 space-y-6">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* STUDENT FORM FIELDS */}
                  {isStudent && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. Alex Johnson"
                          className={inputClasses}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          name="mobileNo"
                          value={profileData.mobileNo}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. +91 9876543210"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          College / Institution
                        </label>
                        <input
                          type="text"
                          name="institutionName"
                          value={profileData.institutionName}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. Stanford University"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Degree / Program
                        </label>
                        <input
                          type="text"
                          name="degree"
                          value={profileData.degree}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. B.Tech, BCA, MCA"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Branch / Department
                        </label>
                        <input
                          type="text"
                          name="branch"
                          value={profileData.branch}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. Computer Science & Engineering"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Year of Study
                        </label>
                        <input
                          type="text"
                          name="currentYear"
                          value={profileData.currentYear}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. 3rd Year"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dob"
                          value={profileData.dob}
                          onChange={handleProfileInputChange}
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  )}

                  {/* FACULTY FORM FIELDS */}
                  {isFaculty && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. Dr. Sarah Jenkins"
                          className={inputClasses}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Designation / Position
                        </label>
                        <input
                          type="text"
                          name="position"
                          value={profileData.position}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. Associate Professor"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Institution / University
                        </label>
                        <input
                          type="text"
                          name="institutionName"
                          value={profileData.institutionName}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. MIT Faculty of Engineering"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Department
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={profileData.department}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. Computer Science"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Domain Expertise
                        </label>
                        <input
                          type="text"
                          name="expertise"
                          value={profileData.expertise}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. Machine Learning, Cloud Systems"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Years of Experience
                        </label>
                        <input
                          type="text"
                          name="experience"
                          value={profileData.experience}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. 8+ years"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Contact Mobile Number
                        </label>
                        <input
                          type="tel"
                          name="mobileNo"
                          value={profileData.mobileNo}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. +91 9876543210"
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  )}

                  {/* INDUSTRY FORM FIELDS */}
                  {isIndustry && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Company / Organization Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={profileData.companyName}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. Acme Innovations Inc."
                          className={inputClasses}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Tagline / Motto
                        </label>
                        <input
                          type="text"
                          name="tagline"
                          value={profileData.tagline}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. Building the Future of Intelligent Cloud"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Location / HQ
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={profileData.location}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. Bengaluru, India"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Industry / Domain Type
                        </label>
                        <input
                          type="text"
                          name="industryType"
                          value={profileData.industryType}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. Software & AI Solutions"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Establishment Year
                        </label>
                        <input
                          type="text"
                          name="establishmentYear"
                          value={profileData.establishmentYear}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. 2018"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Company Website (Optional)
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={profileData.website || ""}
                          onChange={handleProfileInputChange}
                          placeholder="https://www.example.com"
                          className={inputClasses}
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          About the Company
                        </label>
                        <textarea
                          name="about"
                          rows={3}
                          value={profileData.about}
                          onChange={handleProfileInputChange}
                          placeholder="Brief overview of your company mission and services..."
                          className={`${inputClasses} resize-none`}
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Contact Mobile Number
                        </label>
                        <input
                          type="tel"
                          name="mobileNo"
                          value={profileData.mobileNo}
                          onChange={handleProfileInputChange}
                          placeholder="e.g. +91 9876543210"
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      disabled={savingProfile || !hasProfileChanges}
                      className="px-5 py-2.5 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <Save size={15} />
                          <span>Save Profile Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================================================================== */}
      {/* CARD 2: Update Email Address */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm">
        {/* Clickable Header Button */}
        <button
          type="button"
          onClick={() => toggleSection("email")}
          aria-expanded={openSections.email}
          aria-controls="settings-section-email"
          className={`w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left transition-colors cursor-pointer select-none rounded-2xl hover:bg-[#FAF9FF]/60 ${
            openSections.email ? "rounded-b-none border-b border-[#F1F5F9]" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center shrink-0">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#0F172A] truncate sm:overflow-visible">
                Update Email Address
              </h2>
              <p className="text-xs text-[#64748B] line-clamp-1 sm:line-clamp-none">
                Your email address is used for authentication and account notifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {emailChangeStep === "verify" && pendingEmail ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                <Clock size={12} className="text-amber-600" />
                <span>Verification Pending</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Active: {currentUser?.email}</span>
              </span>
            )}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#6D3DF5] hover:bg-[#F3EEFF] transition-all transform duration-200 ${
                openSections.email ? "rotate-180 text-[#6D3DF5]" : ""
              }`}
            >
              <ChevronDown size={18} />
            </div>
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {openSections.email && (
            <motion.div
              id="settings-section-email"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-5 md:p-6 pt-5 space-y-4">
                {/* Status Notification if Pending Verification */}
                {emailChangeStep === "verify" && pendingEmail ? (
                  <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center shrink-0 mt-0.5">
                        <Clock size={16} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[#0F172A]">
                          Verification Code Sent
                        </h4>
                        <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                          We sent a 6-digit verification code to{" "}
                          <span className="font-bold text-[#0F172A]">{pendingEmail}</span>.
                          Your current email (
                          <span className="font-semibold text-[#0F172A]">
                            {currentUser?.email}
                          </span>
                          ) remains active until the new address is verified.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleVerifyEmailChange} className="space-y-4 pt-1">
                      <div className="max-w-xs space-y-1">
                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Enter 6-Digit Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 123456"
                          className={`${inputClasses} tracking-widest text-center text-lg font-bold font-mono`}
                          autoComplete="one-time-code"
                          required
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={verifyingEmail || emailOtp.length < 6}
                          className="px-5 py-2.5 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {verifyingEmail ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={15} />
                              <span>Verify & Update Email</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleResendEmailOtp}
                          disabled={resendingEmailOtp}
                          className="px-4 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] border border-[#E2E8F0] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resendingEmailOtp ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <RotateCcw size={14} />
                          )}
                          <span>Resend Code</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelEmailChange}
                          disabled={cancellingEmail}
                          className="px-3.5 py-2.5 text-xs font-semibold text-[#64748B] hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel Request
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <form onSubmit={handleRequestEmailChange} className="space-y-4">
                    <div className="max-w-md space-y-1">
                      <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                        New Email Address
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter new email address..."
                        className={inputClasses}
                        required
                      />
                      {trimmedNewEmail && !isNewEmailValid && (
                        <p className="text-[11px] text-red-500 font-medium pt-0.5">
                          Please enter a valid email address
                        </p>
                      )}
                      {trimmedNewEmail && !isDifferentEmail && (
                        <p className="text-[11px] text-amber-600 font-medium pt-0.5">
                          New email must be different from your current email
                        </p>
                      )}
                      <p className="text-[11px] text-[#94A3B8] pt-0.5">
                        A 6-digit verification code will be sent to this email to verify ownership.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={!canSendVerificationCode}
                        className="px-5 py-2.5 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {requestingEmail ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Sending Code...</span>
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            <span>Send Verification Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================================================================== */}
      {/* CARD 3: Update Password */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-[#E1E8F2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm">
        {/* Clickable Header Button */}
        <button
          type="button"
          onClick={() => toggleSection("password")}
          aria-expanded={openSections.password}
          aria-controls="settings-section-password"
          className={`w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left transition-colors cursor-pointer select-none rounded-2xl hover:bg-[#FAF9FF]/60 ${
            openSections.password ? "rounded-b-none border-b border-[#F1F5F9]" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center shrink-0">
              <Lock size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#0F172A] truncate sm:overflow-visible">
                Update Password
              </h2>
              <p className="text-xs text-[#64748B] line-clamp-1 sm:line-clamp-none">
                Ensure your account is protected with a strong, secure password
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#6D3DF5] hover:bg-[#F3EEFF] transition-all transform duration-200 ${
                openSections.password ? "rotate-180 text-[#6D3DF5]" : ""
              }`}
            >
              <ChevronDown size={18} />
            </div>
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {openSections.password && (
            <motion.div
              id="settings-section-password"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-5 md:p-6 pt-5 space-y-6">
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                  {/* Current Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className={`${inputClasses} pr-10`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                        aria-label={showCurrentPw ? "Hide password" : "Show password"}
                      >
                        {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className={`${inputClasses} pr-10`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                        aria-label={showNewPw ? "Hide password" : "Show password"}
                      >
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {newPassword && newPassword.length < 6 && (
                      <p className="text-[11px] text-red-500 font-medium pt-0.5">
                        New password must be at least 6 characters
                      </p>
                    )}
                    {newPassword && currentPassword && newPassword === currentPassword && (
                      <p className="text-[11px] text-amber-600 font-medium pt-0.5">
                        New password must be different from current password
                      </p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className={`${inputClasses} pr-10`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                        aria-label={showConfirmPw ? "Hide password" : "Show password"}
                      >
                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[11px] text-red-500 font-medium pt-0.5">
                        Passwords do not match
                      </p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                      <p className="text-[11px] text-emerald-600 font-medium pt-0.5 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Passwords match
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!canSubmitPasswordChange}
                      className="px-5 py-2.5 bg-[#6D3DF5] hover:bg-[#5B2FD6] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingPassword ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <Lock size={15} />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsView;
