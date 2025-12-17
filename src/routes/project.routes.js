import express from "express";
import {
    createProject, getProjects, getProject, updateProject, deleteProject
} from "../controllers/project.controller.js";
import { authAdmin } from "../middlewares/authAdmin.js"; 
import { upload } from "../middlewares/multer.js"; // Use the corrected 'upload' middleware

const router = express.Router();

// Public read access (for the public portfolio page)
router.get("/", getProjects);
router.get("/:id", getProject);

// --- PROTECTED ADMIN ROUTES ---
// Uses upload.array("images", 6) to receive up to 6 files under the 'images' key
router.post(
    "/", 
    authAdmin, 
    upload.array("images", 6), // Apply multer BEFORE the controller
    createProject
);
router.put(
    "/:id", 
    authAdmin, 
    upload.array("images", 6), // Apply multer for image updates
    updateProject
);
router.delete("/:id", authAdmin, deleteProject);

export default router;