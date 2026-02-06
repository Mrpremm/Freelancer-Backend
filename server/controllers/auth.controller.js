const asyncHandler = require('express-async-handler');
const User=require('../models/User.model');
const {generateToken}=require('../middleware/auth.middleware');


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
