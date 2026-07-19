const prisma = require('../utils/prisma');

// Get all employees (for starting a new chat) - excludes the logged-in user
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user.userId } },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        jobTitle: true,
        profilePhoto: true,
        isOnline: true,
        lastSeen: true,
      },
      orderBy: { fullName: 'asc' },
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all conversations the logged-in user is part of, with last message preview
const getMyConversations = async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: req.user.userId } },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, profilePhoto: true, isOnline: true, lastSeen: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Start (or return existing) private conversation with another user
const startConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const myId = req.user.userId;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Check if a private conversation already exists between these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: myId } } },
          { participants: { some: { userId: userId } } },
        ],
      },
      include: {
        participants: { include: { user: { select: { id: true, fullName: true, profilePhoto: true, isOnline: true } } } },
      },
    });

    if (existing) {
      return res.status(200).json({ conversation: existing });
    }

    // Otherwise create a new one
    const newConversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [{ userId: myId }, { userId: userId }],
        },
      },
      include: {
        participants: { include: { user: { select: { id: true, fullName: true, profilePhoto: true, isOnline: true } } } },
      },
    });

    res.status(201).json({ conversation: newConversation });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Create a new group conversation
const createGroup = async (req, res) => {
  try {
    const { groupName, memberIds } = req.body;
    const myId = req.user.userId;

    if (!groupName || !groupName.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'At least one member is required' });
    }

    // Combine the creator + selected members, avoiding duplicates
    const allParticipantIds = [...new Set([myId, ...memberIds])];

    const group = await prisma.conversation.create({
      data: {
        isGroup: true,
        groupName: groupName.trim(),
        participants: {
          create: allParticipantIds.map((userId) => ({
            userId,
            isAdmin: userId === myId, // creator becomes admin automatically
          })),
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, fullName: true, profilePhoto: true, isOnline: true } } },
        },
      },
    });

    res.status(201).json({ conversation: group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Add a member to a group
const addGroupMember = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    const myId = req.user.userId;

    // Only admins can add members
    const myMembership = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: myId },
    });

    if (!myMembership || !myMembership.isAdmin) {
      return res.status(403).json({ message: 'Only group admins can add members' });
    }

    const alreadyMember = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });

    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already in this group' });
    }

    await prisma.conversationParticipant.create({
      data: { conversationId, userId },
    });

    res.status(200).json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Remove a member from a group
const removeGroupMember = async (req, res) => {
  try {
    const { conversationId, userId } = req.params;
    const myId = req.user.userId;

    const myMembership = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: myId },
    });

    if (!myMembership || !myMembership.isAdmin) {
      return res.status(403).json({ message: 'Only group admins can remove members' });
    }

    await prisma.conversationParticipant.deleteMany({
      where: { conversationId, userId },
    });

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = {
  getAllUsers,
  getMyConversations,
  startConversation,
  createGroup,
  addGroupMember,
  removeGroupMember,
};