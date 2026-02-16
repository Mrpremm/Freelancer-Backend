const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.use(protect);

router.route('/:id')
  .get(getMessages)
  .post(upload.single('image'), sendMessage);

module.exports = router;
