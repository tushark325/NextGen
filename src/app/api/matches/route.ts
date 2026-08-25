import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverError, unauthorized, notFound } from "@/lib/utils";
import { calculateMatchScore, rankProperties, DEFAULT_WEIGHTS } from "@/lib/matching-engine";
import type { PropertyWithDetails } from "@/lib/matching-engine";

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
      user = await prisma.user.findUnique({
        where: { clerkId },
        include: {
          tenantProfile: {
            include: { preferences: true },
          },
        },
      });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: "TENANT" },
        include: {
          tenantProfile: {
            include: { preferences: true },
          },
        },
      });
    }

    if (!user || !user.tenantProfile) {
      return successResponse({
        matches: [],
        message: "Complete your profile to get personalized matches",
        hasPreferences: false,
      });
    }

    const pref = user.tenantProfile.preferences;
    if (!pref) {
      return successResponse({
        matches: [],
        message: "Set your rental preferences to get matched",
        hasPreferences: false,
      });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

    // Fetch candidate properties (pre-filtered by city and rent)
    const candidates = await prisma.property.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        ...(pref.preferredCities.length > 0 && {
          city: { in: pref.preferredCities },
        }),
        rent: { lte: pref.maxRent * 1.3 }, // 30% buffer
      },
      include: {
        images: { where: { isCover: true }, take: 1 },
        amenities: true,
        availability: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            landlordProfile: {
              select: {
                rating: true,
                ratingCount: true,
                identityVerified: true,
                responseRate: true,
                totalRentals: true,
                petsAllowed: true,
                smokingAllowed: true,
              },
            },
          },
        },
      },
      take: 200, // Score top 200 candidates
    });

    // Fetch landlord profiles for two-way scoring
    const landlordIds = [...new Set(candidates.map((p) => p.ownerId))];
    const landlordProfiles = await prisma.landlordProfile.findMany({
      where: { userId: { in: landlordIds } },
    });
    const lpMap = new Map(landlordProfiles.map((lp) => [lp.userId, lp]));

    // Get active matching config
    let weights = DEFAULT_WEIGHTS;
    try {
      const config = await prisma.matchingConfig.findFirst({ where: { isActive: true } });
      if (config) {
        weights = {
          location: config.locationWeight,
          budget: config.budgetWeight,
          propertyType: config.propertyWeight,
          bedrooms: config.bedroomWeight,
          availability: config.availabilityWeight,
          amenities: config.amenityWeight,
          furnishing: config.furnishingWeight,
          commute: config.commuteWeight,
          preference: config.preferenceWeight,
          other: config.otherWeight,
        };
      }
    } catch {} // Use defaults if config not set up

    // Score and rank
    const ranked = rankProperties(
      pref as any,
      candidates as unknown as PropertyWithDetails[],
      lpMap as any,
      weights
    );

    const topMatches = ranked.slice(0, limit);

    // Persist match scores asynchronously (fire-and-forget)
    Promise.all(
      topMatches.map(({ property, score }) =>
        prisma.propertyMatch.upsert({
          where: {
            propertyId_tenantProfileId: {
              propertyId: property.id,
              tenantProfileId: user.tenantProfile!.id,
            },
          },
          update: {
            overallScore: score.overall,
            mutualScore: score.mutualScore,
            locationScore: score.locationScore,
            budgetScore: score.budgetScore,
            propertyTypeScore: score.propertyTypeScore,
            bedroomScore: score.bedroomScore,
            availabilityScore: score.availabilityScore,
            amenityScore: score.amenityScore,
            furnishingScore: score.furnishingScore,
            commuteScore: score.commuteScore,
            preferenceScore: score.preferenceScore,
            explanation: score.explanation as any,
            calculatedAt: new Date(),
            isStale: false,
          },
          create: {
            propertyId: property.id,
            tenantProfileId: user.tenantProfile!.id,
            overallScore: score.overall,
            mutualScore: score.mutualScore,
            locationScore: score.locationScore,
            budgetScore: score.budgetScore,
            propertyTypeScore: score.propertyTypeScore,
            bedroomScore: score.bedroomScore,
            availabilityScore: score.availabilityScore,
            amenityScore: score.amenityScore,
            furnishingScore: score.furnishingScore,
            commuteScore: score.commuteScore,
            preferenceScore: score.preferenceScore,
            explanation: score.explanation as any,
          },
        })
      )
    ).catch((err) => console.error("Match score persistence error:", err));

    return successResponse({
      matches: topMatches.map(({ property, score }) => ({
        property,
        score: {
          overall: score.overall,
          mutualScore: score.mutualScore,
          tenantToPropertyScore: score.tenantToPropertyScore,
          landlordToTenantScore: score.landlordToTenantScore,
          locationScore: score.locationScore,
          budgetScore: score.budgetScore,
          explanation: score.explanation,
        },
      })),
      hasPreferences: true,
      totalCandidates: candidates.length,
    });
  } catch (err) {
    console.error("[GET /api/matches]", err);
    return serverError();
  }
}
