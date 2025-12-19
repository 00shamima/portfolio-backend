import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; 

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import homeRoutes from "./routes/home.routes.js"; 
import aboutRoutes from "./routes/about.routes.js"; 
import experienceRoutes from "./routes/experience.routes.js"; 
import skillRoutes from "./routes/skill.routes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- UPDATED CORS CONFIGURATION FOR GITHUB PAGES ---
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:5174", 
  "https://00shamima.github.io", // Unga live Admin Panel URL
  "https://00shamima.github.io/admin-frontend" // Full path protection
];

app.use(cors({
  origin: function (origin, callback) {
    // Postman matrum server requests-ai allow seiyum
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log("CORS Blocked Origin:", origin);
      return callback(new Error('CORS policy mismatch'), false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// Health Check
app.get("/", (req, res) => res.send("Backend is running successfully!"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/contact", contactRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));