const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Create a storage engine ensuring we can handle raw files like PDFs if needed, 
// though cloudinary-multer-storage usually defaults to images. 
// If 'storage' from config is strictly for images, we might need a separate one or configuration for raw files.
// However, typically Cloudinary handles it if the format is allowed.

// We will use the existing storage but ensure we handle key fields
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
