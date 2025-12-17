import express from "express";
import {
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from "../controllers/experience.controller.js";
import { authAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

router.get("/", getExperience);
router.post("/", authAdmin, createExperience);
router.put("/:id", authAdmin, updateExperience);
router.delete("/:id", authAdmin, deleteExperience);

export default router;
