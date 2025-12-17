import prisma from "../prismaClient.js";

// PUBLIC GET (with pagination and filtering by category)
export const getSkills = async (req, res) => {
  try {
    // Extract page, limit, and the new optional 'category' query parameter
    let { page = 1, limit = 20, category } = req.query;
    page = Number(page);
    limit = Number(limit);

    // Build the WHERE clause for filtering
    const whereClause = category ? { category: category.toUpperCase() } : {};
    
    const skills = await prisma.skill.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereClause, // Apply filtering
    });

    const total = await prisma.skill.count({ where: whereClause });

    res.json({ skills, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN CREATE
export const createSkill = async (req, res) => {
  try {
    // Using 'iconPath' as per schema fix
    const { name, level, iconPath, category } = req.body; 

    const skill = await prisma.skill.create({
      data: { 
          name, 
          // Convert level to number and handle null/undefined
          level: level ? Number(level) : null, 
          iconPath, 
          category: category.toUpperCase() // Ensure category is uppercase string to match ENUM
      },
    });

    // Respond with 201 Created status for successful creation (FIX 1)
    res.status(201).json(skill); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN UPDATE
export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    // Using 'iconPath' and 'category'
    const { name, level, iconPath, category } = req.body; 

    const skill = await prisma.skill.update({
      where: { id },
      data: { 
          name, 
          // Handle level update
          level: level ? Number(level) : undefined, 
          iconPath, 
          // Handle category update, converting to uppercase string if provided
          category: category ? category.toUpperCase() : undefined 
      },
    });

    res.json(skill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN DELETE
export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.skill.delete({ where: { id } });

    // Use 204 No Content for successful deletion without a body (FIX 2)
    res.status(204).send(); 
  } catch (err) {
    // If the record doesn't exist, return a 404 (FIX 3)
    if (err.code === 'P2025') { 
        return res.status(404).json({ message: "Skill not found" });
    }
    res.status(500).json({ error: err.message });
  }
};