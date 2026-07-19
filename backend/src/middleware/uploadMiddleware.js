const multer = require('multer');
const path = require('path');

// Allowed file types, matching your spec
const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|docx|xlsx|pptx|zip|txt|doc|xls|ppt/;

// Where and how to save uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Unique name: timestamp + random number + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Reject files that aren't in our allowed list
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
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