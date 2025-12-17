import prisma from "../prismaClient.js";

// GET — Public
export const getHome = async (req, res) => {
  try {
    const home = await prisma.home.findFirst();
    res.json(home || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST/PUT — Admin (Upsert)
export const upsertHome = async (req, res) => {
  try {
    const { title, subtitle, heroImage } = req.body;

    const existing = await prisma.home.findFirst();

    let updated;
    if (!existing) {
      updated = await prisma.home.create({
        data: { title, subtitle, heroImage },
      });
    } else {
      updated = await prisma.home.update({
        where: { id: existing.id },
        data: { title, subtitle, heroImage },
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
