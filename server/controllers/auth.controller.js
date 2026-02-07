const asyncHandler = require('express-async-handler');
const User=require('../models/User.model');
const {generateToken}=require('../middleware/auth.middleware');

// Register 
const registerUser =asyncHandler(async (req,res)=>{
  const {name,email,password,role}=req.body;

  //Check if User exists

  const userExists=await User.findOne({email});
  if(userExists){
    res.status(400);
    throw new Error('User already exists');
  }

//Create User
const user=await User.create({
  name,
  email,
  password,
  role:role|| 'client',
  
});
if(user){
  res.status(201).json({
    _id:user._id,
    name:user.name,
    email:user.email,
    role:user.role,
    token:generateToken(user._id),
  });

}else{
  res.status(400);
  throw new Error('Invalid user data');
}
})

//Login

const login=asyncHandler(async (req, res)=>{
  const {email,password}=req.body;
  const user=await User.findOne({email}).select('+password');
  if(user && (await User.comparePassword(password))){
    res.json({
      _id:user._id,
      name:user.name,
      email:user.email,
      role:user.role,
      token:generateToken(user._id),

    });
  }else{
    res.status(401);
    throw new Error('Invalid email or Password');
  }
});


//Profile
const getMe=asyncHandler(async (req,res)=>{
  const user=await User.findById(req.user._id);
  if(user){
    res.json({

      _id:user._id,
      name:user.name,
      email:user.email,
      role:user.role,
      profilePicture:user.profilePicture,
      skills:user.skills,
      bio:user.bio,
      rating:user.rating,
      totalReviews:user.totalReviews,
      createdAt:user.createdAt,
    });
  }else{
    res.status(404);
    throw new Error('User not found');
  }
})

//Update profile

module.exports={registerUser,login}