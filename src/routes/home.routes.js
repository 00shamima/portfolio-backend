import express from "express";
import { getHome, upsertHome } from "../controllers/home.controller.js";
import { authAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

router.get("/", getHome);
router.post("/", authAdmin, upsertHome);
router.put("/", authAdmin, upsertHome);

export default router;
