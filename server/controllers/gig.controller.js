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

//GEt all gigs
const getGigs=asyncHandler(async (req,res)=>{
  const{search,category,minPrice,maxPrice,
    sort='=createdAt',
    page=1,
    limit=10,
  }=req.query;
  const query={isActive:true};

  if(search){
    query.$text={$search:search};
  }

  //filter by category
  if(category){
    query.category=category;
  }
  if(minPrice||maxPrice){
    query.price={};
    if(minPrice) query.price.$gte=parseFloat(minPrice);
    if(maxPrice) query.price.$lte=parseFloat(maxPrice);
  }
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const skip = (currentPage - 1) * itemsPerPage;

  const gigs = await Gig.find(query)
    .skip(skip)
    .limit(itemsPerPage)
    .populate('freelancer', 'name rating profilePicture')
    .sort(sort);

    const total = await Gig.countDocuments(query);

  res.json({
    success: true,
    count: gigs.length,
    total,
    totalPages: Math.ceil(total / itemsPerPage),
    currentPage,
    gigs,
  });
})

//Get gig by ID

module.exports={createGig};