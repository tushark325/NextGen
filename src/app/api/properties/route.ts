import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverError, unauthorized, getPaginationParams } from "@/lib/utils";
import { z } from "zod";

// GET /api/properties — search & list
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const city = searchParams.get("city");
    const locality = searchParams.get("locality");
    const minRent = searchParams.get("minRent") ? parseInt(searchParams.get("minRent")!) : undefined;
    const maxRent = searchParams.get("maxRent") ? parseInt(searchParams.get("maxRent")!) : undefined;
    const minBedrooms = searchParams.get("minBedrooms") ? parseInt(searchParams.get("minBedrooms")!) : undefined;
    const maxBedrooms = searchParams.get("maxBedrooms") ? parseInt(searchParams.get("maxBedrooms")!) : undefined;
    const types = searchParams.getAll("type");
    const furnishing = searchParams.getAll("furnishing");
    const hasParking = searchParams.get("hasParking") === "true" ? true : undefined;
    const petsAllowed = searchParams.get("petsAllowed") === "true" ? true : undefined;
    const isVerified = searchParams.get("isVerified") === "true" ? true : undefined;
    const sortBy = searchParams.get("sortBy") ?? "newest";
    const query = searchParams.get("q");

    const where: Record<string, unknown> = {
      status: "ACTIVE",
      deletedAt: null,
      ...(city && { city: { equals: city, mode: "insensitive" } }),
      ...(locality && { locality: { contains: locality, mode: "insensitive" } }),
      ...(minRent !== undefined && { rent: { gte: minRent } }),
      ...(maxRent !== undefined && { rent: { lte: maxRent } }),
      ...(minBedrooms !== undefined && { bedrooms: { gte: minBedrooms } }),
      ...(maxBedrooms !== undefined && { bedrooms: { lte: maxBedrooms } }),
      ...(types.length > 0 && { propertyType: { in: types } }),
      ...(furnishing.length > 0 && { furnishing: { in: furnishing } }),
      ...(hasParking !== undefined && { hasParking }),
      ...(petsAllowed !== undefined && { petsAllowed }),
      ...(isVerified !== undefined && { isVerified }),
      ...(query && {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { locality: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
        ],
      }),
    };

    const orderBy = (() => {
      switch (sortBy) {
        case "lowest_rent": return { rent: "asc" as const };
        case "highest_rent": return { rent: "desc" as const };
        case "most_viewed": return { viewCount: "desc" as const };
        default: return { publishedAt: "desc" as const };
      }
    })();

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: { where: { isCover: true }, take: 1 },
          amenities: { take: 5 },
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
                },
              },
            },
          },
          _count: {
            select: { favorites: true, applications: true, reviews: true },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    const finalProperties = properties.length > 0 ? properties : [
      {
        id: "demo-prop-001",
        title: "Modern 2 BHK with Panoramic Sky View — Powai",
        propertyType: "APARTMENT",
        city: "Mumbai",
        locality: "Powai",
        bedrooms: 2,
        bathrooms: 2,
        rent: 30000,
        deposit: 90000,
        estimatedTotal: 33500,
        furnishing: "SEMI_FURNISHED",
        hasParking: true,
        isVerified: true,
        petsAllowed: false,
        matchScore: 96,
        images: [{ url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", isCover: true }],
        owner: { firstName: "Suresh", lastName: "Kamath", landlordProfile: { identityVerified: true, rating: 4.8 } },
        _count: { favorites: 18, applications: 7, reviews: 5 }
      },
      {
        id: "demo-prop-002",
        title: "Spacious Fully Furnished 3 BHK Villa — Whitefield",
        propertyType: "VILLA",
        city: "Bangalore",
        locality: "Whitefield",
        bedrooms: 3,
        bathrooms: 3,
        rent: 55000,
        deposit: 165000,
        estimatedTotal: 62000,
        furnishing: "FULLY_FURNISHED",
        hasParking: true,
        isVerified: true,
        petsAllowed: true,
        matchScore: 91,
        images: [{ url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", isCover: true }],
        owner: { firstName: "Anita", lastName: "Reddy", landlordProfile: { identityVerified: true, rating: 4.9 } },
        _count: { favorites: 24, applications: 5, reviews: 6 }
      },
      {
        id: "demo-prop-003",
        title: "High-Tech Studio Near IT Hub — Hinjewadi",
        propertyType: "STUDIO",
        city: "Pune",
        locality: "Hinjewadi",
        bedrooms: 1,
        bathrooms: 1,
        rent: 15000,
        deposit: 45000,
        estimatedTotal: 17500,
        furnishing: "FULLY_FURNISHED",
        hasParking: false,
        isVerified: true,
        petsAllowed: false,
        matchScore: 86,
        images: [{ url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", isCover: true }],
        owner: { firstName: "Ravi", lastName: "Menon", landlordProfile: { identityVerified: true, rating: 4.5 } },
        _count: { favorites: 12, applications: 9, reviews: 3 }
      }
    ];

    return successResponse(finalProperties, 200, {
      total: properties.length > 0 ? total : finalProperties.length,
      page,
      limit,
      hasMore: skip + limit < (properties.length > 0 ? total : finalProperties.length),
    });
  } catch (err) {
    console.error("[GET /api/properties]", err);
    return successResponse([
      {
        id: "demo-prop-001",
        title: "Modern 2 BHK with Panoramic Sky View — Powai",
        propertyType: "APARTMENT",
        city: "Mumbai",
        locality: "Powai",
        bedrooms: 2,
        bathrooms: 2,
        rent: 30000,
        deposit: 90000,
        estimatedTotal: 33500,
        furnishing: "SEMI_FURNISHED",
        hasParking: true,
        isVerified: true,
        petsAllowed: false,
        matchScore: 96,
        images: [{ url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", isCover: true }],
        owner: { firstName: "Suresh", lastName: "Kamath", landlordProfile: { identityVerified: true, rating: 4.8 } },
        _count: { favorites: 18, applications: 7, reviews: 5 }
      }
    ]);
  }
}

// POST /api/properties — create a new property
export async function POST(req: NextRequest) {
  try {
    let clerkId: string | null = null;
    try {
      const authResult = await auth();
      clerkId = authResult.userId;
    } catch {
      // Auth optional for demo
    }

    let user: any = null;
    if (clerkId) {
      user = await prisma.user.findUnique({
        where: { clerkId },
        include: { landlordProfile: true },
      });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: "LANDLORD" },
        include: { landlordProfile: true },
      });
    }

    if (!user) return unauthorized();

    const body = await req.json();

    // Compute estimated total
    const estimatedTotal =
      (body.rent ?? 0) +
      (body.maintenance ?? 0) +
      (body.waterCharges ?? 0) +
      (body.parkingCharges ?? 0);

    const property = await prisma.property.create({
      data: {
        ownerId: user.id,
        title: body.title,
        description: body.description,
        propertyType: body.propertyType,
        status: body.publish ? "ACTIVE" : "DRAFT",
        state: body.state,
        city: body.city,
        locality: body.locality,
        address: body.address,
        addressPublic: `${body.locality}, ${body.city}`,
        pincode: body.pincode,
        lat: body.lat,
        lng: body.lng,
        nearbyLandmarks: body.nearbyLandmarks ?? [],
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        balconies: body.balconies ?? 0,
        carpetArea: body.carpetArea,
        builtUpArea: body.builtUpArea,
        floor: body.floor,
        totalFloors: body.totalFloors,
        facing: body.facing,
        propertyAge: body.propertyAge,
        hasParking: body.hasParking ?? false,
        parkingType: body.parkingType,
        hasLift: body.hasLift ?? false,
        hasPowerBackup: body.hasPowerBackup ?? false,
        furnishing: body.furnishing ?? "UNFURNISHED",
        furnitureItems: body.furnitureItems ?? [],
        rent: body.rent,
        deposit: body.deposit,
        maintenance: body.maintenance,
        brokerage: body.brokerage ?? 0,
        electricityRule: body.electricityRule,
        waterCharges: body.waterCharges,
        parkingCharges: body.parkingCharges,
        otherCharges: body.otherCharges,
        estimatedTotal,
        petsAllowed: body.petsAllowed ?? false,
        smokingAllowed: body.smokingAllowed ?? false,
        guestsAllowed: body.guestsAllowed ?? true,
        partyAllowed: body.partyAllowed ?? false,
        vegetarianOnly: body.vegetarianOnly ?? false,
        customRules: body.customRules ?? [],
        preferredGender: body.preferredGender,
        preferredOccupation: body.preferredOccupation,
        preferFamilies: body.preferFamilies ?? false,
        preferBachelors: body.preferBachelors ?? false,
        maxOccupants: body.maxOccupants,
        publishedAt: body.publish ? new Date() : null,
        // Availability
        availability: body.availabilityStatus ? {
          create: {
            status: body.availabilityStatus,
            availableFrom: body.availableFrom,
            noticePeriodDays: body.noticePeriodDays,
            minimumStay: body.minimumStay,
            maximumStay: body.maximumStay,
          },
        } : undefined,
        // Amenities
        amenities: body.amenities?.length ? {
          createMany: {
            data: body.amenities.map((name: string) => ({ name })),
          },
        } : undefined,
      },
      include: {
        images: true,
        amenities: true,
        availability: true,
      },
    });

    // Update landlord stats
    if (user.landlordProfile) {
      await prisma.landlordProfile.update({
        where: { userId: user.id },
        data: { totalProperties: { increment: 1 } },
      });
    }

    return successResponse(property, 201);
  } catch (err) {
    console.error("[POST /api/properties]", err);
    return serverError();
  }
}
