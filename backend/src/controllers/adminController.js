const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

// Small reusable helper - checks the requester is actually an admin
const requireAdmin = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user && user.role === 'ADMIN';
};

// Get all employees with full detail, for the admin table
const getAllEmployees = async (req, res) => {
  try {
    if (!(await requireAdmin(req.user.userId))) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true, fullName: true, email: true, phoneNumber: true, department: true,
        jobTitle: true, employeeId: true, role: true, isOnline: true, lastSeen: true,
        createdAt: true, isDisabled: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Change a user's role (promote/demote)
const updateUserRole = async (req, res) => {
  try {
    if (!(await requireAdmin(req.user.userId))) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, fullName: true, role: true },
    });

    res.status(200).json({ message: 'Role updated', user: updated });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Disable / re-enable an account (blocks login without deleting data)
const toggleDisableUser = async (req, res) => {
  try {
    if (!(await requireAdmin(req.user.userId))) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ message: 'User not found' });

    const updated = await prisma.user.update({
      where: { id },
      data: { isDisabled: !target.isDisabled },
      select: { id: true, fullName: true, isDisabled: true },
    });

    res.status(200).json({
      message: updated.isDisabled ? 'Account disabled' : 'Account re-enabled',
      user: updated,
    });
  } catch (error) {
    console.error('Toggle disable error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Permanently delete a user account
const deleteUser = async (req, res) => {
  try {
    if (!(await requireAdmin(req.user.userId))) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;

    if (id === req.user.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Reset a user's password to a new temporary one, set by the admin
const resetUserPassword = async (req, res) => {
  try {
    if (!(await requireAdmin(req.user.userId))) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = {
  getAllEmployees,
  updateUserRole,
  toggleDisableUser,
  deleteUser,
  resetUserPassword,
};