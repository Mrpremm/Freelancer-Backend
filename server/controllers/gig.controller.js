const asyncHandler=require('express-async-handler');
const Gig=require('../models/Gig.model');
const multer=require('multer');
const {storage}=require('../config/cloudinary');
const upload=multer({storage});


//Create Gig
const createGig =[
  upload.array('images',5),
  asyncHandler(async (req,res)=>{
    if(!req.files || req.files.length===0){
      res.status(400);
      throw new Error('Please upload at least one image');
    }
    const {title, description, price, category, deliveryTime}=req.body;
    const images=req.files.map(file=>file.path);
    const gig=await Gig.create({
      title,
      description,
      price:parseFloat(price),
      category,
      deliveryTime:parseInt(deliveryTime),
      images,
      freelancer:req.user._id,
    });
    res.status(201).json({
      success:true,
      gig,
    });
  }),
]


module.exports={createGig};