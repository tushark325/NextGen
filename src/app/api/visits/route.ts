import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverError, unauthorized } from "@/lib/utils";
import { visitSchema } from "@/validations";

// POST /api/visits
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
    const parsed = visitSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid visit data", 400);
    }
    const data = parsed.data;

    const property = await prisma.property.findFirst({
      where: { id: data.propertyId, status: "ACTIVE", deletedAt: null },
    });
    if (!property) return errorResponse("NOT_FOUND", "Property not found", 404);

    // Check slot isn't already booked
    const conflicting = await prisma.visit.findFirst({
      where: {
        propertyId: data.propertyId,
        scheduledAt: data.scheduledAt,
        status: { in: ["REQUESTED", "CONFIRMED"] },
      },
    });
    if (conflicting) {
      return errorResponse("SLOT_TAKEN", "This time slot is already booked. Please choose another.", 409);
    }

    const visit = await prisma.visit.create({
      data: {
        propertyId: data.propertyId,
        tenantId: user.id,
        landlordId: property.ownerId,
        applicationId: body.applicationId,
        visitType: data.visitType,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes,
        notes: data.notes,
      },
      include: {
        property: { select: { title: true, city: true, locality: true, address: true } },
        tenant: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    // Notify landlord
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        type: "VISIT_SCHEDULED",
        title: "Visit Request",
        body: `${user.firstName} ${user.lastName} wants to visit ${property.title} on ${data.scheduledAt.toLocaleDateString("en-IN")}`,
        data: { visitId: visit.id, propertyId: data.propertyId, tenantId: user.id },
      },
    });

    return successResponse(visit, 201);
  } catch (err) {
    console.error("[POST /api/visits]", err);
    return serverError();
  }
}

// GET /api/visits
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
    const role = searchParams.get("role") ?? user.role;

    const where = role === "LANDLORD"
      ? { landlordId: user.id }
      : { tenantId: user.id };

    const visits = await prisma.visit.findMany({
      where: { ...where, status: { notIn: ["CANCELLED"] } },
      include: {
        property: {
          select: {
            id: true, title: true, city: true, locality: true,
            images: { where: { isCover: true }, take: 1 },
          },
        },
        tenant: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        landlord: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return successResponse(visits);
  } catch (err) {
    console.error("[GET /api/visits]", err);
    return serverError();
  }
}
