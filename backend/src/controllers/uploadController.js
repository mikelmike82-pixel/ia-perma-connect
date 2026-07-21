const prisma = require('../utils/prisma');

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

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

    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: senderId },
    });

    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }

    // Cloudinary already gives us a permanent, public URL - no more local file paths
    const fileUrl = req.file.path;
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const fileType = IMAGE_EXTENSIONS.includes(ext) ? 'image' : 'document';

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

    const io = req.app.get('io');
    io.to(conversationId).emit('newMessage', message);

    res.status(201).json({ message });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Something went wrong during upload' });
  }
};

module.exports = { uploadFile };