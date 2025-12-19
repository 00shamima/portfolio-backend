import prisma from "../prismaClient.js";

// Portfolio-vil data kaatta idhu thaan mukkiyam
export const getExperience = async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany({ orderBy: { startDate: "desc" } });
    const educations = await prisma.education.findMany({ orderBy: { startDate: "desc" } });
    res.json({ experiences, educations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Error-il kaattum createExperience idhu thaan
export const createExperience = async (req, res) => {
  try {
    const { role, company, startDate, endDate, description } = req.body;
    const exp = await prisma.experience.create({
      data: {
        role,
        company,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
      },
    });
    res.status(201).json(exp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// deleteExperience function-um export aagi irukkanum
export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.experience.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};