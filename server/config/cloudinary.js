const cloudinary=require("cloudinary").v2
const {CloudinaryStorage}=require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,
});

//Storage ENgine for Multer

const storage=new CloudinaryStorage({
  cloudinary:cloudinary,
  params:{
    folder:"freelance-marketplace",
    allowed_formats:['jpg','png','jpeg','gif','webp','svg'],
    transformation:[{
      width:500,
      height:500,
      crop:"fill"
    }],
  },
});
module.exports={cloudinary,storage}