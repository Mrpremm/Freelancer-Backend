const express = require('express');
const router = express.Router();
const {
  createConversation,
  getConversations,
  getConversation,
} = require('../controllers/conversation.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').post(createConversation).get(getConversations);
router.route('/:id').get(getConversation);

module.exports = router;
