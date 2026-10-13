import React, { useState } from "react";
import { auth } from "../../utils/auth";
import Avatar from "../shared/Avatar";
import {
  BadgeCheck,
  MapPin,
  Link as LinkIcon,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const Profile = ({ user, tasks = [], onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const INITIAL_ACTIVITY_COUNT = 3;
  const [visibleActivityCount, setVisibleActivityCount] = useState(
    INITIAL_ACTIVITY_COUNT
  );

  const [profileData, setProfileData] = useState({
    companyName: user?.name || user?.companyName || "Company Name",
    tagline: user?.Profile?.position || "Leading Industry Solutions",
    about: user?.Profile?.IndustryType || "Describe your company and its core values here.",
    location: user?.Profile?.location || "Location not set",
    website: "www.yourcompany.com",
    email: user?.email || "contact@yourcompany.com",
    mission: '"Our mission is to provide innovative solutions and empower students with real-world industry experience."',
    whyJoinUs: [
      "Innovative projects with cutting-edge tech",
      "Collaborative and inclusive culture",
      "Growth and learning opportunities",
      "Industry exposure and networking",
    ],
    techStack: user?.Profile?.ExpertiseDomains ? (Array.isArray(user.Profile.ExpertiseDomains) ? user.Profile.ExpertiseDomains : user.Profile.ExpertiseDomains.split(',')) : ["Add your skills"],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const payload = {
        name: profileData.companyName,
        position: profileData.tagline,
        // IndustryType: profileData.about, // Assuming we map about to IndustryType for now
        location: profileData.location,
        expertise: Array.isArray(profileData.techStack) ? profileData.techStack.join(',') : profileData.techStack
      };
      
      const updatedUser = await auth.updateProfile(user._id, payload);
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleSaveProfile();
    } else {
      setIsEditing(true);
    }
  };

  const handleViewMoreActivity = () => {
    setVisibleActivityCount((prev) => prev + 3);
  };

  const handleViewLessActivity = () => {
    setVisibleActivityCount(INITIAL_ACTIVITY_COUNT);
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 1) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Sort tasks by postedAt descending (newest first)
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );
  const visibleTasks = sortedTasks.slice(0, visibleActivityCount);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm border border-orange-100">
        <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 bg-white rounded-2xl p-1 shadow-lg shrink-0">
                <Avatar
                  name={profileData.companyName}
                  src={user?.avatar}
                  className="w-full h-full rounded-xl"
                  initialsClassName="text-4xl"
                />
              </div>
              <div className="mb-2 w-full">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="companyName"
                      value={profileData.companyName}
                      onChange={handleInputChange}
                      className="text-2xl font-bold text-slate-900 border border-orange-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none w-full md:w-1/2"
                      placeholder="Company Name"
                    />
                    <input
                      type="text"
                      name="tagline"
                      value={profileData.tagline}
                      onChange={handleInputChange}
                      className="text-slate-500 font-medium border border-orange-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none w-full md:w-1/2 block"
                      placeholder="Company Tagline"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                      {profileData.companyName}
                      <BadgeCheck
                        className="text-blue-500 fill-blue-50"
                        size={24}
                      />
                    </h1>
                    <p className="text-slate-500 font-medium">
                      {profileData.tagline}
                    </p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={toggleEdit}
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all border shadow-sm flex items-center gap-2 ${
                isEditing
                  ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                  : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
              }`}
            >
              {isEditing ? (
                <>
                  <Save size={18} /> {loading ? "Saving..." : "Save Profile"}
                </>
              ) : (
                "Edit Profile"
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">
                  About Us
                </h3>
                {isEditing ? (
                  <textarea
                    name="about"
                    value={profileData.about}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full border border-orange-200 rounded-xl px-4 py-3 text-slate-600 leading-relaxed focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                    placeholder="Tell us about your company..."
                  />
                ) : (
                  <p className="text-slate-600 leading-relaxed">
                    {profileData.about}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <div
                  className={`flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border ${
                    isEditing
                      ? "border-orange-300 ring-2 ring-orange-100"
                      : "border-slate-100"
                  }`}
                >
                  <MapPin size={18} className="text-orange-500" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      className="bg-transparent border-b border-orange-300 outline-none w-32"
                    />
                  ) : (
                    profileData.location
                  )}
                </div>
                <div
                  className={`flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border ${
                    isEditing
                      ? "border-orange-300 ring-2 ring-orange-100"
                      : "border-slate-100"
                  }`}
                >
                  <LinkIcon size={18} className="text-orange-500" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="website"
                      value={profileData.website}
                      onChange={handleInputChange}
                      className="bg-transparent border-b border-orange-300 outline-none w-32"
                    />
                  ) : (
                    profileData.website
                  )}
                </div>
                <div
                  className={`flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border ${
                    isEditing
                      ? "border-orange-300 ring-2 ring-orange-100"
                      : "border-slate-100"
                  }`}
                >
                  <Mail size={18} className="text-orange-500" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="bg-transparent border-b border-orange-300 outline-none w-40"
                    />
                  ) : (
                    profileData.email
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">
                Company Stats
              </h3>
              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 space-y-4">
                <div className="flex justify-between items-center border-b border-orange-200/50 pb-3">
                  <span className="text-slate-600">Founded</span>
                  <span className="font-bold text-slate-900">2018</span>
                </div>
                <div className="flex justify-between items-center border-b border-orange-200/50 pb-3">
                  <span className="text-slate-600">Company Size</span>
                  <span className="font-bold text-slate-900">50-200</span>
                </div>
                <div className="flex justify-between items-center border-b border-orange-200/50 pb-3">
                  <span className="text-slate-600">Total Hires</span>
                  <span className="font-bold text-slate-900">45+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Avg. Rating</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    4.8 <span className="text-orange-500">★</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-orange-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Zap size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Company Overview
            </h3>
          </div>

          <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award size={14} /> Our Mission
            </h4>
            {isEditing ? (
              <textarea
                name="mission"
                value={profileData.mission}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-slate-700 italic focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
              />
            ) : (
              <p className="text-lg font-medium text-slate-700 italic">
                {profileData.mission}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4">
                Why Join Us?
              </h4>
              {isEditing ? (
                <textarea
                  value={profileData.whyJoinUs.join("\n")}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      whyJoinUs: e.target.value.split("\n"),
                    }))
                  }
                  rows={6}
                  className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm text-slate-600 leading-relaxed focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  placeholder="Enter items separated by new lines"
                />
              ) : (
                <ul className="space-y-4">
                  {profileData.whyJoinUs
                    .filter((item) => item.trim())
                    .map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-slate-600 text-sm"
                      >
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></div>
                        {item}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4">
                Tech Stack
              </h4>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.techStack.join(", ")}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      techStack: e.target.value
                        .split(",")
                        .map((item) => item.trim()),
                    }))
                  }
                  className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm text-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="Comma separated tags e.g. React, Node.js"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.techStack
                    .filter((tech) => tech.trim())
                    .map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 shadow-sm hover:border-orange-300 hover:text-orange-600 transition-colors cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Focus Areas</h3>
          </div>

          <div className="space-y-5">
            {[
              { label: "Artificial Intelligence", percent: 85 },
              { label: "Big Data Analytics", percent: 92 },
              { label: "Cloud Infrastructure", percent: 70 },
              { label: "UX/UI Design", percent: 60 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {item.percent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-orange-50">
            <h4 className="text-sm font-bold text-slate-800 mb-4">
              Office Locations
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    San Francisco, CA
                  </p>
                  <p className="text-xs text-slate-500">Headquarters</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    New York, NY
                  </p>
                  <p className="text-xs text-slate-500">Satellite Office</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">
          Recent Activity
        </h3>
        <div className="space-y-6 border-l-2 border-orange-100 ml-3 pl-8 relative">
          {visibleTasks.length > 0 ? (
            visibleTasks.map((task) => (
              <div
                key={task.id}
                className="relative group animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-white border-4 border-orange-500 group-hover:scale-110 transition-transform shadow-sm"></span>
                <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                  <Calendar size={12} /> {getRelativeTime(task.postedAt)}
                </p>
                <p className="text-slate-800 font-medium">
                  Posted a new task{" "}
                  <span className="font-bold text-orange-600">
                    "{task.title}"
                  </span>
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-500 italic">No recent activity found.</p>
          )}
        </div>

        {sortedTasks.length > INITIAL_ACTIVITY_COUNT && (
          <div className="mt-8 ml-8">
            {visibleActivityCount < sortedTasks.length ? (
              <button
                onClick={handleViewMoreActivity}
                className="text-sm font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
              >
                View More Activity <ChevronDown size={16} />
              </button>
            ) : (
              <button
                onClick={handleViewLessActivity}
                className="text-sm font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
              >
                View Less Activity <ChevronUp size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
