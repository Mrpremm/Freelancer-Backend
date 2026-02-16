const express = require('express');
const router = express.Router();
const {
  createOrder,
  getClientOrders,
  getFreelancerOrders,
  updateOrderStatus,
  acceptOrder,
  cancelOrder,
  getOrderById,
} = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.route('/')
  .post(protect, authorize('client'), createOrder);

router.get('/client', protect, authorize('client'), getClientOrders);
router.get('/freelancer', protect, authorize('freelancer'), getFreelancerOrders);

router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('freelancer'), updateOrderStatus);
router.put('/:id/accept', protect, authorize('client'), acceptOrder);
router.put('/:id/cancel', protect, cancelOrder); // Allow both roles to cancel

module.exports = router;