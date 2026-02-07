const express=require('express');
const router=express.Router();

const{createGig,getGigs,getGigById,updateGig,deleteGig,getMyGigs}=require('../controllers/gig.controller');
const {protect}=require('../middleware/auth.middleware');
const {protect, authorize}=require('../middleware/role.middleware');

router.post('/').get(getGigs).post(protect,authorize('freelancer'),createGig);
router.get('/freelancer/me',protect,authorize('freelancer'),getMyGigs);
router.route('/:id').get(getGigById).put(protect,authorize('freelancer'),updateGig)
.delete(protect,authorize('freelancer'),deleteGig);

module.exports=router;
