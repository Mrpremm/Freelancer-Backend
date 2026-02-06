const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Delivered', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentIntent: {
      type: String,
      default: 'mock_payment_intent_id', // Replace with actual Stripe payment intent
    },
    deliveryDate: {
      type: Date,
    },
    requirements: {
      type: String,
      maxlength: [1000, 'Requirements cannot exceed 1000 characters'],
    },
    revisions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);



module.exports = mongoose.model('Order', orderSchema);