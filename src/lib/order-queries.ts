import "server-only";

import { prisma } from "@/lib/db";
import {
  orderWithItems,
  toOrderDetail,
  toOrderSummary,
} from "@/lib/orders";
import type { OrderDetail, OrderSummary } from "@/lib/types";

export async function getOrdersForUser(userId: string): Promise<OrderSummary[]> {
  const rows = await prisma.order.findMany({
    where: { userId },
    include: orderWithItems,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return rows.map(toOrderSummary);
}

export async function getOrderForUser(
  orderId: string,
  userId: string,
): Promise<OrderDetail | null> {
  const row = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderWithItems,
  });

  return row ? toOrderDetail(row) : null;
}

export async function getOrderForAdmin(
  orderId: string,
): Promise<OrderDetail | null> {
  const row = await prisma.order.findUnique({
    where: { id: orderId },
    include: { ...orderWithItems, user: { select: { name: true, email: true } } },
  });

  return row ? toOrderDetail(row) : null;
}

export async function getAdminOrders(): Promise<OrderSummary[]> {
  const rows = await prisma.order.findMany({
    include: {
      ...orderWithItems,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return rows.map(toOrderSummary);
}

export type AdminStats = {
  revenue: number;
  awaitingVerification: number;
  activeProducts: number;
  openOrders: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [revenue, awaitingVerification, activeProducts, openOrders] =
    await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: monthStart },
          status: { in: ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"] },
        },
      }),
      prisma.order.count({ where: { status: "AWAITING_VERIFICATION" } }),
      prisma.product.count({ where: { active: true } }),
      prisma.order.count({
        where: {
          status: {
            in: ["PENDING_PAYMENT", "AWAITING_VERIFICATION", "PAID", "PROCESSING"],
          },
        },
      }),
    ]);

  return {
    revenue: revenue._sum.total ?? 0,
    awaitingVerification,
    activeProducts,
    openOrders,
  };
}
