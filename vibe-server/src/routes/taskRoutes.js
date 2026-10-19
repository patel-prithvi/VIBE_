import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  getMyTasks,
  getTasksByCompany,
  updateTask,
  deleteTask,
// sendSampleTask,
} from "../Controllers/task.controller.js";

import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();


// router.get("/test", sendSampleTask);
router.get("/myTasks", verifyJWT, getMyTasks);
router.get("/company/:userId", verifyJWT, getTasksByCompany);
router.get("/", verifyJWT, getAllTasks);
router.post("/", verifyJWT, createTask);

// keep :id routes at the bottom
router.get("/:id", verifyJWT, getTaskById);
router.put("/:id", verifyJWT, updateTask);
router.delete("/:id", verifyJWT, deleteTask);



export default router;
