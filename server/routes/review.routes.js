const express = require('express');
const router = express.Router();
const {
  createReview,
  getGigReviews,
  getFreelancerReviews,
  deleteReview,
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.route('/')
  .post(protect, authorize('client'), createReview);

router.get('/gig/:gigId', getGigReviews);
router.get('/freelancer/:freelancerId', getFreelancerReviews);

router.delete('/:id', protect, authorize('client'), deleteReview);

module.exports = router;