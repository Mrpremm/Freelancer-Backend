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
const getGigById = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id)
    .populate('freelancer', 'name rating totalReviews bio skills profilePicture')
    .populate({
      path: 'reviews',
      populate: {
        path: 'client',
        select: 'name profilePicture',
      },
      options: { sort: { createdAt: -1 }, limit: 10 },
    });

  if (!gig || !gig.isActive) {
    res.status(404);
    throw new Error('Gig not found');
  }

  res.json({
    success: true,
    gig,
  });
});


//Updating
const updateGig = asyncHandler(async (req, res) => {
  let gig = await Gig.findById(req.params.id);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  // Check if user is the gig owner
  if (gig.freelancer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this gig');
  }

  gig = await Gig.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    gig,
  });
});

module.exports={createGig};