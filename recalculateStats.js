const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'recalc_log.txt');

// Load env vars
dotenv.config({ path: path.join(__dirname, './.env') }); 

const log = (msg) => {
  console.log(msg);
  try {
    fs.appendFileSync(logFile, msg + '\n');
  } catch (e) {
    console.error("Failed to write to log file", e);
  }
};

// Connect to DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    log(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Import Models
const User = require('./server/models/User.model');
const Gig = require('./server/models/Gig.model');
const Review = require('./server/models/Review.model');

const recalculateStats = async () => {
  // Clear log file
  fs.writeFileSync(logFile, 'Starting Log\n');
  
  await connectDB();

  try {
    log('Starting recalculation...');

    // Find freelancer first.
    const freelancer = await User.findOne({ name: 'Prem Prasad' });
    if (!freelancer) {
        log("Freelancer 'Prem Prasad' not found.");
        process.exit();
    }
    log(`Found Freelancer: ${freelancer.name} (${freelancer._id})`);

    // Check specific gig
    const specificGig = await Gig.findById('698b6b06d0084b6d9c5fe1b3');
    if (specificGig) {
        log(`Specific Gig found: ${specificGig.title} (${specificGig._id})`);
        log(`  Owner: ${specificGig.freelancer}`);
        log(`  Current Rating: ${specificGig.rating}, Reviews: ${specificGig.totalReviews}`);
        
        // Check if owner matches Prem Prasad
        if (specificGig.freelancer.toString() === freelancer._id.toString()) {
            log("  Owner MATCHES Prem Prasad");
        } else {
            log(`  Owner DOES NOT MATCH Prem Prasad (${freelancer._id})`);
            // Find who owns it
            const owner = await User.findById(specificGig.freelancer);
            log(`  Real Owner: ${owner ? owner.name : 'Unknown'} (${specificGig.freelancer})`);
        }
    } else {
        log("Specific Gig 698b6b06d0084b6d9c5fe1b3 NOT FOUND");
    }

    // 1. Recalculate Gig Stats
    const gigs = await Gig.find({});
    log(`Found ${gigs.length} gigs.`);

    for (const gig of gigs) {
      log(`Checking reviews for gig: ${gig.title} (${gig._id})`);
      const reviews = await Review.find({ gig: gig._id });
      const totalReviews = reviews.length;
      
      let rating = 0;
      if (totalReviews > 0) {
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        rating = parseFloat((sum / totalReviews).toFixed(1));
      }

      gig.totalReviews = totalReviews;
      gig.rating = rating;
      await gig.save();
      // Only log if reviews > 0 to reduce noise
      if (totalReviews > 0) {
          log(`Updated Gig: ${gig.title} - Rating: ${rating}, Reviews: ${totalReviews}`);
      }
    }

    // 2. Recalculate Freelancer Stats
    const freelancers = await User.find({ role: 'freelancer' });
    log(`Found ${freelancers.length} freelancers.`);

    for (const freelancer of freelancers) {
      const freelancerGigs = await Gig.find({ freelancer: freelancer._id });
      
      let totalReviews = 0;
      let sumOfGigRatings = 0;
      let ratedGigsCount = 0;

      for (const gig of freelancerGigs) {
        if (gig.totalReviews > 0) {
           sumOfGigRatings += gig.rating;
           ratedGigsCount++;
        }
        totalReviews += gig.totalReviews;
      }
      
      let averageRating = 0;
      if (ratedGigsCount > 0) {
          averageRating = parseFloat((sumOfGigRatings / ratedGigsCount).toFixed(1));
      }

      freelancer.totalReviews = totalReviews;
      freelancer.rating = averageRating;
      await freelancer.save();
      
      if (freelancer.name === 'Prem Prasad' || totalReviews > 0) {
          log(`Updated Freelancer: ${freelancer.name} (${freelancer._id}) - Rating: ${averageRating}, Total Reviews: ${totalReviews}, Gigs: ${freelancerGigs.length}`);
      }
    }

    log('Recalculation complete.');
    process.exit();
  } catch (error) {
    log(`Error recalculating stats: ${error}`);
    process.exit(1);
  }
};

recalculateStats();
