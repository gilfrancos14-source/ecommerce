import Stripe from 'stripe';
import { z } from 'zod';
import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

let stripeInstance;

const getStripe = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new AppError('Stripe non configuré', 500);
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const stripe = getStripe();

  const schema = z.object({
    deliveryMethodId: z.string().uuid().nullable().optional(),
  });
  const { deliveryMethodId } = schema.parse(req.body);

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: true, variant: true },
  });

  if (!cartItems.length) throw new AppError('Panier vide', 400);

  let subtotal = cartItems.reduce((sum, item) => {
    const price = item.variant ? item.variant.prix : item.product.prix;
    return sum + Math.round(price * item.quantity * 100);
  }, 0);

  let deliveryFee = 0;
  if (deliveryMethodId) {
    const method = await prisma.deliveryMethod.findUnique({ where: { id: deliveryMethodId } });
    if (method && method.active) {
      const sub = cartItems.reduce((sum, item) => {
        const price = item.variant ? item.variant.prix : item.product.prix;
        return sum + price * item.quantity;
      }, 0);
      deliveryFee = (method.freeFrom && sub >= method.freeFrom) ? 0 : Math.round(method.price * 100);
    }
  }

  const total = subtotal + deliveryFee;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: 'eur',
    metadata: { userId: req.user.id },
  });

  res.json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).json({ received: false, error: 'Invalid signature' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    const order = await prisma.order.findFirst({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (order) {
      const expectedAmount = Math.round(order.total * 100);
      const amountOk = paymentIntent.amount === expectedAmount;
      const currencyOk = paymentIntent.currency === 'eur';
      const userOk = paymentIntent.metadata.userId === order.userId;

      if (amountOk && currencyOk && userOk) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'CONFIRMED' },
        });
      } else {
        console.error('Webhook verification failed:', {
          orderId: order.id,
          expectedAmount,
          actualAmount: paymentIntent.amount,
          currencyOk,
          userOk,
        });
      }
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await prisma.order.updateMany({
      where: { paymentIntentId: paymentIntent.id },
      data: { status: 'CANCELLED' },
    });
  }

  res.json({ received: true });
});
