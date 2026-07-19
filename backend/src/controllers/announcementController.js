const prisma = require('../utils/prisma');

// Get all announcements, newest first
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: { select: { id: true, fullName: true, profilePhoto: true, jobTitle: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Create a new announcement - Admins only
const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const authorId = req.user.userId;

    // Check the user's role in the database (never trust the frontend/token alone for this)
    const author = await prisma.user.findUnique({ where: { id: authorId } });

    if (!author || author.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can post announcements' });
    }

    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    let fileUrl = null;
    let fileType = null;

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      const ext = require('path').extname(req.file.filename).toLowerCase();
      fileType = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? 'image' : 'document';
    }

    const announcement = await prisma.announcement.create({
      data: { title: title.trim(), content: content.trim(), fileUrl, fileType, authorId },
      include: {
        author: { select: { id: true, fullName: true, profilePhoto: true, jobTitle: true } },
      },
    });

    // Notify everyone currently online in real time
    const io = req.app.get('io');
    io.emit('newAnnouncement', announcement);

    res.status(201).json({ announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Delete an announcement - Admins only
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await prisma.user.findUnique({ where: { id: req.user.userId } });

    if (!author || author.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete announcements' });
    }

    await prisma.announcement.delete({ where: { id } });
    res.status(200).json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };