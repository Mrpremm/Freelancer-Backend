const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./server/models/User.model');

dotenv.config({ path: path.join(__dirname, './.env') });

const checkUrl = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    // Find users with resume
    const usersWithResume = await User.find({ resume: { $exists: true, $ne: null } });
    console.log(`Found ${usersWithResume.length} users with resume.`);
    
    usersWithResume.forEach(u => {
        console.log(`User: ${u.name} (${u._id})`);
        console.log(`Resume: ${u.resume}`);
    });
    
    process.exit();
  } catch (error) {
    console.log('Error:', error);
    process.exit(1);
  }
};

checkUrl();
