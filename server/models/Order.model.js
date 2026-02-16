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
      enum: ['Pending', 'Approved', 'In Progress', 'Delivered', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    amount: {
      type: Number,
      required: true,
    },
    stripeSessionId: {
      type: String,
    },
    paymentIntent: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
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
//Indexes for effiecient queries
orderSchema.index({ client: 1, createdAt: -1 });
orderSchema.index({ freelancer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// Virtual for reviews
orderSchema.virtual('review', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'order',
  justOne: true,
});
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const Gig = mongoose.model('Gig');
    const gig = await Gig.findById(this.gig);
    if (gig) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + gig.deliveryTime);
      this.deliveryDate = deliveryDate;
    }
  }
  next();
});
module.exports = mongoose.model('Order', orderSchema);