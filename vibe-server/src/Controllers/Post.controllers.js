import { Post } from "../models/Post.js";
import { User } from "../models/Users.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { notify } from "../services/notify.js";
// import { sendZohoEmail } from "../services/zohMail.js";


// Post.controllers.js
export const createPost = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { type = "Post", content, title, category, tags } = body;
  const author = req.user._id;

  if (type === "Post" && (!title || !category)) {
    throw new ApiError(400, "Title & Category are required for a post.");
  }

  let attachmentUrls = [];
  if (req.files?.attachments && req.files.attachments.length > 0) {
    const localPaths = req.files.attachments.map((file) => file.path);
    const uploadedAttachments = await Promise.all(
      localPaths.map((p) => uploadOnCloudinary(p))
    );
    attachmentUrls = uploadedAttachments.map((file) => file?.url || "").filter(Boolean);
  }

  const newPost = new Post({
    type,
    content,
    title,
    category,
    tags: (() => {
      if (Array.isArray(tags)) return tags;
      if (typeof tags === "string") {
        try {
          const parsed = JSON.parse(tags);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return [tags];
        }
      }
      return [];
    })(),
    author,
    attachments: attachmentUrls
  });

  await newPost.save();
  const populatedPost = await Post.findById(newPost._id).populate("author", "-password");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedPost, "Post created successfully!"));
});

export const createComment = asyncHandler(async (req, res) => {
  const { content, parent, parentComment } = req.body;
  const author = req.user._id;

  // Check if parent post exists
  const parentPost = await Post.findById(parent).populate("author");
  if (!parentPost) {
    throw new ApiError(404, "Parent post not found");
  }

  // Save comment
  const newComment = new Post({
    type: "Comment",
    content,
    author,
    parent,
    parentComment: parentComment || null,
  });
  await newComment.save();

  // Send email notification to parent post's author
  // if (parentPost.author && parentPost.author.email) {
  //   try {
  //     await sendZohoEmail(
  //       parentPost.author.email,
  //       "comment",
  //       {
  //         comment: content,
  //         link: "https://www.curioteach.com/community/profile"
  //       }
  //     );
  //     console.log(`email sent to ${parentPost.author.email}`);
  //   } catch (err) {
  //     console.error("Failed to send comment notification email:", err.message);
  //     // don't throw error, we still want to return success
  //   }
  // }

  // In-app notification for the post author (fire-and-forget, skip self-comments)
  if (parentPost.author?._id && String(parentPost.author._id) !== String(author)) {
    await notify({
      recipient: parentPost.author._id,
      sender: author,
      type: "comment",
      title: "New comment on your post",
      message: `${req.user?.name || "Someone"} commented: "${String(content || "").slice(0, 120)}"`,
      link: "",
      meta: { postId: parentPost._id, commentId: newComment._id },
    }).catch(() => {});
  }

  // If this is a reply to another comment, also notify parent comment author
  if (parentComment) {
    const parentCommentDoc = await Post.findById(parentComment);
    if (parentCommentDoc?.author && String(parentCommentDoc.author) !== String(author)) {
      await notify({
        recipient: parentCommentDoc.author,
        sender: author,
        type: "comment",
        title: "New reply to your comment",
        message: `${req.user?.name || "Someone"} replied: "${String(content || "").slice(0, 120)}"`,
        link: "",
        meta: { postId: parentPost._id, commentId: newComment._id, parentCommentId: parentComment },
      }).catch(() => {});
    }
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        await newComment.populate("author"),
        "Comment added successfully!"
      )
    );
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.aggregate([
    { $match: { type: "Post" } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "parent",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    {
      $lookup: {
        from: "users",
        localField: "comments.author",
        foreignField: "_id",
        as: "commentAuthors",
      },
    },
    {
      $addFields: {
        comments: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              _id: "$$comment._id",
              content: "$$comment.content",
              createdAt: "$$comment.createdAt",
              parentComment: "$$comment.parentComment",
              vibes: "$$comment.vibes",
              author: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$commentAuthors",
                      as: "ca",
                      cond: { $eq: ["$$ca._id", "$$comment.author"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        "author.password": 0,
        "comments.author.password": 0,
        commentAuthors: 0,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, posts, "Fetched all posts successfully"));
});


export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "parent",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    { $sort: { "comments.createdAt": -1 } },
    {
      $project: {
        "author.password": 0,
      },
    },
  ]);

  if (!post.length) {
    throw new ApiError(404, "Post not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, post[0], "Post fetched successfully"));
});


export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  await Post.deleteMany({ $or: [{ _id: id }, { parent: id }] });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Post and comments deleted successfully"));
});


export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, category, tags } = req.body;
  const author = req.user._id

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, "Post not found");

  if (post.author.toString() !== author) {
    throw new ApiError(403, "Unauthorized to update this post");
  }

  let attachmentUrls = post.attachments;
  if (req.files?.attachments) {
    const attachmentsLocalPaths = req.files.attachments.map(
      (file) => file.path
    );
    const uploadedAttachments = await Promise.all(
      attachmentsLocalPaths.map((path) => uploadOnCloudinary(path))
    );
    attachmentUrls = uploadedAttachments.map((file) => file?.url || "");
  }

  post.title = title || post.title;
  post.content = content || post.content;
  post.category = category || post.category;
  post.tags = tags || post.tags;
  post.attachments = attachmentUrls;

  await post.save();

  const updatedPost = await Post.findById(id).populate("author", "-password");

  res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});


