const express=require("express");
const cors=require('cors');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const {notFound,errorHandler}=require('./middleware/error.middleware');

//Routes Import
const authRoutes=require('./routes/auth.routes');
const userRoutes=require('./routes/user.routes');
const gigRoutes=require('./routes/gig.routes');

const app=express();
const limiter=rateLimit({
  windowMs:15*60*1000,
  max:100,
  message:'Too many requests from this IP ,please try again Later,',
});
app.use(limiter);
app.use(helmet());
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Api Routes
app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/gigs',gigRoutes);


//health
app.get('/health',(req,res)=>{
  res.status(200).json({
    sucess:true,
    message:'Server is running',
    timestamp:new Date().toISOString(),
  });
});
app.use(notFound);
app.use(errorHandler);
module.exports=app;