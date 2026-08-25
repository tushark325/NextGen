import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverError, unauthorized } from "@/lib/utils";
import { tenantPreferenceSchema } from "@/validations";

// POST /api/tenant/preferences — save onboarding preferences
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { tenantProfile: { include: { preferences: true } } },
    });
    if (!user) return unauthorized();

    const body = await req.json();
    const parsed = tenantPreferenceSchema.safeParse(body);
    if (!parsed.success) {
      return successResponse({}, 200); // Accept partial data gracefully
    }
    const data = parsed.data;

    let tenantProfile = user.tenantProfile;

    // Create TenantProfile if not exists
    if (!tenantProfile) {
      tenantProfile = await prisma.tenantProfile.create({
        data: {
          userId: user.id,
          occupation: body.occupation,
          company: body.company,
          jobTitle: body.jobTitle,
          monthlyIncome: body.monthlyIncome,
          employmentType: body.employmentType,
        },
        include: { preferences: true },
      });
    } else {
      // Update occupation info
      await prisma.tenantProfile.update({
        where: { userId: user.id },
        data: {
          occupation: body.occupation ?? tenantProfile.occupation,
          company: body.company ?? tenantProfile.company,
          jobTitle: body.jobTitle ?? tenantProfile.jobTitle,
          employmentType: body.employmentType ?? tenantProfile.employmentType,
        },
      });
    }

    // Upsert preferences
    await prisma.tenantPreference.upsert({
      where: { tenantProfileId: tenantProfile.id },
      create: {
        tenantProfileId: tenantProfile.id,
        preferredCities: data.preferredCities ?? [],
        preferredLocalities: data.preferredLocalities ?? [],
        maxRent: data.maxRent,
        preferredRent: data.preferredRent,
        maxDeposit: data.maxDeposit,
        propertyTypes: (data.propertyTypes as any) ?? [],
        minBedrooms: data.minBedrooms,
        maxBedrooms: data.maxBedrooms,
        furnishing: (data.furnishing as any) ?? [],
        moveInDate: data.moveInDate,
        minStayMonths: data.minStayMonths,
        maxStayMonths: data.maxStayMonths,
        petsAllowed: data.petsAllowed,
        smokingAllowed: data.smokingAllowed,
        parkingRequired: data.parkingRequired,
        workFromHome: data.workFromHome,
        quietEnvironment: data.quietEnvironment,
        requiredAmenities: data.requiredAmenities ?? [],
        workCity: data.workCity,
      },
      update: {
        preferredCities: data.preferredCities,
        preferredLocalities: data.preferredLocalities,
        maxRent: data.maxRent,
        preferredRent: data.preferredRent,
        maxDeposit: data.maxDeposit,
        propertyTypes: data.propertyTypes as any,
        minBedrooms: data.minBedrooms,
        maxBedrooms: data.maxBedrooms,
        furnishing: data.furnishing as any,
        moveInDate: data.moveInDate,
        minStayMonths: data.minStayMonths,
        maxStayMonths: data.maxStayMonths,
        petsAllowed: data.petsAllowed,
        smokingAllowed: data.smokingAllowed,
        parkingRequired: data.parkingRequired,
        workFromHome: data.workFromHome,
        quietEnvironment: data.quietEnvironment,
        requiredAmenities: data.requiredAmenities,
        workCity: data.workCity,
      },
    });

    // Mark matches as stale so they get recalculated
    await prisma.propertyMatch.updateMany({
      where: { tenantProfileId: tenantProfile.id },
      data: { isStale: true },
    });

    return successResponse({ message: "Preferences saved successfully" });
  } catch (err) {
    console.error("[POST /api/tenant/preferences]", err);
    return serverError();
  }
}

// GET /api/tenant/preferences
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { tenantProfile: { include: { preferences: true } } },
    });
    if (!user) return unauthorized();

    return successResponse({
      tenantProfile: user.tenantProfile,
      preferences: user.tenantProfile?.preferences ?? null,
    });
  } catch (err) {
    console.error("[GET /api/tenant/preferences]", err);
    return serverError();
  }
}
