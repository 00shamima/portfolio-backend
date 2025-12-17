import express from "express";
import multer from "multer";
import { getAbout, upsertAbout } from "../controllers/about.controller.js";
import { authAdmin } from "../middlewares/authAdmin.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/", getAbout);
router.post("/", authAdmin, upload.single("resume"), upsertAbout);
router.put("/", authAdmin, upload.single("resume"), upsertAbout);

export default router;
