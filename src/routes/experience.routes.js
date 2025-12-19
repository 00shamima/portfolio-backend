import express from "express";
import {
  getExperience,
  createExperience,
  deleteExperience,
} from "../controllers/experience.controller.js";
import { authAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

// Frontend-il call pannum '/journey' endpoint idhu thaan
router.get("/journey", getExperience); 

router.post("/", authAdmin, createExperience);
router.delete("/:id", authAdmin, deleteExperience);

// Idhu illaiyendraal server.js-il crash aagum
export default router;