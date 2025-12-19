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
    // 1. MUST: Intha rendu field-galaiyum req.body-il irunthu edukkavum
    const { content, frontendFocus, performance } = req.body; 
    const resumePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const existing = await prisma.about.findFirst();

    let updated;
    if (!existing) {
      // 2. CREATE logic-il add seiyavum
      updated = await prisma.about.create({
        data: { 
          content, 
          frontendFocus, 
          performance, 
          resumePath 
        },
      });
    } else {
      // 3. UPDATE logic-il add seiyavum
      updated = await prisma.about.update({
        where: { id: existing.id },
        data: { 
          content, 
          frontendFocus, 
          performance, 
          resumePath: resumePath || existing.resumePath 
        },
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("Save Error:", err.message); // Debugging-kku use aagum
    res.status(500).json({ error: err.message });
  }
};