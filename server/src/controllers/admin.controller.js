import prisma from '../config/db.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { paginate, paginatedResponse } from '../utils/pagination.js';
import { parseProductImages } from '../utils/images.js';
import { z } from 'zod';

export const getStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders, categoryCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { nom: true, email: true } } },
    }),
    prisma.category.count(),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders,
      categoryCount,
    },
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: { id: true, nom: true, email: true, role: true, phone: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  res.json({
    success: true,
    ...paginatedResponse(users, total, page, limit),
  });
});

const updateRoleSchema = z.object({
  role: z.enum(['CLIENT', 'ADMIN'], { message: 'Rôle invalide (CLIENT ou ADMIN)' }),
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = updateRoleSchema.parse(req.body);

  if (req.params.id === req.user.id) {
    throw new AppError('Vous ne pouvez pas modifier votre propre rôle', 400);
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, nom: true, email: true, role: true },
  });

  res.json({ success: true, data: user });
});

export const getDetailedStats = asyncHandler(async (_req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [ordersByDay, topProducts, revenueByCategory, ordersByStatus] = await Promise.all([
    prisma.$queryRaw`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS count,
        COALESCE(SUM("total"), 0)::float AS revenue
      FROM "Order"
      WHERE "createdAt" >= ${thirtyDaysAgo}
        AND "status" != 'CANCELLED'
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw`
      SELECT
        p."id",
        p."nom",
        p."prix",
        SUM(oi."quantity")::int AS "totalSold",
        SUM(oi."quantity" * oi."prix")::float AS "totalRevenue"
      FROM "OrderItem" oi
      JOIN "Product" p ON p."id" = oi."productId"
      JOIN "Order" o ON o."id" = oi."orderId"
      WHERE o."status" != 'CANCELLED'
      GROUP BY p."id", p."nom", p."prix"
      ORDER BY "totalSold" DESC
      LIMIT 10
    `,
    prisma.$queryRaw`
      SELECT
        c."nom" AS "categoryName",
        SUM(oi."quantity" * oi."prix")::float AS revenue,
        SUM(oi."quantity")::int AS "itemsSold"
      FROM "OrderItem" oi
      JOIN "Product" p ON p."id" = oi."productId"
      JOIN "Category" c ON c."id" = p."categoryId"
      JOIN "Order" o ON o."id" = oi."orderId"
      WHERE o."status" != 'CANCELLED'
      GROUP BY c."nom"
      ORDER BY revenue DESC
    `,
    prisma.$queryRaw`
      SELECT
        "status",
        COUNT(*)::int AS count
      FROM "Order"
      GROUP BY "status"
    `,
  ]);

  res.json({
    success: true,
    data: {
      ordersByDay,
      topProducts,
      revenueByCategory,
      ordersByStatus,
    },
  });
});

export const getStockAlerts = asyncHandler(async (_req, res) => {
  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lte: 5 } },
    select: {
      id: true,
      nom: true,
      slug: true,
      stock: true,
      prix: true,
      images: true,
      category: { select: { nom: true } },
    },
    orderBy: { stock: 'asc' },
  });

  res.json({ success: true, data: lowStockProducts.map(parseProductImages) });
});