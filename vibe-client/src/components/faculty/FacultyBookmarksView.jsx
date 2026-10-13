import React from "react";
import { Bookmark, ArrowLeft } from "lucide-react";
import { FacultyPostCard } from "./FacultyPostCard";

export const FacultyBookmarksView = ({
  user,
  bookmarkedPosts = [],
  bookmarkedIds = new Set(),
  onToggleBookmark,
  onBackToFeed,
}) => {
  return (
    <div className="w-full min-w-0 space-y-5">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] text-[#6D3DF5] flex items-center justify-center flex-shrink-0">
            <Bookmark size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              My Bookmarks
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Posts, guides, and resources you've saved for reference
            </p>
          </div>
        </div>

        <button
          onClick={onBackToFeed}
          className="flex items-center gap-1.5 text-xs font-bold text-[#6D3DF5] hover:text-[#5B2FD6] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Feed</span>
        </button>
      </div>

      {/* Bookmarked Posts List */}
      <div className="space-y-4">
        {bookmarkedPosts.length > 0 ? (
          bookmarkedPosts.map((post) => {
            const pId = post.id || post._id;
            return (
              <FacultyPostCard
                key={pId}
                post={post}
                currentUser={user}
                isBookmarked={true}
                onToggleBookmark={onToggleBookmark}
              />
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] text-[#94A3B8] flex items-center justify-center mx-auto border border-[#E2E8F0]">
              <Bookmark size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                No bookmarks yet
              </h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 leading-relaxed">
                Save posts that you want to revisit, and they'll appear here.
              </p>
            </div>
            <button
              onClick={onBackToFeed}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#172554] hover:bg-[#0F172A] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Explore Community Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
