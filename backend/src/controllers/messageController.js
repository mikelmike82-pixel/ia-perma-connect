const prisma = require('../utils/prisma');

// Get all messages in a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Security check: make sure the logged-in user is actually a participant
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: req.user.userId },
    });

    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, fullName: true, profilePhoto: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Security check: make sure sender is actually a participant
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: senderId },
    });

    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }

const message = await prisma.message.create({
      data: { conversationId, senderId, content },
      include: {
        sender: { select: { id: true, fullName: true, profilePhoto: true } },
      },
    });

    // Bump the conversation's updatedAt so it sorts to the top of the chat list
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Broadcast this new message in real time to everyone in the conversation
    const io = req.app.get('io');
    io.to(conversationId).emit('newMessage', message);

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { getMessages, sendMessage };