import prisma from "../prismaClient.js";

export const getAbout = async (req, res) => {
  try {
    const about = await prisma.about.findFirst();
    res.json(about || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const upsertAbout = async (req, res) => {
  try {
    const { content } = req.body; 
    const resumePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const existing = await prisma.about.findFirst();

    let updated;
    if (!existing) {
      updated = await prisma.about.create({
        data: { content, resumePath },
      });
    } else {
      updated = await prisma.about.update({
        where: { id: existing.id },
        data: { content, resumePath: resumePath || existing.resumePath },
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};