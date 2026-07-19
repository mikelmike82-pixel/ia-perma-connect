const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllEmployees,
  updateUserRole,
  toggleDisableUser,
  deleteUser,
  resetUserPassword,
} = require('../controllers/adminController');

router.get('/employees', protect, getAllEmployees);
router.patch('/employees/:id/role', protect, updateUserRole);
router.patch('/employees/:id/toggle-disable', protect, toggleDisableUser);
router.delete('/employees/:id', protect, deleteUser);
router.post('/employees/:id/reset-password', protect, resetUserPassword);

module.exports = router;