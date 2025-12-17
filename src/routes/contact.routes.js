import express from "express";
import {
  submitContact,
  getContacts,
  deleteContact,
} from "../controllers/contact.controller.js";
import { authAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

router.post("/", submitContact);          // PUBLIC: Create submission
router.get("/", authAdmin, getContacts);  // ADMIN: List submissions
router.delete("/:id", authAdmin, deleteContact); // ADMIN: Delete submission

export default router;