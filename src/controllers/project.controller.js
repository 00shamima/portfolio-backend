import prisma from "../prismaClient.js";
import fs from "fs/promises";
import path from "path";

// Helper for parsing FormData fields
const parseField = (val, type) => {
    if (type === 'boolean') return val === 'true' || val === true;
    if (type === 'array') {
        if (!val) return [];
        try { 
            return Array.isArray(JSON.parse(val)) ? JSON.parse(val) : [JSON.parse(val)]; 
        } catch { 
            return typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(s => s) : []; 
        }
    }
    return val;
};

// --- Create Project ---
export const createProject = async (req, res) => {
    try {
        const { title, description, techStack, repoLink, demoLink, featured } = req.body;
        const images = req.files ? req.files.map(f => `/uploads/projects/${f.filename}`) : [];

        const project = await prisma.project.create({
            data: {
                title,
                description,
                techStack: parseField(techStack, 'array'),
                repoLink,
                demoLink,
                featured: parseField(featured, 'boolean'),
                images,
            },
        });
        res.status(201).json(project);
    } catch (err) {
        console.error("Create Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- Update Project ---
export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { imagesToKeep, title, description, techStack, repoLink, demoLink, featured } = req.body;
        
        const existing = await prisma.project.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: "Project not found" });

        // 1. Handle Images to Keep vs Delete
        const keepers = parseField(imagesToKeep, 'array');
        const toDelete = existing.images.filter(img => !keepers.includes(img));
        
        for (const imgPath of toDelete) {
            const fullPath = path.join(process.cwd(), imgPath);
            await fs.unlink(fullPath).catch(() => console.log("File already deleted or not found"));
        }

        // 2. Add New Uploaded Files
        const newImages = req.files ? req.files.map(f => `/uploads/projects/${f.filename}`) : [];
        
        const updated = await prisma.project.update({
            where: { id },
            data: {
                title,
                description,
                repoLink,
                demoLink,
                techStack: parseField(techStack, 'array'),
                featured: parseField(featured, 'boolean'),
                images: [...keepers, ...newImages]
            }
        });
        res.json(updated);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- Get All Projects ---
export const getProjects = async (req, res) => {
    try {
        const items = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
        res.json({ items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Get Single Project ---
export const getProject = async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!project) return res.status(404).json({ message: "Not found" });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Delete Project ---
export const deleteProject = async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (project) {
            for (const img of project.images) {
                await fs.unlink(path.join(process.cwd(), img)).catch(() => {});
            }
            await prisma.project.delete({ where: { id: req.params.id } });
        }
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};