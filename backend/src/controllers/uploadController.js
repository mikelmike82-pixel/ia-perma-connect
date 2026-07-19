const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const prisma = require('../utils/prisma');

const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { conversationId } = req.body;
    const senderId = req.user.userId;

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    // Security check: sender must be a participant
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: senderId },
    });

    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }

    const ext = path.extname(req.file.filename).toLowerCase();
    let finalFilename = req.file.filename;

    // If it's an image, compress it with Sharp to save space
    if (IMAGE_TYPES.includes(ext)) {
      const originalPath = req.file.path;
      const compressedFilename = 'compressed-' + req.file.filename;
      const compressedPath = path.join(req.file.destination, compressedFilename);

      await sharp(originalPath)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(compressedPath.replace(ext, '.jpg'));

      // Remove the original uncompressed file
      fs.unlinkSync(originalPath);
      finalFilename = compressedFilename.replace(ext, '.jpg');
    }

    const fileUrl = `/uploads/${finalFilename}`;
    const fileType = IMAGE_TYPES.includes(ext) ? 'image' : 'document';

    // Create the message with the file attached
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        fileUrl,
        fileType,
        content: req.body.caption || null,
      },
      include: {
        sender: { select: { id: true, fullName: true, profilePhoto: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Broadcast in real time, same as text messages
    const io = req.app.get('io');
    io.to(conversationId).emit('newMessage', message);

    res.status(201).json({ message });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Something went wrong during upload' });
  }
};

module.exports = { uploadFile };