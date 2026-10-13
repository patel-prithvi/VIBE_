import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Lock,
  Globe,
  MapPin,
  FileText,
  UserPlus,
  Video,
  ExternalLink,
  XCircle,
  Clock,
  Building2,
} from "lucide-react";
import { CATEGORY_ICONS } from "../constants";

export const TaskCard = ({
  task,
  isSubmitted,
  mentorRequest,
  onOpenInstructions,
  onOpenApply,
  onOpenMentorRequest,
}) => {
  const isClosed = typeof task.deadlineTs === "number" && Date.now() > task.deadlineTs;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-xl shadow-orange-100/50 border border-orange-50 relative overflow-hidden group flex flex-col h-full"
    >
      {/* Decorative Gradient Blob */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-50 rounded-full blur-3xl group-hover:bg-orange-100 transition-colors duration-500 z-0" />

      <div className="relative z-10 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-orange-100/50">
            {CATEGORY_ICONS[task.category]}
            <span>{task.category}</span>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Mode Badge */}
            <div
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                task.mode === "Remote"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : "bg-orange-50 text-orange-600 border-orange-100"
              }`}
            >
              {task.mode === "Remote" ? (
                <Globe size={12} />
              ) : (
                <MapPin size={12} />
              )}
              <span>{task.mode}</span>
            </div>

            {/* Paid Badge */}
            <div
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                task.paid
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-gray-50 text-gray-600 border-gray-100"
              }`}
            >
              {task.paid ? "Paid" : "Unpaid"}
            </div>

            {/* Submitted Badge (icon only) */}
            {isSubmitted && (
              <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                <CheckCircle2 size={14} />
              </div>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-2">
          {task.title}
        </h3>

        {/* Company Name */}
        <div className="flex items-center gap-2 mb-5 mt-3">
          <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
            <Building2 size={14} />
          </div>
          <span className="text-sm font-bold text-gray-700 tracking-tight">
            {task.company}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg">
          <Briefcase size={16} className="text-orange-500" />
          <span className="truncate">
            Role:{" "}
            <span className="text-gray-900 font-semibold">{task.role}</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-white border border-gray-100 text-gray-600 text-xs rounded-md font-medium shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Perks — only shown when the array has at least one item */}
        {task.perks?.length > 0 && (
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg">
            <span className="font-semibold text-gray-800">Perks:</span>
            <span className="text-gray-600">{task.perks.join(", ")}</span>
          </div>
        )}

        {/* Mentor Shared Resources */}
        {mentorRequest && (
          <div className={`mb-6 p-4 rounded-2xl border ${
            mentorRequest.status === 'accepted' 
              ? 'bg-green-50/50 border-green-100 shadow-sm' 
              : mentorRequest.status === 'rejected'
              ? 'bg-red-50/50 border-red-100'
              : 'bg-blue-50/50 border-blue-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                Mentorship Status
              </h4>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                mentorRequest.status === 'accepted'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : mentorRequest.status === 'rejected'
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : 'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
                {mentorRequest.status === 'accepted' ? <CheckCircle2 size={10} /> : 
                 mentorRequest.status === 'rejected' ? <XCircle size={10} /> : <Clock size={10} />}
                {mentorRequest.status}
              </div>
            </div>

            {mentorRequest.status === 'accepted' && (
              <div className="space-y-3">
                {mentorRequest.meetLink && (
                  <a
                    href={mentorRequest.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-white border border-green-100 rounded-xl hover:bg-green-50 transition-all group/link shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-100 text-green-600 rounded-lg group-hover/link:bg-green-600 group-hover/link:text-white transition-colors">
                        <Video size={14} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">Meeting Link</span>
                    </div>
                    <ExternalLink size={12} className="text-gray-400" />
                  </a>
                )}

                {mentorRequest.resources && mentorRequest.resources.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Shared Resources</p>
                    <div className="grid grid-cols-1 gap-2">
                      {mentorRequest.resources.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl hover:border-green-200 hover:bg-green-50/30 transition-all group/res"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gray-100 text-gray-500 rounded-lg group-hover/res:bg-green-100 group-hover/res:text-green-600 transition-colors">
                              <FileText size={14} />
                            </div>
                            <span className="text-xs font-medium text-gray-600 truncate max-w-[120px]">{res.label}</span>
                          </div>
                          <ExternalLink size={12} className="text-gray-300" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {mentorRequest.status === 'rejected' && (
              <p className="text-xs text-red-600 italic">Your request was declined by the mentor.</p>
            )}
            
            {mentorRequest.status === 'pending' && (
              <p className="text-xs text-blue-600 italic">Waiting for mentor to review your request...</p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-5 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-500 text-xs font-medium bg-gray-50 px-2 py-1 rounded">
            <Calendar size={14} className="mr-1.5 text-orange-400" />
            <span>Due {task.deadline}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => onOpenInstructions(task)}
            className="px-3 py-2.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-xl transition-all flex items-center justify-center gap-2 group/btn hover:bg-orange-600 hover:text-white hover:border-orange-600"
          >
            <FileText
              size={16}
              className="group-hover/btn:scale-110 transition-transform"
            />
            Instructions
          </button>

          <button
            onClick={() => onOpenMentorRequest(task)}
            className="px-3 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl transition-all flex items-center justify-center gap-2 group/btn hover:bg-blue-600 hover:text-white hover:border-blue-600"
          >
            <UserPlus
              size={16}
              className="group-hover/btn:scale-110 transition-transform"
            />
            Mentor
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {isSubmitted ? (
            <button
              disabled
              className="px-3 py-2.5 text-sm font-medium text-gray-400 bg-gray-100 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200"
            >
              <Lock size={16} /> Applied
            </button>
          ) : isClosed ? (
            <button
              disabled
              className="px-3 py-2.5 text-sm font-medium text-gray-400 bg-gray-100 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200"
            >
              <Lock size={16} /> Closed
            </button>
          ) : (
            <button
              onClick={() => {
                if (!isClosed) onOpenApply(task);
              }}
              className="px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-xl shadow-md shadow-orange-200 flex items-center justify-center gap-2"
            >
              Apply Now <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
