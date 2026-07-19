const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');

router.get('/', protect, getAnnouncements);
router.post('/', protect, upload.single('file'), createAnnouncement);
router.delete('/:id', protect, deleteAnnouncement);

module.exports = router;