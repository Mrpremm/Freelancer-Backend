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
  const {status,page=1,limit=10}=req.query;
  const query={client:req.user._id};
  if(status){
    query.status=status;
  }
  const currentPage=parseInt(page);
  const itemsPerPage=parseInt(limit);
  const skip=(currentPage-1)*itemsPerPage;

  const orders = await Order.find(query)
    .skip(skip)
    .limit(itemsPerPage)
    .populate('gig', 'title images price category')
    .populate('freelancer', 'name profilePicture rating')
    .sort('-createdAt');
    const total = await Order.countDocuments(query);

  res.json({
    success: true,
    count: orders.length,
    total,
    totalPages: Math.ceil(total / itemsPerPage),
    currentPage,
    orders,
  });
})

//Get Freelancer Orders
const getFreelancerOrders=asyncHandler(async (req , res)=>{
  const { status, page = 1, limit = 10 } = req.query;

  const query = { freelancer: req.user._id };
  
  if (status) {
    query.status = status;
  }
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const skip = (currentPage - 1) * itemsPerPage;

  const orders = await Order.find(query)
    .skip(skip)
    .limit(itemsPerPage)
    .populate('gig', 'title images price category')
    .populate('client', 'name profilePicture')
    .sort('-createdAt');

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    count: orders.length,
    total,
    totalPages: Math.ceil(total / itemsPerPage),
    currentPage,
    orders,
  });
})

//Update Order
const updateOrderStatus=asyncHandler(async (req ,res)=>{
  const {status}=req.body;
  const allowedStatuses=['In Progess','Delivered'];
  if(!allowedStatuses.includes(status)){
    res.status(400);
    throw new Error(`Status must be one of: ${allowedStatuses.join(', ')}`);
  }
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.freelancer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }
  //Checking valid transitions
   if (status === 'In Progress' && order.status !== 'Pending') {
    res.status(400);
    throw new Error('Only pending orders can be marked as in progress');
  }
   if (status === 'Delivered' && order.status !== 'In Progress') {
    res.status(400);
    throw new Error('Only orders in progress can be marked as delivered'); }
     order.status = status;
  await order.save();

  res.json({
    success: true,
    order,
  });
})