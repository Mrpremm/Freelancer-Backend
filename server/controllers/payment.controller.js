const Stripe = require('stripe');
const asyncHandler = require('express-async-handler');
const Gig = require('../models/Gig.model');
const Order = require('../models/Order.model');
const User = require('../models/User.model');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create new checkout session
// @route   POST /api/payment/create-checkout-session
// @access  Private (Client only)
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { gigId, orderId } = req.body;

  let sessionData = {};
  let metadata = {};

  if (orderId) {
    const order = await Order.findById(orderId).populate('gig');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.client.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to pay for this order');
    }
    if (order.status !== 'Approved') {
      res.status(400);
      throw new Error('Order must be approved by freelancer before payment');
    }

    sessionData = {
      name: order.gig.title,
      description: `Payment for Order #${order._id}`,
      images: order.gig.images && order.gig.images.length > 0 ? [order.gig.images[0]] : [],
      amount: Math.round(order.amount * 100),
    };

    metadata = {
      orderId: order._id.toString(),
      gigId: order.gig._id.toString(),
      freelancerId: order.freelancer.toString(),
      type: 'order_payment'
    };

  } else if (gigId) {
     const gig = await Gig.findById(gigId).populate('freelancer');
    if (!gig) {
      res.status(404);
      throw new Error('Gig not found');
    }
    sessionData = {
      name: gig.title,
      description: gig.description.substring(0, 100) + '...',
      images: gig.images && gig.images.length > 0 ? [gig.images[0]] : [],
      amount: Math.round(gig.price * 100),
    };
    metadata = {
      gigId: gig._id.toString(),
      freelancerId: gig.freelancer._id.toString(),
      type: 'direct_gig_payment' // Legacy or direct
    };
  } else {
    res.status(400);
    throw new Error('Gig ID or Order ID required');
  }

  // Create a stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: sessionData.name,
            description: sessionData.description,
            images: sessionData.images,
          },
          unit_amount: sessionData.amount, // Stripe expects amounts in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/cancel`,
    client_reference_id: req.user._id.toString(), // Store user ID to link order
    metadata: metadata,
  });

  res.json({
    id: session.id,
    url: session.url
  });
});

// @desc    Confirm payment and create order
// @route   POST /api/payment/confirm-payment
// @access  Private
const confirmPayment = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400);
    throw new Error('Session ID is required');
  }

  // Retrieve session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.payment_status !== 'paid') {
    res.status(400);
    throw new Error('Payment not completed');
  }

  // Check if order already exists for this session
  const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
  if (existingOrder) {
    return res.json({
      success: true,
      order: existingOrder,
      message: 'Order already exists'
    });
  }

  // Create Order
  const { gigId, freelancerId, orderId, type } = session.metadata;
  const clientId = session.client_reference_id;

  // Verify client matches (security check)
  if (clientId !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized access to this payment session');
  }

  let order;

  if (orderId) {
      order = await Order.findById(orderId);
      if (!order) {
          res.status(404);
          throw new Error('Order not found');
      }
      
      // Update existing order
      order.status = 'In Progress';
      order.stripeSessionId = sessionId;
      order.paymentIntent = session.payment_intent;
      order.isPaid = true;
      order.paidAt = Date.now();
      
      await order.save();
  } else {
      // Legacy flow: Create new order (if direct payment was used)
      const gig = await Gig.findById(gigId);
      if (!gig) {
        res.status(404);
        throw new Error('Gig not found for this order');
      }

      order = await Order.create({
        gig: gigId,
        client: clientId,
        freelancer: freelancerId,
        amount: session.amount_total / 100, // Convert back to dollars
        status: 'In Progress', // Direct payment goes straight to In Progress
        stripeSessionId: sessionId,
        paymentIntent: session.payment_intent,
        isPaid: true,
        paidAt: Date.now(),
        requirements: "Client has paid directly. Pending requirements submission." 
      });
  }

  res.status(201).json({
    success: true,
    order,
  });
});

module.exports = {
  createCheckoutSession,
  confirmPayment
};
