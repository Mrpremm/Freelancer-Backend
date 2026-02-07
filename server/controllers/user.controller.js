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
module.exports={getFreelancers,getFreelancerById,updateRating};