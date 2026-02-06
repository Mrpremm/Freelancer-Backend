const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true, // Prevent multiple reviews for same order
    },
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);