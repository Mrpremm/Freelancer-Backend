const path = require('path');
const express=require("express");
const cors=require('cors');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const {notFound,errorHandler}=require('./middleware/error.middleware');

//Routes Import
const authRoutes=require('./routes/auth.routes');
const userRoutes=require('./routes/user.routes');
const gigRoutes=require('./routes/gig.routes');
const orderRoutes=require('./routes/order.routes');
const reviewRoutes=require('./routes/review.routes');
const messageRoutes=require('./routes/message.routes');
const paymentRoutes=require('./routes/payment.routes');
const conversationRoutes=require('./routes/conversation.routes');

const app=express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const limiter=rateLimit({
  windowMs:15*60*1000,
  max: 10000, 
  message:'Too many requests from this IP ,please try again Later,',
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use(limiter); 

app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Api Routes
app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/gigs',gigRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/reviews',reviewRoutes);
app.use('/api/messages',messageRoutes);
app.use('/api/payment',paymentRoutes);
app.use('/api/conversations',conversationRoutes);

//health
app.get('/health',(req,res)=>{
  res.status(200).json({
    sucess:true,
    message:'Server is running',
    timestamp:new Date().toISOString(),
  });
});
// Serve frontend
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports=app;