import prisma from "../prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config(); 

// --- Configuration Check ---
// IMPORTANT: Ensure your .env file has a JWT_SECRET defined!
// If this is missing, the login token generation will fail silently or crash.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in the environment variables.");
    // In a production app, you might crash the process here: process.exit(1);
}

/**
 * Handles user registration (POST /api/auth/register)
 * Creates a new user in the database with a hashed password.
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // 1. Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Missing fields: name, email, and password are required." });
        }

        // 2. Check if user already exists (case-sensitive by default with Prisma)
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            return res.status(400).json({ message: "Email already used." });
        }

        // 3. Hash the password
        const hashed = await bcrypt.hash(password, 10);
        
        // 4. Create the user
        const user = await prisma.user.create({
            data: { 
                name, 
                // Ensure email is stored in a consistent format (e.g., lowercase)
                email: email.toLowerCase(), 
                password: hashed, 
                // Default to 'admin' if role is not provided or if this route is admin-only
                role: role || "admin" 
            },
            // Select only the non-sensitive fields to return
            select: { id: true, email: true, name: true, role: true }
        });
        
        // 5. Send success response
        return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (err) {
        console.error("Registration Error:", err);
        // Log the error for debugging but send a generic message to the client
        return res.status(500).json({ message: "Server error during registration." });
    }
};

/**
 * Handles user login (POST /api/auth/login)
 * Authenticates user, generates a JWT token, and returns user data.
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by email (ensure case consistency)
        const user = await prisma.user.findUnique({ 
            where: { 
                email: email.toLowerCase() 
            } 
        });

        // 2. Check if user was found
        // IMPORTANT: Returning the same "Invalid credentials" message for both user not found
        // and password mismatch is a security measure to prevent user enumeration attacks.
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3. Compare passwords
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            JWT_SECRET, // Using the variable ensures the check above is respected
            { expiresIn: "7d" }
        );

        // 5. Send token and user data (without password hash)
        return res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name, 
                role: user.role 
            } 
        });
    } catch (err) {
        // This catch block handles errors like database connection issues, 
        // JWT secret being undefined, or bcrypt failing.
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Server error during login." });
    }
};