const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order', // Optional: link to an order if it exists
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique conversation between two participants (for direct messaging)
// This might be complex if we want multiple conversations per order vs one DM per user pair.
// For simplicity in this MVP, let's assume one conversation per user pair per order OR just one per user pair.
// Let's stick to one conversation per user pair for "pre-sales" and maybe link order later.
// Actually, Fiverr style: One thread per user pair. Order updates appear in the thread.

module.exports = mongoose.model('Conversation', conversationSchema);
