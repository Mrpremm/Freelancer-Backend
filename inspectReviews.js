const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, './.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const Review = require('./server/models/Review.model');
const User = require('./server/models/User.model');
const Gig = require('./server/models/Gig.model');

const inspectReviews = async () => {
  await connectDB();
  
  const reviews = await Review.find({});
  console.log(`Total Reviews Found: ${reviews.length}`);
  
  for (const review of reviews) {
      const freelancer = await User.findById(review.freelancer);
      const gig = await Gig.findById(review.gig);
      console.log(`Review ID: ${review._id}`);
      console.log(`  Rating: ${review.rating}`);
      console.log(`  Freelancer ID: ${review.freelancer} (${freelancer ? freelancer.name : 'NOT FOUND'})`);
      console.log(`  Gig ID: ${review.gig} (${gig ? gig.title : 'NOT FOUND'})`);
  }
  
  process.exit();
};

inspectReviews();
