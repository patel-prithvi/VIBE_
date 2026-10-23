import React from "react";
import {
  Check,
  X,
  Github,
  Youtube,
  File,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

export const SubmissionModal = ({ applicant, onClose, onStatusUpdate }) => {
  if (!applicant) return null;

  const normStatus = String(applicant.status || applicant.rawStatus || "").toLowerCase();
  const isApproved = ["approved", "accepted", "selected", "hired"].includes(normStatus);
  const isRejected = ["rejected"].includes(normStatus);
  const isDecided = isApproved || isRejected;

  const handleUpdate = (newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(applicant.id, newStatus);
    }
  };

  const hasAssets = Boolean(
    applicant.resumeLink ||
      applicant.submission?.githubLink ||
      applicant.submission?.videoLink ||
      applicant.submission?.driveLink ||
      (applicant.submission?.otherLinks &&
        applicant.submission.otherLinks.filter(Boolean).length > 0) ||
      (applicant.attachments && applicant.attachments.filter(Boolean).length > 0)
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 touch-none"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col relative overflow-hidden overscroll-contain"
      >
        {/* Header */}
        <div className="p-8 pb-4 bg-white border-b border-[#F3EEFF] shrink-0">
          <div className="flex justify-between items-start mb-2">
            <span className="flex items-center gap-2 text-xs font-bold text-[#6D3DF5] uppercase tracking-widest mb-2">
              <Check size={16} /> Solution Submitted
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {applicant.submission?.projectTitle || "Solution Details"}
          </h2>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-slate-500 text-sm flex items-center gap-2">
              Submitted by{" "}
              <span className="font-bold text-slate-800">{applicant.name}</span> •{" "}
              {applicant.college}
            </p>
            {applicant.submission?.githubLink && (
              <a
                href={applicant.submission.githubLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F3EEFF] text-[#5B2FD6] hover:bg-[#EDE9FE] border border-[#E9E1FF] transition-colors cursor-pointer"
                title="Open GitHub repository"
              >
                <Github size={14} /> View GitHub
              </a>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 pt-6 space-y-6 overscroll-contain">
          {/* Key Details: Student Project Title (Single card, full width) */}
          <div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Student Project Title</h3>
              <p className="text-slate-700 text-sm font-medium">
                {applicant.submission?.projectTitle || "Untitled Project"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Description / Approach
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100 whitespace-pre-line">
              {applicant.submission?.description || "No description provided."}
            </div>
          </div>

          {/* Links Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Submitted Assets
            </h3>
            {hasAssets ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Submission URL / Resume */}
                {applicant.resumeLink && (
                  <a
                    href={applicant.resumeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-violet-600 transition-colors">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-violet-700">
                        Submission URL
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        View Link
                      </p>
                    </div>
                    <ExternalLink
                      size={16}
                      className="text-slate-300 group-hover:text-violet-400"
                    />
                  </a>
                )}

                {/* Github */}
                {applicant.submission?.githubLink && (
                  <a
                    href={applicant.submission.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#C4B5FD] hover:bg-[#F3EEFF]/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-[#6D3DF5] transition-colors">
                      <Github size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-[#5B2FD6]">
                        GitHub Repository
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {applicant.submission.githubLink}
                      </p>
                    </div>
                    <ExternalLink
                      size={16}
                      className="text-slate-300 group-hover:text-[#8B5CF6]"
                    />
                  </a>
                )}

                {/* Video */}
                {applicant.submission?.videoLink && (
                  <a
                    href={applicant.submission.videoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-red-600 transition-colors">
                      <Youtube size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-red-700">
                        Video Demo
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {applicant.submission.videoLink}
                      </p>
                    </div>
                    <ExternalLink
                      size={16}
                      className="text-slate-300 group-hover:text-red-400"
                    />
                  </a>
                )}

                {/* Drive */}
                {applicant.submission?.driveLink && (
                  <a
                    href={applicant.submission.driveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                      <File size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">
                        Additional Resources
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        Google Drive
                      </p>
                    </div>
                    <ExternalLink
                      size={16}
                      className="text-slate-300 group-hover:text-blue-400"
                    />
                  </a>
                )}

                {/* Other Links */}
                {applicant.submission?.otherLinks?.filter(Boolean).map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#C4B5FD] hover:bg-[#F3EEFF]/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-[#6D3DF5] transition-colors">
                      <LinkIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-[#5B2FD6]">
                        Link #{i + 1}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{link}</p>
                    </div>
                    <ExternalLink
                      size={16}
                      className="text-slate-300 group-hover:text-[#8B5CF6]"
                    />
                  </a>
                ))}

                {/* Attachments */}
                {applicant.attachments?.filter(Boolean).map((url, i) => (
                  <a
                    key={`att-${i}`}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                      <File size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700">
                        Attachment #{i + 1}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{url}</p>
                    </div>
                    <ExternalLink
                      size={16}
                      className="text-slate-300 group-hover:text-emerald-400"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No additional links or assets provided.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
          {!isDecided ? (
            <>
              <button
                onClick={() => handleUpdate("Rejected")}
                className="px-6 py-2.5 rounded-xl font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all text-sm flex items-center gap-2 cursor-pointer"
              >
                Reject Solution
              </button>
              <button
                onClick={() => handleUpdate("Approved")}
                className="px-6 py-2.5 rounded-xl font-bold bg-[#6D3DF5] text-white hover:bg-[#5B2FD6] shadow-lg shadow-[#6D3DF5]/20 transition-all text-sm flex items-center gap-2 cursor-pointer"
              >
                <Check size={16} /> Approve Solution
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleUpdate("Pending")}
                className="px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-sm flex items-center gap-2 cursor-pointer"
                title="Undo Decision"
              >
                <RotateCcw size={16} /> Undo
              </button>
              <div
                className={`px-6 py-2.5 rounded-xl font-bold text-sm ${
                  isApproved
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {isApproved ? "Accepted" : "Rejected"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;
