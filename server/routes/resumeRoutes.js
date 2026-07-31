import express from "express";
import {
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
  getPublicResumeById,
} from "../controllers/resumeController.js";

import protect from "../middlewares/authMiddleware.js";
import upload from "../configs/multer.js";

const resumeRouter = express.Router();

resumeRouter.post("/create", protect, createResume);

resumeRouter.get("/", protect, getUserResumes);

resumeRouter.get("/get/:resumeId", protect, getResumeById);

resumeRouter.put(
  "/update/:resumeId",
  protect,
  upload.single("image"),
  updateResume
);

resumeRouter.delete("/delete/:resumeId", protect, deleteResume);

resumeRouter.get("/public/:resumeId", getPublicResumeById);

export default resumeRouter;