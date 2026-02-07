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
