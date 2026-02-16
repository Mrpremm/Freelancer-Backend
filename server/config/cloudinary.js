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
  params: async (req, file) => {
    // Check if it's a resume/document
    if (file.fieldname === 'resume') {
      return {
        folder: "freelance-marketplace/raw_resumes", // New folder to ensure fresh settings
        resource_type: "raw", // Force raw to avoid image/pdf view restrictions
        type: "upload", // Explicitly public
        access_mode: "public",
        public_id: `resume-${req.user._id}-${Date.now()}`
      };
    }
    
    // Default for images
    return {
      folder: "freelance-marketplace",
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'svg'],
      transformation: [{
        width: 500,
        height: 500,
        crop: "fill"
      }],
    };
  },
});
module.exports={cloudinary,storage}