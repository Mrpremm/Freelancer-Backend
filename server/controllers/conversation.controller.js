const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Conversation.model');
const User = require('../models/User.model');

// @desc    Create or get existing conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;

  if (!receiverId) {
    res.status(400);
    throw new Error('Receiver ID is required');
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, receiverId] },
  })
    .populate('participants', 'name profilePicture')
    .populate('lastMessage');

  if (conversation) {
    return res.status(200).json(conversation);
  }

  // Create new conversation
  const newConversation = await Conversation.create({
    participants: [req.user._id, receiverId],
  });

  conversation = await Conversation.findById(newConversation._id)
    .populate('participants', 'name profilePicture');

  res.status(201).json(conversation);
});

// @desc    Get user conversations
// @route   GET /api/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name profilePicture')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  res.status(200).json(conversations);
});

// @desc    Get single conversation
// @route   GET /api/conversations/:id
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate('participants', 'name profilePicture')
    .populate('lastMessage');

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Ensure user is participant
  const isParticipant = conversation.participants.some(
    (p) => p._id.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized to view this conversation');
  }

  res.status(200).json(conversation);
});

module.exports = {
  createConversation,
  getConversations,
  getConversation,
};
