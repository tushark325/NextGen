import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverError, unauthorized, notFound, forbidden } from "@/lib/utils";
import { messageSchema } from "@/validations";

// GET /api/conversations/[id]/messages — load messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) return notFound("Conversation");
    if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) return forbidden();

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor"); // message ID for pagination
    const limit = 50;

    const messages = await prisma.message.findMany({
      where: {
        conversationId: id,
        isDeleted: false,
        ...(cursor && { id: { lt: cursor } }),
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Mark incoming messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    return successResponse({
      messages: messages.reverse(), // oldest first
      hasMore: messages.length === limit,
      nextCursor: messages.length === limit ? messages[0]?.id : null,
    });
  } catch (err) {
    console.error("[GET /api/conversations/[id]/messages]", err);
    return serverError();
  }
}

// POST /api/conversations/[id]/messages — send message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) return notFound("Conversation");
    if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) return forbidden();
    if (conversation.isBlocked) {
      return errorResponse("CONVERSATION_BLOCKED", "This conversation has been blocked", 403);
    }

    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid message", 400);
    }

    const [message] = await Promise.all([
      prisma.message.create({
        data: {
          conversationId: params.id,
          senderId: user.id,
          content: parsed.data.content,
          messageType: parsed.data.messageType,
          attachmentUrl: body.attachmentUrl,
          attachmentName: body.attachmentName,
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      }),
      prisma.conversation.update({
        where: { id: params.id },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    // Notify recipient
    const recipientId = conversation.user1Id === user.id ? conversation.user2Id : conversation.user1Id;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "NEW_MESSAGE",
        title: `Message from ${user.firstName}`,
        body: parsed.data.content.slice(0, 100),
        data: { conversationId: params.id, senderId: user.id },
      },
    });

    return successResponse(message, 201);
  } catch (err) {
    console.error("[POST /api/conversations/[id]/messages]", err);
    return serverError();
  }
}
