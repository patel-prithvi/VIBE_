import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, Home } from "lucide-react";
import { auth } from "../utils/auth";
import api from "../services/api";
import { FacultyTopHeader } from "../components/faculty/FacultyTopHeader";
import { UnifiedProfileView } from "../components/profile/UnifiedProfileView";

export const PublicProfilePage = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentUser = auth.getCurrentUser();

  const forcedView = searchParams.get("view") || searchParams.get("role");
  const roleOverride =
    forcedView === "company" || forcedView === "industry" ? "industry" : null;

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError("");

        // If target is current user, we can start with currentUser
        const isSelf =
          currentUser &&
          (currentUser._id === userId || currentUser.id === userId);

        const res = await api.get(`/users/${userId}`);
        if (mounted && res.data && res.data.data) {
          setProfileUser(res.data.data);
        } else if (mounted && isSelf) {
          setProfileUser(currentUser);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Could not load this user profile. The user might not exist or may have been removed."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
    return () => {
      mounted = false;
    };
  }, [userId]);

  const handleLogout = async () => {
    await auth.logout();
    navigate("/");
  };

  const getDashboardHome = () => {
    const role = (currentUser?.role || currentUser?.accountType || "").toLowerCase();
    if (role === "faculty") return "/dashboard/faculty";
    if (role === "industry" || role === "industry expert") return "/dashboard/industry";
    return "/dashboard/student";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#6D3DF5] selection:text-white">
      {/* 1. Header */}
      <FacultyTopHeader
        user={currentUser}
        onLogout={handleLogout}
        onNavigate={(dest) => {
          const role = (currentUser?.role || currentUser?.accountType || "").trim().toLowerCase();
          if (dest === "bookmarks") {
            if (role === "faculty") localStorage.setItem("vibe_faculty_tab", "bookmarks");
            else if (role === "industry" || role === "industry expert") localStorage.setItem("vibe_industry_tab", "bookmarks");
            else localStorage.setItem("vibe_student_tab", "bookmarks");
          } else if (dest === "profile") {
            if (role === "faculty") localStorage.setItem("vibe_faculty_tab", "profile");
            else if (role === "industry" || role === "industry expert") localStorage.setItem("vibe_industry_tab", "profile");
            else localStorage.setItem("vibe_student_tab", "profile");
          }
          navigate(getDashboardHome());
        }}
        onSearch={() => {}}
        isSidebarCollapsed={true}
        onToggleSidebar={() => {}}
      />

      {/* 2. Main Content */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28">
            <Loader2 className="w-10 h-10 text-[#6D3DF5] animate-spin mb-4" />
            <p className="text-sm font-bold text-[#64748B]">Loading profile...</p>
          </div>
        ) : error || !profileUser ? (
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-red-100 p-8 text-center shadow-xs mt-12">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">Profile Not Found</h3>
            <p className="text-xs text-[#64748B] mb-6 leading-relaxed">
              {error || "We could not find the requested user profile."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-bold text-[#0F172A] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Go Back
              </button>
              <button
                onClick={() => navigate(getDashboardHome())}
                className="px-4 py-2 rounded-xl bg-[#6D3DF5] hover:bg-[#5B2FD6] text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Home size={14} /> Dashboard
              </button>
            </div>
          </div>
        ) : (
          <UnifiedProfileView
            user={profileUser}
            currentUser={currentUser}
            onProfileUpdate={setProfileUser}
            onBack={() => navigate(-1)}
            roleOverride={roleOverride}
          />
        )}
      </main>
    </div>
  );
};

export default PublicProfilePage;
