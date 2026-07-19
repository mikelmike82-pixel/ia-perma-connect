const prisma = require('../utils/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await prisma.user.count();

    const onlineUsers = await prisma.user.count({
      where: { isOnline: true },
    });

    const activeGroups = await prisma.conversation.count({
      where: { isGroup: true },
    });

    // Messages sent since midnight today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaysMessages = await prisma.message.count({
      where: { createdAt: { gte: startOfToday } },
    });

    // 5 most recently uploaded files across all conversations
    const recentFiles = await prisma.message.findMany({
      where: { fileUrl: { not: null } },
      include: {
        sender: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Recently joined employees
    const recentEmployees = await prisma.user.findMany({
      select: { id: true, fullName: true, jobTitle: true, department: true, createdAt: true, isOnline: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.status(200).json({
      totalEmployees,
      onlineUsers,
      activeGroups,
      todaysMessages,
      recentFiles,
      recentEmployees,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { getDashboardStats };