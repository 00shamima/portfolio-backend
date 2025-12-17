import prisma from "../prismaClient.js";

// PUBLIC POST: CREATE CONTACT SUBMISSION
export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Enhancement 1: Basic Input Validation (400 Bad Request)
    if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required fields." });
    }

    const created = await prisma.contact.create({
      data: { name, email, message },
    });

    // Enhancement 2: Use 201 Created status for a new resource
    res.status(201).json({ 
        message: "Your message has been successfully submitted!",
        submission: created 
    }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN GET: LIST CONTACTS (with pagination)
export const getContacts = async (req, res) => {
  try {
    // Enhancement 3: Added Pagination
    let { page = 1, limit = 20 } = req.query;
    page = Number(page);
    limit = Number(limit);

    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.contact.count();

    res.json({ contacts, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN DELETE: DELETE CONTACT
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contact.delete({ where: { id } });

    // Enhancement 4: Use 204 No Content for successful deletion
    res.status(204).send(); 
  } catch (err) {
    // Enhancement 5: Handle 404 Not Found for non-existent IDs
    if (err.code === 'P2025') {
        return res.status(404).json({ message: "Contact submission not found" });
    }
    res.status(500).json({ error: err.message });
  }
};