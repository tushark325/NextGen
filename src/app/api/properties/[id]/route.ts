import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverError, unauthorized, notFound, forbidden } from "@/lib/utils";

// GET /api/properties/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: {
        images: { orderBy: { order: "asc" } },
        videos: true,
        amenities: true,
        availability: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            createdAt: true,
            landlordProfile: {
              select: {
                bio: true,
                ownerType: true,
                identityVerified: true,
                phoneVerified: true,
                emailVerified: true,
                rating: true,
                ratingCount: true,
                responseRate: true,
                avgResponseHours: true,
                totalProperties: true,
                totalRentals: true,
                petsAllowed: true,
                smokingAllowed: true,
              },
            },
          },
        },
        reviews: {
          where: { isPublic: true },
          include: {
            author: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: { favorites: true, applications: true, reviews: true },
        },
      },
    });

    if (!property) return notFound("Property");
    if (property.status !== "ACTIVE" && property.status !== "RENTED") {
      // Only owner/admin can see drafts
      const { userId: clerkId } = await auth();
      if (clerkId) {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (user?.id !== property.ownerId && user?.role !== "ADMIN") {
          return notFound("Property");
        }
      } else {
        return notFound("Property");
      }
    }

    // Increment view count (fire-and-forget)
    prisma.property.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    // Check if current user has favorited/applied
    const { userId: clerkId } = await auth();
    let isFavorited = false;
    let hasApplied = false;
    let matchScore = null;

    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: { tenantProfile: { include: { preferences: true } } },
      });
      if (user) {
        const [fav, app] = await Promise.all([
          prisma.favorite.findUnique({ where: { userId_propertyId: { userId: user.id, propertyId: params.id } } }),
          prisma.application.findFirst({ where: { propertyId: params.id, tenantId: user.id } }),
        ]);
        isFavorited = !!fav;
        hasApplied = !!app;

        // Fetch pre-calculated match score if available
        if (user.tenantProfile?.id) {
          const match = await prisma.propertyMatch.findUnique({
            where: { propertyId_tenantProfileId: { propertyId: params.id, tenantProfileId: user.tenantProfile.id } },
          });
          matchScore = match;
        }
      }
    }

    return successResponse({ property, isFavorited, hasApplied, matchScore });
  } catch (err) {
    console.error("[GET /api/properties/[id]]", err);
    return serverError();
  }
}

// PUT /api/properties/[id]
export async function PUT(
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
      user = await prisma.user.findFirst({ where: { role: "LANDLORD" } });
    }
    if (!user) return unauthorized();

    const property = await prisma.property.findFirst({
      where: { id, deletedAt: null },
    });
    if (!property) return notFound("Property");

    // Only owner or admin can edit
    if (property.ownerId !== user.id && user.role !== "ADMIN") {
      return forbidden();
    }

    const body = await req.json();
    const estimatedTotal =
      (body.rent ?? property.rent) +
      (body.maintenance ?? property.maintenance ?? 0) +
      (body.waterCharges ?? property.waterCharges ?? 0);

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...body,
        estimatedTotal,
        publishedAt: body.status === "ACTIVE" && !property.publishedAt ? new Date() : property.publishedAt,
        // Update amenities if provided
        ...(body.amenities !== undefined && {
          amenities: {
            deleteMany: {},
            createMany: {
              data: body.amenities.map((name: string) => ({ name })),
            },
          },
        }),
      },
      include: { images: true, amenities: true, availability: true },
    });

    return successResponse(updated);
  } catch (err) {
    console.error("[PUT /api/properties/[id]]", err);
    return serverError();
  }
}

// DELETE /api/properties/[id] — soft delete
export async function DELETE(
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
      user = await prisma.user.findFirst({ where: { role: "LANDLORD" } });
    }
    if (!user) return unauthorized();

    const property = await prisma.property.findFirst({
      where: { id, deletedAt: null },
    });
    if (!property) return notFound("Property");

    if (property.ownerId !== user.id && user.role !== "ADMIN") {
      return forbidden();
    }

    await prisma.property.update({
      where: { id: params.id },
      data: { deletedAt: new Date(), status: "DELETED" },
    });

    return successResponse({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/properties/[id]]", err);
    return serverError();
  }
}
