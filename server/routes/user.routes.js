const express = require('express');
const router = express.Router();
const {
  getFreelancers,
  getFreelancerById,
  updateProfile
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/freelancers', getFreelancers);
router.get('/freelancers/:id', getFreelancerById);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);

module.exports = router;