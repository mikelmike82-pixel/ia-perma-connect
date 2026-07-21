const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|docx|xlsx|pptx|zip|txt|doc|xls|ppt/;

// Store files directly on Cloudinary instead of local disk,
// so they survive server restarts/redeploys on Render's free tier
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ia-perma-connect',
    // 'auto' lets Cloudinary correctly handle both images and raw documents
    resource_type: 'auto',
  },
});

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
});

module.exports = upload;