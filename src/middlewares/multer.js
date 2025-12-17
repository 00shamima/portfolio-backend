import multer from "multer";
import path from "path";
import fs from "fs";

// Create the dedicated directory for project uploads if it doesn't exist
// NOTE: Files are saved to /backend/uploads/projects
const projectsUploadsDir = path.join(process.cwd(), "uploads", "projects");
if (!fs.existsSync(projectsUploadsDir)) {
    fs.mkdirSync(projectsUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Destination is now explicitly the projects subdirectory
        cb(null, projectsUploadsDir);
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        // Naming format: fieldname-uniqueID.ext
        cb(null, `${file.fieldname}-${unique}${ext}`);
    },
});

// Export the configured Multer instance
export const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});