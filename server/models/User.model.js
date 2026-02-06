const mongoose=require("mongoose");
const bcrypt=require("bcryptjs")
const userSchema=new mongoose.Schema(
  {
    name:{
      type:String,
      required:[true,'Name is required'],
      trim:true,
    },
    email:{
      type:String,
      required:[true,'Email is required'],
      unique:true,
      trim:true,
      Lowercase:true,
      match:[/^\S+@\S+\.\S+$/,'Please entera valid email'],
    },
    password:{
      type:String,
      required:[true,'Password is required'],
      minLength:[6,'Password must be at least 6'],
      select:false,
    },
    role:{
      type:String,
      enum:['client','freelancer'],
      default:'client',
    },
    profilePicture:{
      type:String,
      default:[],
    },
    skills:{
      type:[String],
      default:[],
    },
    bio:{
      type:String,
      default:'',
    },
    rating:{
      type:Number,
      default:0,
      min:0,
      max:5,
    },
    totalReviews:{
      type:Number,
      default:0,
    },
    createdAt:{
      type:Date,
      default:Date.now,
    },


},{
  timestamps:true,
}
);


module.exports = mongoose.model('User', userSchema);