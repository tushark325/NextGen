import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverError, unauthorized, getPaginationParams } from "@/lib/utils";

// GET /api/conversations
export async function GET(req: NextRequest) {
  try {
    let clerkId: string | null = null;
    try {
      const authResult = await auth();
      clerkId = authResult.userId;
    } catch {
      // Auth optional
    }

    let user: any = null;
    if (clerkId) {
      user = await prisma.user.findUnique({ where: { clerkId } });
    }
    if (!user) {
      user = await prisma.user.findFirst({ where: { role: "TENANT" } });
    }
    if (!user) return unauthorized();

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
        isBlocked: false,
      },
      include: {
        user1: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        user2: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          where: { isDeleted: false },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Count unread messages per conversation
    const convIds = conversations.map((c) => c.id);
    const unreadCounts = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: convIds },
        senderId: { not: user.id },
        isRead: false,
        isDeleted: false,
      },
      _count: { id: true },
    });
    const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u._count.id]));

    const enriched = conversations.map((c) => ({
      ...c,
      unreadCount: unreadMap.get(c.id) ?? 0,
      otherUser: c.user1Id === user.id ? c.user2 : c.user1,
    }));

    return successResponse(enriched);
  } catch (err) {
    console.error("[GET /api/conversations]", err);
    return serverError();
  }
}

// POST /api/conversations — start or get existing conversation
export async function POST(req: NextRequest) {
  try {
    let clerkId: string | null = null;
    try {
      const authResult = await auth();
      clerkId = authResult.userId;
    } catch {
      // Auth optional
    }

    let user: any = null;
    if (clerkId) {
      user = await prisma.user.findUnique({ where: { clerkId } });
    }
    if (!user) {
      user = await prisma.user.findFirst({ where: { role: "TENANT" } });
    }
    if (!user) return unauthorized();

    const body = await req.json();
    const { otherUserId, propertyId, applicationId } = body;

    if (!otherUserId) return errorResponse("MISSING_FIELD", "otherUserId is required");
    if (otherUserId === user.id) return errorResponse("INVALID", "Cannot message yourself");

    const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
    if (!otherUser) return errorResponse("NOT_FOUND", "User not found", 404);

    // Normalize user order so u1Id < u2Id always (prevents duplicates)
    const [u1Id, u2Id] = [user.id, otherUserId].sort();

    let conversation = await prisma.conversation.findFirst({
      where: {
        user1Id: u1Id,
        user2Id: u2Id,
        ...(propertyId && { propertyId }),
      },
      include: {
        user1: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        user2: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        messages: { orderBy: { createdAt: "asc" }, take: 50, where: { isDeleted: false } },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: u1Id,
          user2Id: u2Id,
          propertyId,
          applicationId,
        },
        include: {
          user1: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          user2: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          messages: true,
        },
      });
    }

    return successResponse({
      ...conversation,
      otherUser: conversation.user1Id === user.id ? conversation.user2 : conversation.user1,
    }, 201);
  } catch (err) {
    console.error("[POST /api/conversations]", err);
    return serverError();
  }
}
