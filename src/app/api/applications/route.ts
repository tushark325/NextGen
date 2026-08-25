import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverError, unauthorized, notFound, forbidden, getPaginationParams } from "@/lib/utils";
import { applicationSchema } from "@/validations";

// POST /api/applications — submit a new application
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
      user = await prisma.user.findUnique({
        where: { clerkId },
        include: { tenantProfile: true },
      });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: "TENANT" },
        include: { tenantProfile: true },
      });
    }

    if (!user) return unauthorized();

    const body = await req.json();
    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid application data", 400, parsed.error.flatten().fieldErrors as any);
    }
    const data = parsed.data;

    // Check property exists and is available
    const property = await prisma.property.findFirst({
      where: { id: data.propertyId, status: "ACTIVE", deletedAt: null },
      include: { availability: true },
    });
    if (!property) return notFound("Property");

    if (property.availability?.status === "OCCUPIED" && !property.availability.expectedVacancy) {
      return errorResponse("PROPERTY_NOT_AVAILABLE", "This property is not currently available", 409);
    }

    // Check for existing active application
    const existingApp = await prisma.application.findFirst({
      where: {
        propertyId: data.propertyId,
        tenantId: user.id,
        status: { notIn: ["WITHDRAWN", "REJECTED"] },
      },
    });
    if (existingApp) {
      return errorResponse("DUPLICATE_APPLICATION", "You already have an active application for this property", 409);
    }

    // Get current match score
    let matchScore: number | undefined;
    if (user.tenantProfile) {
      const match = await prisma.propertyMatch.findUnique({
        where: { propertyId_tenantProfileId: { propertyId: data.propertyId, tenantProfileId: user.tenantProfile.id } },
      });
      matchScore = match?.overallScore;
    }

    const application = await prisma.application.create({
      data: {
        propertyId: data.propertyId,
        tenantId: user.id,
        landlordId: property.ownerId,
        status: "SUBMITTED",
        moveInDate: data.moveInDate,
        occupants: data.occupants,
        message: data.message,
        employmentInfo: data.employmentInfo,
        incomeRange: data.incomeRange,
        matchScore,
        submittedAt: new Date(),
        statusHistory: {
          create: {
            toStatus: "SUBMITTED",
            changedBy: user.id,
          },
        },
      },
      include: {
        property: {
          select: { title: true, city: true, locality: true, rent: true },
        },
      },
    });

    // Update property application count
    await prisma.property.update({
      where: { id: data.propertyId },
      data: { applicationCount: { increment: 1 } },
    });

    // Create notification for landlord
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: "NEW_APPLICATION",
        title: "New Rental Application",
        body: `${user.firstName} ${user.lastName} applied for your property: ${property.title}`,
        data: { applicationId: application.id, propertyId: data.propertyId, tenantId: user.id },
      },
    });

    return successResponse(application, 201);
  } catch (err) {
    console.error("[POST /api/applications]", err);
    return serverError();
  }
}

// GET /api/applications — list applications for current user
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

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const status = searchParams.get("status");
    const role = searchParams.get("role") ?? user.role;

    const where: Record<string, unknown> = {
      ...(status && { status }),
    };

    if (role === "LANDLORD" || role === "AGENT") {
      where.landlordId = user.id;
    } else {
      where.tenantId = user.id;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              locality: true,
              rent: true,
              bedrooms: true,
              images: { where: { isCover: true }, take: 1 },
            },
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              tenantProfile: {
                select: {
                  occupation: true,
                  company: true,
                  identityVerified: true,
                  phoneVerified: true,
                },
              },
            },
          },
          _count: { select: { documents: true, visits: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return successResponse(applications, 200, { total, page, limit, hasMore: skip + limit < total });
  } catch (err) {
    console.error("[GET /api/applications]", err);
    return serverError();
  }
}
