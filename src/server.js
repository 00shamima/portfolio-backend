import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import homeRoutes from "./routes/home.routes.js"; 
import aboutRoutes from "./routes/about.routes.js"; 
import experienceRoutes from "./routes/experience.routes.js"; 
import skillRoutes from "./routes/skill.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploads publicly
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
//app.use("/api/contacts", contactRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/contact", contactRoutes);

// add other route registrations: /api/home, /api/about, /api/skills, /api/experience

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
