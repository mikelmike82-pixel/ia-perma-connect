const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getMyConversations,
  startConversation,
  createGroup,
  addGroupMember,
  removeGroupMember,
} = require('../controllers/conversationController');
const { getMessages, sendMessage } = require('../controllers/messageController');
const { uploadFile } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');

router.get('/users', protect, getAllUsers);
router.get('/', protect, getMyConversations);
router.post('/start', protect, startConversation);
router.post('/group', protect, createGroup);
router.post('/:conversationId/members', protect, addGroupMember);
router.delete('/:conversationId/members/:userId', protect, removeGroupMember);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/:conversationId/messages', protect, sendMessage);
router.post('/upload', protect, upload.single('file'), uploadFile);

module.exports = router;