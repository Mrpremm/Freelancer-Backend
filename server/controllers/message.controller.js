const asyncHandler = require('express-async-handler');
const Message = require('../models/Message.model');
const Conversation = require('../models/Conversation.model');
const Order = require('../models/Order.model');

// Get messages for a conversation OR order (backward compatibility/migration)
const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params; // Can be conversationId OR orderId

  // Try to find if it's an order first (legacy support) or if passed ID is order
  // BUT cleanest is to assume it's conversationId if we update frontend.
  // Let's support both: check if ID is Order or Conversation?
  // Or better: Route param naming.
  // For now, let's assume the frontend will send conversationId.
  // If we really need to support orderId, we'd need to lookup conversation by order.

  let conversationId = id;

  // Check if it's an order ID (simple check: try to find order)
  // This is a bit expensive, but safe.
  const order = await Order.findById(id);
  if (order) {
    // Find conversation for this order's participants
    const conv = await Conversation.findOne({
      participants: { $all: [order.client, order.freelancer] }
    });
    if (conv) {
      conversationId = conv._id;
    } else {
        // If no conversation exists for this order yet, return empty or create one?
        // For getMessages, empty is fine.
        return res.json({ success: true, count: 0, messages: [] });
    }
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name profilePicture')
    .sort({ createdAt: 1 });

  res.json({
    success: true,
    count: messages.length,
    messages,
    conversationId,
  });
});

// Send a message
const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params; // conversationId
  const { content } = req.body;

  if (!content && !req.file) {
    res.status(400);
    throw new Error('Message content or attachment is required');
  }

  let conversationId = id;

  // Legacy/Order support: If ID is order, find/create conversation
  const order = await Order.findById(id);
  if (order) {
     let conv = await Conversation.findOne({
      participants: { $all: [order.client, order.freelancer] }
    });
    if (!conv) {
        conv = await Conversation.create({
            participants: [order.client, order.freelancer],
            order: order._id
        });
    }
    conversationId = conv._id;
  }

  let attachments = [];
  if (req.file) {
    attachments.push(req.file.path);
  }

  const message = await Message.create({
    conversation: conversationId,
    order: order ? order._id : undefined, // Optional link
    sender: req.user._id,
    content: content || (attachments.length > 0 ? 'Sent an attachment' : ''),
    attachments,
  });

  // Update conversation last message
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
  });

  const fullMessage = await Message.findById(message._id).populate(
    'sender',
    'name profilePicture'
  );

  res.status(201).json({
    success: true,
    message: fullMessage,
  });
});

module.exports = {
  getMessages,
  sendMessage,
};
