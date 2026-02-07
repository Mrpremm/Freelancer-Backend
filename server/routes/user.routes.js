const express=require('express');
const router=express.Router();

const{getFreelancers,getFreelancerById}=require('../controllers/user.controller');

router.get('/',getFreelancers);
router.get('/freelancers/:id',getFreelancerById);

module.exports=router;