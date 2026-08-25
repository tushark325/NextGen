import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverError, unauthorized, getPaginationParams } from "@/lib/utils";

// GET /api/notifications
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return unauthorized();

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const unreadOnly = searchParams.get("unread") === "true";

    const where = {
      userId: user.id,
      ...(unreadOnly && { isRead: false }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    ]);

    return successResponse(notifications, 200, { total, page, limit, unreadCount });
  } catch (err) {
    console.error("[GET /api/notifications]", err);
    return serverError();
  }
}

// PUT /api/notifications — mark all as read
export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return unauthorized();

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const { ids } = body;

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        ...(ids?.length ? { id: { in: ids } } : {}),
      },
      data: { isRead: true, readAt: new Date() },
    });

    return successResponse({ message: "Notifications marked as read" });
  } catch (err) {
    console.error("[PUT /api/notifications]", err);
    return serverError();
  }
}
