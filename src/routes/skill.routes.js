import express from "express";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skill.controller.js";
import { authAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

router.get("/", getSkills);
router.post("/", authAdmin, createSkill);
router.put("/:id", authAdmin, updateSkill);
router.delete("/:id", authAdmin, deleteSkill);

export default router;