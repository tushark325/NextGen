import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NextGen database...\n");

  // ─── Landlord Users ──────────────────────────────────────────────────────
  const landlord1 = await prisma.user.upsert({
    where: { email: "suresh.landlord@demo.nextgen.app" },
    update: {},
    create: {
      clerkId: "demo_landlord_1",
      email: "suresh.landlord@demo.nextgen.app",
      firstName: "Suresh",
      lastName: "Kamath",
      role: "LANDLORD",
      phone: "+919876543210",
      landlordProfile: {
        create: {
          ownerType: "INDIVIDUAL",
          identityVerified: "VERIFIED",
          phoneVerified: true,
          emailVerified: true,
          rating: 4.8,
          ratingCount: 23,
          responseRate: 92,
          avgResponseHours: 2,
          totalProperties: 3,
          totalRentals: 15,
          bio: "Property owner with 8 years of experience renting premium apartments in Mumbai. I value professional and reliable tenants.",
        },
      },
      subscription: { create: { plan: "PRO_LANDLORD" } },
    },
  });

  const landlord2 = await prisma.user.upsert({
    where: { email: "anita.landlord@demo.nextgen.app" },
    update: {},
    create: {
      clerkId: "demo_landlord_2",
      email: "anita.landlord@demo.nextgen.app",
      firstName: "Anita",
      lastName: "Reddy",
      role: "LANDLORD",
      phone: "+918765432109",
      landlordProfile: {
        create: {
          ownerType: "INDIVIDUAL",
          identityVerified: "VERIFIED",
          phoneVerified: true,
          emailVerified: true,
          rating: 4.6,
          ratingCount: 18,
          responseRate: 85,
          avgResponseHours: 4,
          totalProperties: 2,
          totalRentals: 10,
          bio: "Villa owner in Whitefield, Bangalore. Looking for responsible tenants for long-term stays.",
          petsAllowed: true,
          smokingAllowed: false,
        },
      },
      subscription: { create: { plan: "FREE" } },
    },
  });

  // ─── Tenant Users ─────────────────────────────────────────────────────────
  const tenant1 = await prisma.user.upsert({
    where: { email: "priya.tenant@demo.nextgen.app" },
    update: {},
    create: {
      clerkId: "demo_tenant_1",
      email: "priya.tenant@demo.nextgen.app",
      firstName: "Priya",
      lastName: "Sharma",
      role: "TENANT",
      phone: "+917654321098",
      tenantProfile: {
        create: {
          occupation: "Software Engineer",
          company: "Infosys",
          jobTitle: "Senior SDE",
          monthlyIncome: 120000,
          employmentType: "SALARIED",
          identityVerified: "VERIFIED",
          phoneVerified: true,
          emailVerified: true,
          preferences: {
            create: {
              preferredCities: ["Mumbai", "Pune"],
              preferredLocalities: ["Powai", "Andheri", "Bandra"],
              maxRent: 35000,
              preferredRent: 28000,
              maxDeposit: 100000,
              propertyTypes: ["APARTMENT", "FLAT"],
              minBedrooms: 1,
              maxBedrooms: 2,
              furnishing: ["FULLY_FURNISHED", "SEMI_FURNISHED"],
              moveInDate: new Date("2025-09-01"),
              minStayMonths: 11,
              petsAllowed: false,
              smokingAllowed: false,
              parkingRequired: false,
              workFromHome: true,
              quietEnvironment: true,
              requiredAmenities: ["Internet / WiFi", "Power Backup", "Security"],
            },
          },
        },
      },
      subscription: { create: { plan: "FREE" } },
    },
  });

  // ─── Properties ───────────────────────────────────────────────────────────
  const property1 = await prisma.property.upsert({
    where: { id: "demo-prop-001" },
    update: {},
    create: {
      id: "demo-prop-001",
      ownerId: landlord1.id,
      title: "Modern 2 BHK with City View — Powai",
      description: `Beautiful semi-furnished 2BHK apartment in the heart of Powai, Mumbai. Features stunning city views from both bedrooms, modern kitchen with granite countertops, and a large living area. Located just 10 minutes from Hiranandani Gardens and 5 minutes from IIT Bombay gate. Walking distance to Powai lake and top restaurants. The society has 24/7 security, CCTV surveillance, and regular maintenance. Ideal for working professionals or small families.`,
      propertyType: "APARTMENT",
      status: "ACTIVE",
      isVerified: true,
      state: "Maharashtra",
      city: "Mumbai",
      locality: "Powai",
      address: "302, Hiranandani Estate, Powai, Mumbai",
      addressPublic: "Powai, Mumbai",
      pincode: "400076",
      lat: 19.1176,
      lng: 72.9060,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      carpetArea: 950,
      builtUpArea: 1100,
      floor: 12,
      totalFloors: 22,
      facing: "North-East",
      propertyAge: 5,
      hasParking: false,
      hasLift: true,
      hasPowerBackup: true,
      furnishing: "SEMI_FURNISHED",
      furnitureItems: ["Bed", "Wardrobe", "AC", "Geyser"],
      rent: 30000,
      deposit: 90000,
      maintenance: 3500,
      brokerage: 0,
      electricityRule: "metered",
      estimatedTotal: 33500,
      petsAllowed: false,
      smokingAllowed: false,
      guestsAllowed: true,
      vegetarianOnly: false,
      preferredGender: "any",
      publishedAt: new Date(),
      viewCount: 234,
      saveCount: 18,
      applicationCount: 7,
      availability: {
        create: {
          status: "AVAILABLE_NOW",
          availableFrom: new Date(),
          minimumStay: 11,
          noticePeriodDays: 60,
        },
      },
      amenities: {
        createMany: {
          data: [
            { name: "Security" },
            { name: "CCTV" },
            { name: "Power Backup" },
            { name: "Lift" },
            { name: "Internet / WiFi" },
          ],
        },
      },
      images: {
        createMany: {
          data: [
            { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", isCover: true, order: 1, caption: "Living Room" },
            { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", isCover: false, order: 2, caption: "Bedroom" },
            { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", isCover: false, order: 3, caption: "Kitchen" },
          ],
        },
      },
    },
  });

  const property2 = await prisma.property.upsert({
    where: { id: "demo-prop-002" },
    update: {},
    create: {
      id: "demo-prop-002",
      ownerId: landlord2.id,
      title: "Spacious Fully Furnished 3 BHK Villa — Whitefield",
      description: `Luxurious 3BHK independent villa in the prime location of Whitefield, Bangalore. The villa features a private garden, covered parking for 2 cars, modular kitchen, and high-quality furnishing throughout. Pets are welcome! Located 2km from Bagmane Tech Park and 3km from ITPL.`,
      propertyType: "VILLA",
      status: "ACTIVE",
      isVerified: true,
      state: "Karnataka",
      city: "Bangalore",
      locality: "Whitefield",
      address: "12, Rose Garden Layout, Whitefield, Bangalore",
      addressPublic: "Whitefield, Bangalore",
      pincode: "560066",
      lat: 12.9698,
      lng: 77.7499,
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      carpetArea: 1800,
      builtUpArea: 2200,
      floor: 0,
      totalFloors: 2,
      facing: "East",
      propertyAge: 3,
      hasParking: true,
      parkingType: "covered",
      hasLift: false,
      hasPowerBackup: true,
      furnishing: "FULLY_FURNISHED",
      furnitureItems: ["Bed", "Sofa", "Dining Table", "Wardrobe", "Refrigerator", "Washing Machine", "AC", "TV", "Geyser", "Microwave"],
      rent: 55000,
      deposit: 165000,
      maintenance: 5000,
      brokerage: 0,
      electricityRule: "metered",
      estimatedTotal: 62000,
      petsAllowed: true,
      smokingAllowed: false,
      guestsAllowed: true,
      vegetarianOnly: false,
      preferredGender: "any",
      publishedAt: new Date(),
      viewCount: 189,
      saveCount: 24,
      applicationCount: 5,
      availability: {
        create: {
          status: "AVAILABLE_FROM",
          availableFrom: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          minimumStay: 12,
          noticePeriodDays: 60,
        },
      },
      amenities: {
        createMany: {
          data: [
            { name: "Security Guard" },
            { name: "Garden" },
            { name: "Internet / WiFi" },
            { name: "Power Backup" },
          ],
        },
      },
      images: {
        createMany: {
          data: [
            { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", isCover: true, order: 1, caption: "Villa Exterior" },
            { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", isCover: false, order: 2, caption: "Living Room" },
            { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", isCover: false, order: 3, caption: "Bedroom" },
          ],
        },
      },
    },
  });

  const property3 = await prisma.property.upsert({
    where: { id: "demo-prop-003" },
    update: {},
    create: {
      id: "demo-prop-003",
      ownerId: landlord1.id,
      title: "Cozy Fully Furnished Studio Near Hinjewadi IT Park",
      description: `Perfect studio apartment for IT professionals working in Hinjewadi Phase 1, 2, or 3. Fully equipped kitchen, high-speed internet included, and just 5 minutes from Infosys and Wipro offices.`,
      propertyType: "STUDIO",
      status: "ACTIVE",
      isVerified: false,
      state: "Maharashtra",
      city: "Pune",
      locality: "Hinjewadi",
      address: "A-104, Crystal Tower, Hinjewadi Phase 1, Pune",
      addressPublic: "Hinjewadi, Pune",
      pincode: "411057",
      lat: 18.5914,
      lng: 73.7380,
      bedrooms: 1,
      bathrooms: 1,
      balconies: 1,
      carpetArea: 420,
      builtUpArea: 550,
      floor: 4,
      totalFloors: 10,
      hasParking: false,
      hasLift: true,
      hasPowerBackup: false,
      furnishing: "FULLY_FURNISHED",
      furnitureItems: ["Bed", "Wardrobe", "AC", "TV", "Geyser", "Study Table"],
      rent: 15000,
      deposit: 45000,
      maintenance: 1500,
      brokerage: 0,
      electricityRule: "metered",
      estimatedTotal: 17000,
      petsAllowed: false,
      smokingAllowed: false,
      guestsAllowed: true,
      vegetarianOnly: false,
      preferredGender: "any",
      publishedAt: new Date(),
      viewCount: 95,
      saveCount: 11,
      applicationCount: 3,
      availability: {
        create: {
          status: "AVAILABLE_NOW",
          availableFrom: new Date(),
          minimumStay: 6,
          noticePeriodDays: 30,
        },
      },
      amenities: {
        createMany: {
          data: [
            { name: "Security" },
            { name: "CCTV" },
            { name: "Internet / WiFi" },
            { name: "Lift" },
          ],
        },
      },
      images: {
        createMany: {
          data: [
            { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", isCover: true, order: 1, caption: "Studio Room" },
            { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", isCover: false, order: 2, caption: "Kitchen" },
          ],
        },
      },
    },
  });

  // ─── Matching Config ───────────────────────────────────────────────────────
  await prisma.matchingConfig.upsert({
    where: { id: "default-config" },
    update: {},
    create: {
      id: "default-config",
      name: "Default Matching Config",
      isActive: true,
      locationWeight: 0.25,
      budgetWeight: 0.25,
      propertyWeight: 0.10,
      bedroomWeight: 0.10,
      availabilityWeight: 0.10,
      amenityWeight: 0.08,
      furnishingWeight: 0.07,
      commuteWeight: 0.03,
      preferenceWeight: 0.02,
      otherWeight: 0.0,
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Users: ${landlord1.email}, ${landlord2.email}, ${tenant1.email}`);
  console.log(`   Properties: ${property1.id}, ${property2.id}, ${property3.id}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
