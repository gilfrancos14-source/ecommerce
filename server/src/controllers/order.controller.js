import Stripe from 'stripe';
import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parseProductImages, parseImages } from '../utils/images.js';
import { paginate, paginatedResponse } from '../utils/pagination.js';
import { createOrderSchema, updateOrderStatusSchema, shipOrderSchema } from '../validators/order.validator.js';
import { sendOrderConfirmation, sendShippingNotification, sendDeliveryNotification } from '../utils/email.js';

let stripeInstance;
const getStripe = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

const parseOrderImages = (order) => ({
  ...order,
  items: order.items.map((item) => ({
    ...item,
    product: parseProductImages(item.product),
    variant: item.variant ? { ...item.variant, images: parseImages(item.variant.images) } : null,
  })),
});

const ORDER_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, nom: true, images: true } },
      variant: { select: { id: true, nom: true, images: true } },
    },
  },
  deliveryMethod: true,
  user: { select: { id: true, nom: true, email: true } },
};

export const createOrder = asyncHandler(async (req, res) => {
  const data = createOrderSchema.parse(req.body);

  let paymentVerified = false;

  if (data.paymentIntentId) {
    const stripe = getStripe();
    if (!stripe) throw new AppError('Stripe non configuré', 500);

    let intent;
    try {
      intent = await stripe.paymentIntents.retrieve(data.paymentIntentId);
    } catch {
      throw new AppError('PaymentIntent invalide', 400);
    }

    if (intent.metadata.userId !== req.user.id) {
      throw new AppError('PaymentIntent ne correspond pas à cet utilisateur', 403);
    }

    if (intent.status !== 'succeeded') {
      throw new AppError('Le paiement n\'a pas été confirmé', 400);
    }

    paymentVerified = true;
  }

  const order = await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true, variant: true },
    });

    if (!cartItems.length) throw new AppError('Panier vide', 400);

    for (const item of cartItems) {
      const stock = item.variant ? item.variant.stock : item.product.stock;
      const name = item.variant ? `${item.product.nom} - ${item.variant.nom}` : item.product.nom;
      if (item.quantity > stock) {
        throw new AppError(`Stock insuffisant pour ${name}`, 400);
      }
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant ? item.variant.prix : item.product.prix;
      return sum + price * item.quantity;
    }, 0);

    let deliveryFee = 0;
    let deliveryMethod = null;
    let estimatedDelivery = null;

    if (data.deliveryMethodId) {
      deliveryMethod = await tx.deliveryMethod.findUnique({ where: { id: data.deliveryMethodId } });
      if (!deliveryMethod || !deliveryMethod.active) throw new AppError('Mode de livraison invalide', 400);

      if (deliveryMethod.freeFrom && subtotal >= deliveryMethod.freeFrom) {
        deliveryFee = 0;
      } else {
        deliveryFee = deliveryMethod.price;
      }

      const days = parseInt(deliveryMethod.estimatedDays.match(/\d+/)?.[0] || '5', 10);
      estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + days);
    }

    const total = subtotal + deliveryFee;

    if (paymentVerified) {
      const stripe = getStripe();
      const intent = await stripe.paymentIntents.retrieve(data.paymentIntentId);
      const expectedAmount = Math.round(total * 100);
      if (intent.amount !== expectedAmount) {
        throw new AppError('Le montant du paiement ne correspond pas au total de la commande', 400);
      }
    }

    const newOrder = await tx.order.create({
      data: {
        userId: req.user.id,
        total,
        paymentIntentId: data.paymentIntentId || null,
        status: paymentVerified ? 'CONFIRMED' : 'PENDING',
        adresseLivraison: data.adresseLivraison,
        phone: data.phone,
        deliveryMethodId: data.deliveryMethodId || null,
        deliveryFee: deliveryFee > 0 ? deliveryFee : 0,
        carrier: deliveryMethod?.carrier || null,
        estimatedDelivery,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            prix: item.variant ? item.variant.prix : item.product.prix,
          })),
        },
      },
    });

    for (const item of cartItems) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { userId: req.user.id } });

    return newOrder;
  });

  const orderWithItems = await prisma.order.findUnique({
    where: { id: order.id },
    include: ORDER_INCLUDE,
  });

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { nom: true, email: true },
  });

  if (paymentVerified) {
    sendOrderConfirmation(user, orderWithItems).catch(() => {});
  }

  res.status(201).json({ success: true, data: parseOrderImages(orderWithItems) });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, nom: true, images: true } },
          variant: { select: { id: true, nom: true, images: true } },
        },
      },
      deliveryMethod: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: orders.map(parseOrderImages) });
});

export const getById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, nom: true, images: true } },
          variant: { select: { id: true, nom: true, images: true } },
        },
      },
      deliveryMethod: true,
    },
  });
  if (!order) throw new AppError('Commande introuvable', 404);
  res.json({ success: true, data: parseOrderImages(order) });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: limit,
      include: {
        user: { select: { id: true, nom: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, nom: true } },
            variant: { select: { id: true, nom: true } },
          },
        },
        deliveryMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count(),
  ]);

  res.json({
    success: true,
    ...paginatedResponse(orders, total, page, limit),
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const data = updateOrderStatusSchema.parse(req.body);

  const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError('Commande introuvable', 404);

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: data.status },
  });
  res.json({ success: true, data: order });
});

export const shipOrder = asyncHandler(async (req, res) => {
  const data = shipOrderSchema.parse(req.body);

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, nom: true, email: true } } },
  });
  if (!order) throw new AppError('Commande introuvable', 404);

  if (!['CONFIRMED', 'PENDING'].includes(order.status)) {
    throw new AppError('Cette commande ne peut pas être expédiée', 400);
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status: 'SHIPPED',
      trackingNumber: data.trackingNumber || null,
      carrier: data.carrier || null,
      carrierUrl: data.carrierUrl || null,
      estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : null,
    },
    include: { deliveryMethod: true },
  });

  sendShippingNotification(order.user, updated).catch(() => {});

  res.json({ success: true, data: updated });
});

export const deliverOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, nom: true, email: true } } },
  });
  if (!order) throw new AppError('Commande introuvable', 404);

  if (order.status !== 'SHIPPED') {
    throw new AppError('Cette commande ne peut pas être livrée', 400);
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status: 'DELIVERED',
      deliveredAt: new Date(),
    },
    include: { deliveryMethod: true },
  });

  sendDeliveryNotification(order.user, updated).catch(() => {});

  res.json({ success: true, data: updated });
});
