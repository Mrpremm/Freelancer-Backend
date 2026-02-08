const asyncHandler=require('express-async-handler');
const Order=require('../models/Order.model');
const Gig=require('../models/Gig.model');

//Create order

const createOrder=asyncHandler (async (req,res)=>{
  const {gigId,requirements}=req.body;

  const gig=await Gig.findOne({_id:gigId,isActive:true});
  if(!gig){
    res.status(404);
    throw new Error('Gig not found or not available');
  }

  if(gig.freelancer.toString()===req.user._id.toString()){
    res.status(400);
    throw new Error('Cannot order your own gig')
  }
  const existingOrder=await Order.findOne({
    gig:gigId,
    client:req.user._id,
    status:{$in:['pending','Ing Progess','Delivered']},
  });
  if(existingOrder){
    res.status(400);
    throw new Error('You already have an order for thsi gig');
  }
//Create order
const order=await Order.create({
  gig:gigId,
  client:req.user._id,
  freelancer:gig.freelancer,
  amount:gig.price,
  requirements, 

});
res.status(201).json({
  success:true,
  order,
});

});

//Get Client Orders

const getClientOrders=asyncHandler(async (req,res)=>{
  
})