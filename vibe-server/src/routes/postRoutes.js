import Router from "express";
import {
  createComment,
  createPost,
  deletePost,
  updatePost,
  repostPost,
  getAllPosts,
  getPostById,
  getPostByUserId,
  updateVibe,
  toggleBookmark,
  getBookmarkedPosts,
} from "../Controllers/Post.controllers.js";
import { upload } from "../middlewares/multerMiddleware.js";
import  {verifyJWT}  from "../middlewares/authMiddleware.js";
// import uploadPostImage from "../middlewares/uploadPost.js";
const router = Router();

router.post(
  "/create",
  verifyJWT,
  upload.fields([
    {
      name: "attachments",
      maxCount: 5,
    },
  ]),
  createPost
);


// posts
router.get("/", getAllPosts);
//router.get("/:id" ,getPostById);
router.put(
  "/:id",
  verifyJWT,
  upload.fields([
    {
      name: "attachments",
      maxCount: 5,
    },
  ]),
  updatePost
);
router.delete("/:id", verifyJWT, deletePost);
router.post("/repost", verifyJWT, repostPost);
router.get("/mypost", verifyJWT, getPostByUserId);
router.get("/user/:userId", verifyJWT, getPostByUserId);

// bookmarks
router.post("/bookmark", verifyJWT, toggleBookmark);
router.get("/bookmarks", verifyJWT, getBookmarkedPosts);

// comments
router.post("/comment", verifyJWT, createComment);

// voting
router.put("/vibe", verifyJWT, updateVibe);


export default router;
