const express = require('express');
const router = express.Router();
const { createCheckoutSession, confirmPayment } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Create checkout session (Client only)
router.post('/create-checkout-session', protect, authorize('client'), createCheckoutSession);

// Confirm payment (Authenticated user)
router.post('/confirm-payment', protect, confirmPayment);

module.exports = router;
