import prisma from "../prismaClient.js";

// PUBLIC GET (with pagination)
export const getExperience = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Number(page);
    limit = Number(limit);

    const experiences = await prisma.experience.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: "desc" },
    });

    const total = await prisma.experience.count();

    res.json({ experiences, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN CREATE
export const createExperience = async (req, res) => {
  try {
    // FIX 1: Extracted 'role' instead of 'title' to match schema.
    const { role, company, startDate, endDate, description } = req.body;
    
    // Simple validation for required fields
    if (!company || !role || !startDate) {
        return res.status(400).json({ error: "Missing required fields: company, role, and startDate." });
    }

    const exp = await prisma.experience.create({
      data: { 
          role, // Use role
          company, 
          // FIX 2: Convert date strings to Date objects
          startDate: new Date(startDate), 
          endDate: endDate ? new Date(endDate) : null, // Handle optional endDate
          description 
      },
    });

    res.status(201).json(exp); // FIX 3: Use 201 Created status
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN UPDATE
export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, company, startDate, endDate, description } = req.body;

    // Manually construct data object to parse dates and ensure only provided fields are updated
    const data = {};
    if (role) data.role = role;
    if (company) data.company = company;
    if (description !== undefined) data.description = description;

    // FIX 2: Convert date strings if provided
    if (startDate) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null; 

    const exp = await prisma.experience.update({
      where: { id },
      data: data, // Use the parsed data object
    });

    res.json(exp);
  } catch (err) {
    // Enhance error handling for 404 Not Found (P2025)
    if (err.code === 'P2025') {
        return res.status(404).json({ error: "Experience entry not found" });
    }
    res.status(500).json({ error: err.message });
  }
};

// ADMIN DELETE
export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.experience.delete({ where: { id } });

    res.status(204).send(); // Use 204 No Content for successful deletion
  } catch (err) {
    // Enhance error handling for 404 Not Found (P2025)
    if (err.code === 'P2025') {
        return res.status(404).json({ message: "Experience entry not found" });
    }
    res.status(500).json({ error: err.message });
  }
};