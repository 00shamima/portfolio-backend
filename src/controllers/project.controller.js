import prisma from "../prismaClient.js";
import fs from "fs/promises"; // Use async version for file ops (for deletion)
import path from "path"; // Required for constructing full paths

// Helper function to safely parse form data fields coming as strings from FormData
const parseFormDataField = (fieldValue, type) => {
    if (type === 'boolean') {
        // Safely converts "true" string to true, and anything else (including "false") to false
        return fieldValue === 'true' || fieldValue === true;
    }
    if (type === 'array') {
        if (!fieldValue) return [];
        if (Array.isArray(fieldValue)) return fieldValue;
        try {
            // 1. Try parsing if frontend sent it as a JSON string
            return JSON.parse(fieldValue);
        } catch (e) {
            // 2. Fallback: treat as a comma-separated string if JSON parsing fails
            if (typeof fieldValue === 'string') {
                return fieldValue.split(',').map(t => t.trim()).filter(t => t.length > 0);
            }
            return [];
        }
    }
    return fieldValue;
};

// --- Create Project ---
export const createProject = async (req, res) => {
    try {
        const { title, description, techStack, repoLink, demoLink, featured } = req.body;
        
        // 1. Safe Parsing for Array and Boolean fields
        const techStackData = parseFormDataField(techStack, 'array');
        const featuredBoolean = parseFormDataField(featured, 'boolean');

        // 2. Handle images (using the corrected path matching the Multer setup)
        const images = req.files 
            ? req.files.map(f => `/uploads/projects/${f.filename}`)
            : [];

        // Simple validation
        if (!title || !description) {
            // If creation fails due to missing fields, delete any uploaded files
            if (req.files) {
                for (const file of req.files) {
                    await fs.unlink(file.path).catch(e => console.error(`Failed to clean up orphaned file: ${file.path}`, e));
                }
            }
            return res.status(400).json({ message: "Title and description are required." });
        }

        const project = await prisma.project.create({
            data: {
                title,
                description,
                techStack: techStackData,
                repoLink,
                demoLink,
                featured: featuredBoolean,
                images,
            },
        });
        res.status(201).json(project);
    } catch (err) {
        console.error("Create Project Error:", err);
        // Ensure any newly uploaded files are cleaned up if DB create fails
        if (req.files) {
            for (const file of req.files) {
                await fs.unlink(file.path).catch(e => console.error(`Failed to clean up new file on DB error: ${file.path}`, e));
            }
        }
        res.status(500).json({ message: "Server error" });
    }
};

// --- Get All Projects (Read) ---
export const getProjects = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || "1"));
        const limit = Math.min(100, parseInt(req.query.limit || "10"));
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.project.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.project.count(),
        ]);

        res.json({
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            items,
        });
    } catch (err) {
        console.error("Get Projects Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// --- Get Single Project (FIXED: Robust Error Handling for Invalid ID) ---
export const getProject = async (req, res) => {
    try {
        const id = req.params.id;
        
        const p = await prisma.project.findUnique({ where: { id } });
        
        // Handle record not found
        if (!p) return res.status(404).json({ message: "Project not found" });
        
        res.json(p);
    } catch (err) {
        console.error("Get Single Project Error:", err);
        
        // Specific handling for Prisma's invalid ID format errors
        if (err.code && err.code.startsWith('P')) {
             // If the ID format is invalid (e.g., non-UUID string), return 404/400
             return res.status(404).json({ message: "Invalid project ID format or Project not found." });
        }
        
        return res.status(500).json({ message: "Server error fetching project." });
    }
};

// --- Update Project ---
export const updateProject = async (req, res) => {
    const id = req.params.id;
    // imagesToKeep is sent by the frontend: an array of paths for images the user didn't delete
    const { imagesToKeep, ...restData } = req.body; 
    let newFilesUploaded = req.files && req.files.length > 0;

    try {
        const existingProject = await prisma.project.findUnique({ where: { id } });
        if (!existingProject) {
            // Delete new files if project doesn't exist
            if (newFilesUploaded) {
                for (const file of req.files) { await fs.unlink(file.path).catch(() => {}); }
            }
            return res.status(404).json({ message: "Project not found" });
        }

        // 1. Prepare Data with safe parsing
        let updateData = {
            ...restData,
            techStack: parseFormDataField(restData.techStack, 'array'),
            featured: parseFormDataField(restData.featured, 'boolean'),
        };

        // 2. Determine Images to Keep/Delete
        const keepers = parseFormDataField(imagesToKeep, 'array');
        const imagesToDelete = existingProject.images.filter(img => !keepers.includes(img));

        // 3. Perform Physical Deletion of old images
        for (const imageUrl of imagesToDelete) {
            const fullPath = path.join(process.cwd(), imageUrl);
            await fs.unlink(fullPath).catch(e => console.warn(`Could not delete file: ${fullPath}`, e));
        }

        // 4. Construct Final Image Array (Keepers + New Uploads)
        const newUploadedImages = newFilesUploaded
            ? req.files.map(f => `/uploads/projects/${f.filename}`)
            : [];
            
        updateData.images = [...keepers, ...newUploadedImages];

        
        const updated = await prisma.project.update({ where: { id }, data: updateData });
        res.json(updated);

    } catch (err) {
        console.error("Update Project Error:", err);
        if (newFilesUploaded) {
            for (const file of req.files) {
                await fs.unlink(file.path).catch(e => console.error(`Failed to clean up new file after DB error: ${file.path}`, e));
            }
        }
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteProject = async (req, res) => {
    const id = req.params.id;
    try {
        const projectToDelete = await prisma.project.findUnique({ where: { id } });

        if (!projectToDelete) {
            return res.status(404).json({ message: "Project not found" });
        }

        await prisma.project.delete({ where: { id } });

        for (const imageUrl of projectToDelete.images) {
            const fullPath = path.join(process.cwd(), imageUrl);
            await fs.unlink(fullPath).catch(e => console.warn(`File deletion failed for: ${fullPath}`, e));
        }
        
        res.json({ message: "Project and associated files deleted successfully" });
    } catch (err) {
        console.error("Delete Project Error:", err);
         if (err.code === 'P2025') {
            return res.status(404).json({ message: "Project not found." });
        }
        res.status(500).json({ message: "Server error" });
    }
};