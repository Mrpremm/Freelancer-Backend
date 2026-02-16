const asyncHandler=require('express-async-handler');
const User=require('../models/User.model');

//Geting Freelancers

const getFreelancers=asyncHandler(async (req,res)=>{
  const {search,skills,page=1,limit=10}=req.query;
  const query={role:'freelancer'};
  
  if(search){
    query.$or=[
      {name:{$regex:search,$options:'i'}},
      {email:{$regex:search,$options:'i'}},
    ];
  }
  if(skills){
    const skillsArray=skills.split(',');
    query.skills={$in:skillsArray};
  }
  const currentPage=parseInt(page);
  const itemsPerPage=parseInt(limit);
  const skip=(currentPage-1)*itemsPerPage;
  const freelancer=await User.find(query)
  .skip(skip)
  .limit(itemsPerPage)
  .select('-password')
  .sort('-rating createdAt');

  const total=await User.countDocuments(query);
  res.json({
    success:true,
    count:freelancer.length,
    total,totalPages:Math.ceil(total/itemsPerPage),
    currentPage,
    freelancer,

  });
});

//get freelancer by ID

const getFreelancerById=asyncHandler(async (req,res)=>{
  const freelancer=await User.findById(req.params.id)
  .select('-password')
  .populate({
    path:'gigs',
    select:'title price rating totalReview category',
    options:{limit:10},

  });
  if(!freelancer || freelancer.role!=='freelancer'){
    res.status(404);
    throw new Error('Freelancer not found');
  }
  res.json({
    success:true,
    freelancer,
  });
});

//Update rating

const updateRating=asyncHandler(async (req,res)=>{
  const {rating,review}=req.body;
  const freelancer=await User.findById(req.params.id);
  if(!freelancer || freelancer.role!=='freelancer'){
    res.status(404);
    throw new Error('Freelancer not found');
  }
  
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Handle file upload for profile picture
  let profilePicture = user.profilePicture;
  if (req.file) {
    // In a real app, upload to cloud (S3/Cloudinary). 
    // Here we use the local path from multer.
    // Ensure path is accessible from frontend (e.g. /uploads/filename)
    // Multer saves to 'uploads/'. We need to make sure express serves this static folder or we store the relative path.
    // Assuming backend serves 'uploads' folder statically.
    // path might be 'backend\\uploads\\image.png' (windows) or 'uploads/image.png'
    // Let's normalize it to URL format.
    profilePicture = `http://localhost:3000/${req.file.path.replace(/\\/g, '/')}`;
  }

  user.name = req.body.name || user.name;
  user.bio = req.body.bio || user.bio;
  
  if (req.body.skills) {
      // skills might be sent as JSON string if using FormData
      try {
          user.skills = JSON.parse(req.body.skills);
      } catch (e) {
          user.skills = req.body.skills.split(',').map(s => s.trim());
      }
  }

  if (req.body.profilePicture === '') {
      // Allow clearing profile picture if explicitly sent as empty string (optional logic)
  } else if (profilePicture) {
      user.profilePicture = profilePicture;
  }

  // Handle complex fields (education, experience, etc.) which might be JSON strings in FormData
  const jsonFields = ['education', 'experience', 'projects', 'socialLinks'];
  jsonFields.forEach(field => {
      if (req.body[field]) {
          try {
              user[field] = JSON.parse(req.body[field]);
          } catch (e) {
              console.error(`Error parsing ${field}:`, e);
          }
      }
  });

  const updatedUser = await user.save();

  res.json({
    success: true,
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      skills: updatedUser.skills,
      bio: updatedUser.bio,
      education: updatedUser.education,
      experience: updatedUser.experience,
      projects: updatedUser.projects,
      socialLinks: updatedUser.socialLinks,
      // ... token is not needed here as we are just updating profile
    },
  });
});

module.exports = { getFreelancers, getFreelancerById, updateRating, updateProfile };