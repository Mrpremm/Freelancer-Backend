const express=require('express');
const router=express.Router();

const{registerUser,login,getMe,updateProfile}=require('../controllers/auth.controller');
const{protect}=require('../middleware/auth.middleware');
router.post('/register',registerUser);
router.post('/login',login);
router.get('/me',protect,getMe);
router.put('/profile',protect,updateProfile);
module.exports=router;