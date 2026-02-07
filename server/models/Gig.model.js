const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [5, 'Price must be at least $5'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'graphics-design',
        'digital-marketing',
        'writing-translation',
        'video-animation',
        'music-audio',
        'programming-tech',
        'business',
        'lifestyle',
      ],
    },
    deliveryTime: {
      type: Number,
      required: [true, 'Delivery time is required'],
      min: [1, 'Delivery time must be at least 1 day'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images) {
          return images.length <= 5;
        },
        message: 'Cannot upload more than 5 images',
      },
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Index for search Performace
gigSchema.index({title:'text',description:'text',category:'text'});

gigSchema.virtual('reviews',{
  ref:'Review',
  localField:'_id',
  foreignField:'gig',
});

//Middleware trigger
anges
gigSchema.post('save', async function () {
  if (this.totalReviews > 0) {
    const User = mongoose.model('User');
    const gigs = await this.constructor.find({ freelancer: this.freelancer });
    const totalRating = gigs.reduce((sum, gig) => sum + gig.rating, 0);
    const averageRating = totalRating / gigs.length;
    
    await User.findByIdAndUpdate(this.freelancer, {
      rating: parseFloat(averageRating.toFixed(1)),
      totalReviews: gigs.reduce((sum, gig) => sum + gig.totalReviews, 0),
    });
  }
});

module.exports=mongoose.model('Gig',gigSchema);