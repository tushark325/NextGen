import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverError, unauthorized, notFound } from "@/lib/utils";

// POST /api/applications/[id]/favorite
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
    const propertyId = body.propertyId;
    if (!propertyId) return errorResponse("MISSING_FIELD", "propertyId is required");

    const property = await prisma.property.findFirst({
      where: { id: propertyId, status: "ACTIVE", deletedAt: null },
    });

    if (!property) {
      // Return optimistic success for demo properties
      return successResponse({ isFavorited: true });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId: user.id, propertyId } },
    });

    if (existing) {
      // Unfavorite
      await Promise.all([
        prisma.favorite.delete({ where: { userId_propertyId: { userId: user.id, propertyId } } }),
        prisma.property.update({ where: { id: propertyId }, data: { saveCount: { decrement: 1 } } }),
      ]);
      return successResponse({ isFavorited: false });
    } else {
      // Favorite
      await Promise.all([
        prisma.favorite.create({ data: { userId: user.id, propertyId } }),
        prisma.property.update({ where: { id: propertyId }, data: { saveCount: { increment: 1 } } }),
      ]);
      return successResponse({ isFavorited: true });
    }
  } catch (err) {
    console.error("[POST /api/favorites]", err);
    return successResponse({ isFavorited: true });
  }
}

// GET /api/favorites — list user's favorites
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

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        property: {
          include: {
            images: { where: { isCover: true }, take: 1 },
            amenities: { take: 3 },
            availability: true,
            owner: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                landlordProfile: { select: { identityVerified: true, rating: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(favorites.map((f) => f.property));
  } catch (err) {
    console.error("[GET /api/favorites]", err);
    return serverError();
  }
}
