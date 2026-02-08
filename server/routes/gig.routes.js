const express = require('express');
const router = express.Router();
const {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig,
  getMyGigs,
} = require('../controllers/gig.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Public routes
router.get('/', getGigs);
router.get('/:id', getGigById);

// Protected routes (Freelancer only)
router.post('/', protect, authorize('freelancer'), createGig);
router.get('/freelancer/me', protect, authorize('freelancer'), getMyGigs);
router.put('/:id', protect, authorize('freelancer'), updateGig);
router.delete('/:id', protect, authorize('freelancer'), deleteGig);

module.exports = router;