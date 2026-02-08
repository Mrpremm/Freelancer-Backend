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
// Indexes for efficient queries
reviewSchema.index({ gig: 1, createdAt: -1 });
reviewSchema.index({ freelancer: 1, createdAt: -1 });
reviewSchema.index({ order: 1 }, { unique: true });

reviewSchema.post('save', async function () {
  const Gig = mongoose.model('Gig');
  const Order = mongoose.model('Order');
  
  // Update order status to Completed if not already
  await Order.findByIdAndUpdate(this.order, { status: 'Completed' });
  
  // Calculate new average rating for the gig
  const reviews = await this.constructor.find({ gig: this.gig });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  await Gig.findByIdAndUpdate(this.gig, {
    rating: parseFloat(averageRating.toFixed(1)),
    totalReviews: reviews.length,
  });
});



module.exports = mongoose.model('Review', reviewSchema);