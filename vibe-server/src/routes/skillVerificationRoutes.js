import express from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import {
  requestSkillTask,
  submitSkillTask,
  getStudentActiveTasks,
  getMentorReviewQueue,
  evaluateSkillTask,
} from "../Controllers/skillVerificationController.js";

const router = express.Router();

// Student routes
router.post("/request", verifyJWT, requestSkillTask);
router.post("/submit/:attemptId", verifyJWT, submitSkillTask);
router.get("/student/active", verifyJWT, getStudentActiveTasks);

// Mentor routes (Double-Blind)
router.get("/mentor/queue", verifyJWT, getMentorReviewQueue);
router.post("/mentor/evaluate/:attemptId", verifyJWT, evaluateSkillTask);

export default router;
