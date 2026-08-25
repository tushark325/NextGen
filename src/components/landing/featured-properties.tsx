"use client";

import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";

// Demo data for the landing page
const FEATURED = [
  {
    id: "demo-1",
    title: "Modern 2 BHK with Panoramic Sky View",
    propertyType: "APARTMENT",
    city: "Mumbai",
    locality: "Powai",
    bedrooms: 2,
    bathrooms: 2,
    rent: 30000,
    estimatedTotal: 34500,
    deposit: 90000,
    furnishing: "SEMI_FURNISHED",
    hasParking: true,
    isVerified: true,
    petsAllowed: false,
    matchScore: 94,
    coverImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    owner: {
      firstName: "Suresh",
      lastName: "Kamath",
      avatarUrl: null,
      landlordProfile: { identityVerified: true, rating: 4.9 },
    },
  },
  {
    id: "demo-2",
    title: "Spacious 3 BHK Smart Villa & Private Garden",
    propertyType: "VILLA",
    city: "Bangalore",
    locality: "Whitefield",
    bedrooms: 3,
    bathrooms: 3,
    rent: 55000,
    estimatedTotal: 62000,
    deposit: 165000,
    furnishing: "FULLY_FURNISHED",
    hasParking: true,
    isVerified: true,
    petsAllowed: true,
    matchScore: 89,
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    owner: {
      firstName: "Anita",
      lastName: "Reddy",
      avatarUrl: null,
      landlordProfile: { identityVerified: true, rating: 4.8 },
    },
  },
  {
    id: "demo-3",
    title: "High-Tech Studio Near IT Hub",
    propertyType: "STUDIO",
    city: "Pune",
    locality: "Hinjewadi",
    bedrooms: 1,
    bathrooms: 1,
    rent: 15000,
    estimatedTotal: 17500,
    deposit: 45000,
    furnishing: "FULLY_FURNISHED",
    hasParking: false,
    isVerified: true,
    petsAllowed: false,
    matchScore: 82,
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    owner: {
      firstName: "Ravi",
      lastName: "Menon",
      avatarUrl: null,
      landlordProfile: { identityVerified: false, rating: 4.5 },
    },
  },
];

export function FeaturedProperties() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {FEATURED.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}
