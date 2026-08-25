import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverError, unauthorized, notFound, forbidden } from "@/lib/utils";

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["VIEWED", "SHORTLISTED", "REJECTED", "WITHDRAWN"],
  VIEWED: ["SHORTLISTED", "REJECTED", "VISIT_SCHEDULED", "DOCUMENTS_REQUESTED"],
  SHORTLISTED: ["VISIT_SCHEDULED", "DOCUMENTS_REQUESTED", "REJECTED"],
  VISIT_SCHEDULED: ["UNDER_REVIEW", "REJECTED"],
  DOCUMENTS_REQUESTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["AGREEMENT_PENDING"],
  AGREEMENT_PENDING: ["RENTED"],
};

// PUT /api/applications/[id]/status — update application status
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

    const application = await prisma.application.findUnique({
      where: { id },
      include: { property: true },
    });
    if (!application) return notFound("Application");

    const body = await req.json();
    const { status, note, rejectionReason } = body;

    if (!status) return errorResponse("MISSING_FIELD", "status is required");

    // Authorization: landlord can update most statuses, tenant can only withdraw
    const isLandlord = user.id === application.landlordId || user.role === "ADMIN";
    const isTenant = user.id === application.tenantId;

    if (!isLandlord && !isTenant) return forbidden();

    if (isTenant && status !== "WITHDRAWN") {
      return errorResponse("FORBIDDEN", "Tenants can only withdraw their application", 403);
    }

    // Validate status transition
    const validNext = VALID_STATUS_TRANSITIONS[application.status] ?? [];
    if (!validNext.includes(status) && status !== "WITHDRAWN") {
      return errorResponse(
        "INVALID_STATUS_TRANSITION",
        `Cannot transition from ${application.status} to ${status}`
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = { status };
    if (status === "VIEWED") updateData.viewedAt = new Date();
    if (status === "SHORTLISTED") updateData.shortlistedAt = new Date();
    if (status === "APPROVED") updateData.approvedAt = new Date();
    if (status === "REJECTED") {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = rejectionReason;
    }
    if (status === "WITHDRAWN") updateData.withdrawnAt = new Date();

    const [updated] = await Promise.all([
      prisma.application.update({
        where: { id: params.id },
        data: {
          ...updateData,
          statusHistory: {
            create: {
              fromStatus: application.status,
              toStatus: status,
              note,
              changedBy: user.id,
            },
          },
        },
        include: {
          property: { select: { title: true } },
          tenant: { select: { firstName: true, lastName: true } },
        },
      }),
      // Notify the other party
      createStatusNotification(application, status, user),
    ]);

    // If approved, mark property as rented (when no other active applications should see it)
    if (status === "RENTED") {
      await prisma.property.update({
        where: { id: application.propertyId },
        data: { status: "RENTED" },
      });
    }

    return successResponse(updated);
  } catch (err) {
    console.error("[PUT /api/applications/[id]/status]", err);
    return serverError();
  }
}

async function createStatusNotification(
  application: { tenantId: string; landlordId: string; propertyId: string; id: string },
  newStatus: string,
  changedBy: { id: string; firstName: string; lastName: string }
) {
  const notifyUserId = changedBy.id === application.tenantId
    ? application.landlordId
    : application.tenantId;

  const messages: Record<string, { title: string; body: string }> = {
    VIEWED: { title: "Application Viewed", body: "A landlord viewed your application." },
    SHORTLISTED: { title: "🎉 You've Been Shortlisted!", body: "Great news! The landlord shortlisted your application." },
    APPROVED: { title: "✅ Application Approved!", body: "Congratulations! Your rental application has been approved." },
    REJECTED: { title: "Application Update", body: "The landlord has made a decision on your application." },
    VISIT_SCHEDULED: { title: "Visit Scheduled", body: "A property visit has been confirmed." },
    WITHDRAWN: { title: "Application Withdrawn", body: `${changedBy.firstName} withdrew their application.` },
  };

  const msg = messages[newStatus];
  if (!msg) return;

  return prisma.notification.create({
    data: {
      userId: notifyUserId,
      type: newStatus === "APPROVED" ? "APPLICATION_ACCEPTED" : "APPLICATION_VIEWED",
      title: msg.title,
      body: msg.body,
      data: { applicationId: application.id, propertyId: application.propertyId },
    },
  });
}
