const asyncHandler=require('express-async-handler');
const Review=require('../models/Review.model');
const order=require('../models/Order.model');
const Gig=require('../models/Gig.model');
const OrderModel = require('../models/Order.model');

//create Review

const createReview =asyncHandler(async (req ,res)=>{
  const {orderId,rating,comment}=req.body;
  const order=await OrderModel.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  // Check if user is the client who placed the order
  if (order.client.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to review this order');
  }
  // Check if order is completed
  if (order.status !== 'Completed') {
    res.status(400);
    throw new Error('Only completed orders can be reviewed');
  }
  // Check if review already exists for this order
  const existingReview = await Review.findOne({ order: orderId });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this order');
  }
// Create review
  const review = await Review.create({
    order: orderId,
    gig: order.gig,
    client: req.user._id,
    freelancer: order.freelancer,
    rating,
    comment,
  });

  res.status(201).json({
    success: true,
    review,
  });
})

//geting review for a gig
const getGigReviews=asyncHandler(async (req ,res)=>{
  const { page = 1, limit = 10 } = req.query;
  //Check if gig exists
  const gig = await Gig.findById(req.params.gigId);
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const skip = (currentPage - 1) * itemsPerPage;

  const reviews = await Review.find({ gig: req.params.gigId })
    .skip(skip)
    .limit(itemsPerPage)
    .populate('client', 'name profilePicture')
    .sort('-createdAt');


})