export const updateVibe = asyncHandler(async (req, res) => {
  const { postId, reaction = "vibe" } = req.body;
  const userId = req.user._id.toString();

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  if (!post.vibes) {
    post.vibes = new Map();
  }

  const validReactions = ["vibe", "celebrate", "support", "love", "insightful", "funny"];
  const selectedReaction = validReactions.includes(reaction) ? reaction : "vibe";

  let removed = false;
  const existingReaction = post.vibes.get(userId);

  if (existingReaction !== undefined) {
    // If the existing reaction matches selected, toggle it off
    const isSame =
      existingReaction === selectedReaction ||
      (existingReaction === true && selectedReaction === "vibe");

    if (isSame) {
      post.vibes.delete(userId);
      removed = true;
    } else {
      post.vibes.set(userId, selectedReaction);
      removed = false;
    }
  } else {
    post.vibes.set(userId, selectedReaction);
    removed = false;
  }

  await post.save();

  // If reaction added (not removed) and not author's own post, send notification
  if (!removed && post.author && String(post.author) !== String(userId)) {
    const reactionEmojis = {
      vibe: "🤘",
      celebrate: "🎉",
      support: "🤝",
      love: "❤️",
      insightful: "💡",
      funny: "😂",
    };
    const emoji = reactionEmojis[selectedReaction] || "🤘";
    try {
      await notify({
        recipient: post.author,
        sender: req.user._id,
        type: "reaction",
        title: "New reaction on your post",
        message: `${req.user?.name || "Someone"} reacted ${emoji} to your post`,
        link: "",
        meta: { postId: post._id, reaction: selectedReaction },
      });
    } catch (e) {
      // ignore notification errors
    }
  }

  // Calculate breakdown
  const breakdown = {
    vibe: 0,
    celebrate: 0,
    support: 0,
    love: 0,
    insightful: 0,
    funny: 0,
  };
  for (const [, r] of post.vibes.entries()) {
    const rType = r === true ? "vibe" : r;
    if (breakdown[rType] !== undefined) {
      breakdown[rType]++;
    } else {
      breakdown.vibe++;
    }
  }

  const vibesObj = Object.fromEntries(post.vibes);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        post,
        vibes: vibesObj,
        vibeCount: post.vibes.size,
        userReaction: removed ? null : selectedReaction,
        breakdown,
        remove: removed,
      },
      removed ? "Reaction removed" : "Reaction updated"
    )
  );
});

//get posts by user Id
export const getPostByUserId = asyncHandler(async (req, res) => {
  const targetId = req.params.userId || req.user?._id || req.user?.id;
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const posts = await Post.aggregate([
    { $match: { author: new mongoose.Types.ObjectId(targetId), type: "Post" } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "parent",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    {
      $lookup: {
        from: "users",
        localField: "comments.author",
        foreignField: "_id",
        as: "commentAuthors",
      },
    },
    {
      $addFields: {
        comments: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              _id: "$$comment._id",
              content: "$$comment.content",
              createdAt: "$$comment.createdAt",
              parentComment: "$$comment.parentComment",
              vibes: "$$comment.vibes",
              author: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$commentAuthors",
                      as: "ca",
                      cond: { $eq: ["$$ca._id", "$$comment.author"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        "author.password": 0,
        "author.refreshToken": 0,
        "author.otp": 0,
        "comments.author.password": 0,
        "comments.author.refreshToken": 0,
        "comments.author.otp": 0,
        commentAuthors: 0,
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, posts, "Fetched posts by user successfully"));
});

// Toggle bookmark for a post
export const toggleBookmark = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.bookmarks) {
    user.bookmarks = [];
  }

  const isBookmarked = user.bookmarks.some((b) => b.toString() === postId);
  let bookmarked = false;

  if (isBookmarked) {
    user.bookmarks = user.bookmarks.filter((b) => b.toString() !== postId);
    bookmarked = false;
  } else {
    user.bookmarks.push(postId);
    bookmarked = true;
  }

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, { bookmarked, bookmarks: user.bookmarks }, bookmarked ? "Post bookmarked" : "Bookmark removed"));
});

// Get all bookmarked posts for the current user
export const getBookmarkedPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const bookmarkIds = (user.bookmarks || [])
    .filter(Boolean)
    .map((id) => (id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)));

  if (bookmarkIds.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Fetched bookmarked posts successfully"));
  }

  const bookmarkedPosts = await Post.aggregate([
    { $match: { _id: { $in: bookmarkIds }, type: "Post" } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "parent",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    {
      $lookup: {
        from: "profiles",
        localField: "author.Profile",
        foreignField: "_id",
        as: "authorProfile",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "comments.author",
        foreignField: "_id",
        as: "commentAuthors",
      },
    },
    {
      $addFields: {
        "author.Profile": { $arrayElemAt: ["$authorProfile", 0] },
        comments: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              _id: "$$comment._id",
              content: "$$comment.content",
              createdAt: "$$comment.createdAt",
              parentComment: "$$comment.parentComment",
              vibes: "$$comment.vibes",
              author: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$commentAuthors",
                      as: "ca",
                      cond: { $eq: ["$$ca._id", "$$comment.author"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        "author.password": 0,
        "author.refreshToken": 0,
        "author.otp": 0,
        "comments.author.password": 0,
        "comments.author.refreshToken": 0,
        "comments.author.otp": 0,
        authorProfile: 0,
        commentAuthors: 0,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, bookmarkedPosts, "Fetched bookmarked posts successfully"));
});

