/**
 * NextGen — Smart Matching Engine
 *
 * Calculates a mutual compatibility score between a tenant and a property.
 * Returns a 0-100 score with detailed component breakdown and human-readable
 * explanations. Weights are configurable via the MatchingConfig table.
 */

import type { TenantPreference, Property, PropertyAmenity, PropertyAvailability, LandlordProfile } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface MatchWeights {
  location: number;      // 25
  budget: number;        // 20
  propertyType: number;  // 10
  bedrooms: number;      // 10
  availability: number;  // 10
  amenities: number;     // 5
  furnishing: number;    // 5
  commute: number;       // 5
  preference: number;    // 5
  other: number;         // 5
}

export type MatchStatus = "excellent" | "good" | "partial" | "missing" | "conflict";

export interface MatchExplanationItem {
  factor: string;
  label: string;
  status: MatchStatus;
  message: string;
  isPositive: boolean;
  score: number; // component score 0-100
}

export interface MatchScoreResult {
  overall: number;           // 0-100
  tenantToPropertyScore: number;  // How well property fits tenant
  landlordToTenantScore: number;  // How likely landlord accepts tenant
  mutualScore: number;       // Geometric mean of both

  // Component scores
  locationScore: number;
  budgetScore: number;
  propertyTypeScore: number;
  bedroomScore: number;
  availabilityScore: number;
  amenityScore: number;
  furnishingScore: number;
  commuteScore: number;
  preferenceScore: number;

  // Explanation
  explanation: MatchExplanationItem[];

  // Hard filtered out?
  isFiltered: boolean;
  filterReason?: string;
}

export interface PropertyWithDetails extends Property {
  amenities: PropertyAmenity[];
  availability: PropertyAvailability | null;
}

export interface LandlordWithProfile {
  landlordProfile: LandlordProfile | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT WEIGHTS
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_WEIGHTS: MatchWeights = {
  location: 25,
  budget: 20,
  propertyType: 10,
  bedrooms: 10,
  availability: 10,
  amenities: 5,
  furnishing: 5,
  commute: 5,
  preference: 5,
  other: 5,
};

// ─────────────────────────────────────────────────────────────────────────────
// HARD CONSTRAINT FILTER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a reason string if the property should be hard-filtered out,
 * or null if it passes.
 */
export function hardFilter(
  pref: TenantPreference,
  property: PropertyWithDetails
): string | null {
  // Property must be active and available
  if (property.status !== "ACTIVE") {
    return "Property is not active";
  }

  if (property.availability?.status === "OCCUPIED" && !property.availability.expectedVacancy) {
    return "Property is occupied with no expected vacancy";
  }

  // City must match
  if (pref.preferredCities.length > 0) {
    const cityMatch = pref.preferredCities.some(
      (c) => c.toLowerCase() === property.city.toLowerCase()
    );
    if (!cityMatch) return "Property is in a different city";
  }

  // Rent cannot be more than 130% of max budget (hard cap)
  if (property.rent > pref.maxRent * 1.3) {
    return `Rent ₹${property.rent.toLocaleString("en-IN")} is significantly above budget`;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT SCORERS
// ─────────────────────────────────────────────────────────────────────────────

/** Location score: city + locality match */
function scoreLocation(
  pref: TenantPreference,
  property: PropertyWithDetails
): { score: number; explanation: MatchExplanationItem } {
  let score = 0;
  let status: MatchStatus = "missing";
  let message = "";

  const cityMatch = pref.preferredCities.some(
    (c) => c.toLowerCase() === property.city.toLowerCase()
  );

  const localityMatch = pref.preferredLocalities.some(
    (l) => l.toLowerCase() === property.locality.toLowerCase()
  );

  if (cityMatch && localityMatch) {
    score = 100;
    status = "excellent";
    message = `In preferred area: ${property.locality}, ${property.city}`;
  } else if (cityMatch) {
    score = 75;
    status = "good";
    message = `In preferred city (${property.city}) but different locality`;
  } else {
    score = 0;
    status = "missing";
    message = `Not in preferred city`;
  }

  return {
    score,
    explanation: {
      factor: "location",
      label: "Location",
      status,
      message,
      isPositive: score >= 60,
      score,
    },
  };
}

/** Budget score: how well rent fits budget */
function scoreBudget(
  pref: TenantPreference,
  property: PropertyWithDetails
): { score: number; explanation: MatchExplanationItem } {
  const totalCost =
    property.rent +
    (property.maintenance ?? 0) +
    (property.waterCharges ?? 0);

  const maxBudget = pref.maxMonthlyTotal ?? pref.maxRent;
  const preferredRent = pref.preferredRent ?? pref.maxRent;

  let score = 0;
  let status: MatchStatus = "missing";
  let message = "";

  if (property.rent <= preferredRent) {
    score = 100;
    status = "excellent";
    message = `₹${property.rent.toLocaleString("en-IN")}/mo within preferred budget`;
  } else if (property.rent <= pref.maxRent) {
    const ratio = (pref.maxRent - property.rent) / (pref.maxRent - preferredRent);
    score = Math.round(70 + ratio * 30);
    status = "good";
    message = `₹${property.rent.toLocaleString("en-IN")}/mo within max budget`;
  } else if (property.rent <= pref.maxRent * 1.1) {
    score = 50;
    status = "partial";
    message = `₹${property.rent.toLocaleString("en-IN")}/mo slightly above max budget`;
  } else {
    score = Math.max(0, 40 - Math.round(((property.rent - pref.maxRent) / pref.maxRent) * 100));
    status = "conflict";
    message = `₹${property.rent.toLocaleString("en-IN")}/mo exceeds budget by ₹${(property.rent - pref.maxRent).toLocaleString("en-IN")}`;
  }

  // Warn if total cost exceeds total budget
  if (pref.maxMonthlyTotal && totalCost > pref.maxMonthlyTotal) {
    message += `. Total monthly cost ~₹${totalCost.toLocaleString("en-IN")} exceeds ₹${pref.maxMonthlyTotal.toLocaleString("en-IN")} total budget`;
    score = Math.min(score, 60);
    status = "partial";
  }

  return {
    score,
    explanation: {
      factor: "budget",
      label: "Budget",
      status,
      message,
      isPositive: score >= 50,
      score,
    },
  };
}

/** Property type score */
function scorePropertyType(
  pref: TenantPreference,
  property: PropertyWithDetails
): { score: number; explanation: MatchExplanationItem } {
  const match = pref.propertyTypes.length === 0 || pref.propertyTypes.includes(property.propertyType);

  const score = match ? 100 : 20;
  const status: MatchStatus = match ? "excellent" : "partial";
  const message = match
    ? `Preferred property type: ${property.propertyType.replace("_", " ").toLowerCase()}`
    : `You prefer ${pref.propertyTypes.join("/")} but this is ${property.propertyType}`;

  return {
    score,
    explanation: {
      factor: "propertyType",
      label: "Property Type",
      status,
      message,
      isPositive: match,
      score,
    },
  };
}

/** Bedroom score */
function scoreBedrooms(
  pref: TenantPreference,
  property: PropertyWithDetails
): { score: number; explanation: MatchExplanationItem } {
  const min = pref.minBedrooms ?? 0;
  const max = pref.maxBedrooms ?? 99;
  const beds = property.bedrooms;

  let score = 0;
  let status: MatchStatus = "missing";
  let message = "";

  if (beds >= min && beds <= max) {
    score = 100;
    status = "excellent";
    message = `${beds} BHK matches your requirement`;
  } else if (beds === min - 1 || beds === max + 1) {
    score = 60;
    status = "partial";
    message = `${beds} BHK is close to your ${min}–${max} BHK preference`;
  } else {
    score = 20;
    status = "missing";
    message = `${beds} BHK doesn't match your ${min}–${max} BHK requirement`;
  }

  return {
    score,
    explanation: {
      factor: "bedrooms",
      label: "Bedrooms",
      status,
      message,
      isPositive: score >= 60,
      score,
    },
  };
}

/** Availability score: is the property available when tenant needs it? */
function scoreAvailability(
  pref: TenantPreference,
  property: PropertyWithDetails
): { score: number; explanation: MatchExplanationItem } {
  if (!pref.moveInDate) {
    return {
      score: 80,
      explanation: {
        factor: "availability",
        label: "Availability",
        status: "good",
        message: "No specific move-in date set",
        isPositive: true,
        score: 80,
      },
    };
  }

  const avail = property.availability;
  const moveIn = new Date(pref.moveInDate);
  const now = new Date();

  let score = 0;
  let status: MatchStatus = "missing";
  let message = "";

  if (!avail || avail.status === "AVAILABLE_NOW") {
    // Available now — check if move-in is in the future
    const daysUntilMoveIn = Math.floor((moveIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilMoveIn <= 30) {
      score = 100;
      status = "excellent";
      message = "Available now, matches your move-in date";
    } else {
      score = 85;
      status = "good";
      message = `Available now, your move-in is ${daysUntilMoveIn} days away`;
    }
  } else if (avail.status === "AVAILABLE_FROM" && avail.availableFrom) {
    const availDate = new Date(avail.availableFrom);
    const diffDays = Math.floor((availDate.getTime() - moveIn.getTime()) / (1000 * 60 * 60 * 24));

    if (Math.abs(diffDays) <= 7) {
      score = 100;
      status = "excellent";
      message = `Available ${availDate.toLocaleDateString("en-IN")}, very close to your move-in date`;
    } else if (diffDays <= 0 && diffDays >= -30) {
      score = 90;
      status = "excellent";
      message = `Available ${availDate.toLocaleDateString("en-IN")}, before your move-in date`;
    } else if (diffDays > 0 && diffDays <= 14) {
      score = 80;
      status = "good";
      message = `Available ${availDate.toLocaleDateString("en-IN")}, ${diffDays} days after your planned move-in`;
    } else if (diffDays > 14 && diffDays <= 30) {
      score = 60;
      status = "partial";
      message = `Available ${availDate.toLocaleDateString("en-IN")}, ${diffDays} days after your planned move-in`;
    } else {
      score = 20;
      status = "conflict";
      message = `Not available until ${availDate.toLocaleDateString("en-IN")}`;
    }
  } else if (avail.status === "OCCUPIED") {
    const expectedVacancy = avail.expectedVacancy ? new Date(avail.expectedVacancy) : null;
    if (expectedVacancy) {
      const diffDays = Math.floor((expectedVacancy.getTime() - moveIn.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= -7 && diffDays <= 14) {
        score = 70;
        status = "partial";
        message = `Currently occupied, expected vacancy near your move-in date`;
      } else {
        score = 30;
        status = "conflict";
        message = `Currently occupied, expected vacancy ${expectedVacancy.toLocaleDateString("en-IN")}`;
      }
    } else {
      score = 0;
      status = "missing";
      message = "Currently occupied, no expected vacancy date";
    }
  }

  return {
    score,
    explanation: {
      factor: "availability",
      label: "Move-in Date",
      status,
      message,
      isPositive: score >= 60,
      score,
    },
  };
}

/** Amenity score */
function scoreAmenities(
  pref: TenantPreference,
  property: PropertyWithDetails
): { score: number; explanation: MatchExplanationItem } {
  if (!pref.requiredAmenities || pref.requiredAmenities.length === 0) {
    return {
      score: 90,
      explanation: {
        factor: "amenities",
        label: "Amenities",
        status: "good",
        message: "No specific amenities required",
        isPositive: true,
        score: 90,
      },
    };
  }

  const propertyAmenityNames = property.amenities.map((a) => a.name.toLowerCase());
  const required = pref.requiredAmenities.map((a) => a.toLowerCase());

  const matched = required.filter((a) => propertyAmenityNames.includes(a));
  const missing = required.filter((a) => !propertyAmenityNames.includes(a));

  const ratio = matched.length / required.length;
  const score = Math.round(ratio * 100);

  let status: MatchStatus = "missing";
  let message = "";

  if (score === 100) {
    status = "excellent";
    message = "All required amenities available";
  } else if (score >= 70) {
    status = "good";
    message = `Most amenities available. Missing: ${missing.join(", ")}`;
  } else if (score >= 40) {
    status = "partial";
    message = `Some amenities missing: ${missing.join(", ")}`;
  } else {
    status = "conflict";
    message = `Missing key amenities: ${missing.join(", ")}`;
  }

  return {
    score,
    explanation: {
      factor: "amenities",
      label: "Amenities",
      status,
      message,
      isPositive: score >= 60,
      score,
    },
  };
}

/** Furnishing score */
function scoreFurnishing(
  pref: TenantPreference,
  property: PropertyWithDetails
): { score: number; explanation: MatchExplanationItem } {
  if (!pref.furnishing || pref.furnishing.length === 0) {
    return {
      score: 90,
      explanation: {
        factor: "furnishing",
        label: "Furnishing",
        status: "good",
        message: "No furnishing preference set",
        isPositive: true,
        score: 90,
      },
    };
  }

  const match = pref.furnishing.includes(property.furnishing);

  // Partial score for semi-furnished vs fully-furnished preference
  let score = 0;
  if (match) {
    score = 100;
  } else if (
    (property.furnishing === "FULLY_FURNISHED" && pref.furnishing.includes("SEMI_FURNISHED")) ||
    (property.furnishing === "SEMI_FURNISHED" && pref.furnishing.includes("FULLY_FURNISHED"))
  ) {
    score = 60;
  } else {
    score = 20;
  }

  const furnishingLabel: Record<string, string> = {
    FULLY_FURNISHED: "Fully Furnished",
    SEMI_FURNISHED: "Semi Furnished",
    UNFURNISHED: "Unfurnished",
  };

  const status: MatchStatus = score >= 100 ? "excellent" : score >= 60 ? "partial" : "conflict";
  const message = match
    ? `${furnishingLabel[property.furnishing]} as preferred`
    : `${furnishingLabel[property.furnishing]} (you prefer ${pref.furnishing.map((f) => furnishingLabel[f]).join(" or ")})`;

  return {
    score,
    explanation: {
      factor: "furnishing",
      label: "Furnishing",
      status,
      message,
      isPositive: score >= 60,
      score,
    },
  };
}

/** Commute score: approximate distance to work */
function scoreCommute(
  pref: TenantPreference,
  property: PropertyWithDetails
): { score: number; explanation: MatchExplanationItem } {
  // If no work location set, skip
  if (!pref.workCity && !pref.preferredCities.length) {
    return {
      score: 80,
      explanation: {
        factor: "commute",
        label: "Commute",
        status: "good",
        message: "No work location set",
        isPositive: true,
        score: 80,
      },
    };
  }

  // Use haversine distance if lat/lng available
  // For now, use city match as proxy
  const sameCity = pref.preferredCities.some(
    (c) => c.toLowerCase() === property.city.toLowerCase()
  );

  const score = sameCity ? 85 : 30;
  const status: MatchStatus = sameCity ? "good" : "partial";
  const message = sameCity
    ? "Property is in your city"
    : "Property is in a different city from your preferred area";

  return {
    score,
    explanation: {
      factor: "commute",
      label: "Commute",
      status,
      message,
      isPositive: sameCity,
      score,
    },
  };
}

/** Lifestyle/preference score: pets, smoking, parking, WFH, etc. */
function scorePreferences(
  pref: TenantPreference,
  property: PropertyWithDetails
): { score: number; explanation: MatchExplanationItem[] } {
  const items: MatchExplanationItem[] = [];
  let totalPoints = 0;
  let maxPoints = 0;

  const check = (
    factor: string,
    label: string,
    tenantNeeds: boolean | null | undefined,
    propertyAllows: boolean,
    conflictMessage: string,
    matchMessage: string
  ) => {
    if (tenantNeeds == null) return; // not specified, skip
    maxPoints += 1;
    if (tenantNeeds && propertyAllows) {
      totalPoints += 1;
      items.push({ factor, label, status: "excellent", message: matchMessage, isPositive: true, score: 100 });
    } else if (tenantNeeds && !propertyAllows) {
      items.push({ factor, label, status: "conflict", message: conflictMessage, isPositive: false, score: 0 });
    } else {
      totalPoints += 1; // tenant doesn't need it, doesn't matter
      items.push({ factor, label, status: "good", message: "No conflict", isPositive: true, score: 100 });
    }
  };

  check("pets", "Pets", pref.petsAllowed, property.petsAllowed, "Pets not allowed", "Pets allowed ✓");
  check("smoking", "Smoking", pref.smokingAllowed, property.smokingAllowed, "Smoking not allowed", "Smoking allowed ✓");
  check("parking", "Parking", pref.parkingRequired, property.hasParking, "No parking available", "Parking available ✓");

  if (pref.workFromHome) {
    // WFH — look for WFH friendly in rules or amenities
    const hasInternet = property.amenities.some((a) => a.name.toLowerCase().includes("internet") || a.name.toLowerCase().includes("wifi"));
    maxPoints += 1;
    if (hasInternet) {
      totalPoints += 1;
      items.push({ factor: "wfh", label: "Work from Home", status: "good", message: "Internet/WiFi available", isPositive: true, score: 80 });
    } else {
      items.push({ factor: "wfh", label: "Work from Home", status: "partial", message: "No internet/WiFi mentioned", isPositive: false, score: 40 });
      totalPoints += 0.4;
    }
  }

  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 80;
  const status: MatchStatus = score >= 90 ? "excellent" : score >= 70 ? "good" : score >= 50 ? "partial" : "conflict";

  return {
    score,
    explanation: items,
  };
}

/** Landlord acceptance score: how likely is the landlord to accept this tenant */
function scoreLandlordAcceptance(
  pref: TenantPreference,
  property: PropertyWithDetails,
  landlordProfile: LandlordProfile | null
): number {
  if (!landlordProfile) return 75; // default if no profile

  let score = 100;
  const penalties: number[] = [];

  // Pets conflict
  if (pref.petsAllowed && !landlordProfile.petsAllowed) {
    penalties.push(20);
  }

  // Smoking conflict
  if (pref.smokingAllowed && !landlordProfile.smokingAllowed) {
    penalties.push(15);
  }

  // Apply penalties
  const totalPenalty = penalties.reduce((a, b) => a + b, 0);
  score = Math.max(0, score - totalPenalty);

  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MATCHING FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export function calculateMatchScore(
  pref: TenantPreference,
  property: PropertyWithDetails,
  landlordProfile: LandlordProfile | null = null,
  weights: MatchWeights = DEFAULT_WEIGHTS
): MatchScoreResult {
  // Hard filter check
  const filterReason = hardFilter(pref, property);
  if (filterReason) {
    return {
      overall: 0,
      tenantToPropertyScore: 0,
      landlordToTenantScore: 0,
      mutualScore: 0,
      locationScore: 0,
      budgetScore: 0,
      propertyTypeScore: 0,
      bedroomScore: 0,
      availabilityScore: 0,
      amenityScore: 0,
      furnishingScore: 0,
      commuteScore: 0,
      preferenceScore: 0,
      explanation: [{
        factor: "filter",
        label: "Not a Match",
        status: "conflict",
        message: filterReason,
        isPositive: false,
        score: 0,
      }],
      isFiltered: true,
      filterReason,
    };
  }

  // Calculate component scores
  const locationResult = scoreLocation(pref, property);
  const budgetResult = scoreBudget(pref, property);
  const propertyTypeResult = scorePropertyType(pref, property);
  const bedroomResult = scoreBedrooms(pref, property);
  const availabilityResult = scoreAvailability(pref, property);
  const amenityResult = scoreAmenities(pref, property);
  const furnishingResult = scoreFurnishing(pref, property);
  const commuteResult = scoreCommute(pref, property);
  const prefResult = scorePreferences(pref, property);

  // Weighted score
  const totalWeight =
    weights.location +
    weights.budget +
    weights.propertyType +
    weights.bedrooms +
    weights.availability +
    weights.amenities +
    weights.furnishing +
    weights.commute +
    weights.preference +
    weights.other;

  const tenantToPropertyScore = Math.round(
    (locationResult.score * weights.location +
      budgetResult.score * weights.budget +
      propertyTypeResult.score * weights.propertyType +
      bedroomResult.score * weights.bedrooms +
      availabilityResult.score * weights.availability +
      amenityResult.score * weights.amenities +
      furnishingResult.score * weights.furnishing +
      commuteResult.score * weights.commute +
      prefResult.score * weights.preference) /
    (totalWeight - weights.other)
  );

  // Two-way score
  const landlordToTenantScore = scoreLandlordAcceptance(pref, property, landlordProfile);

  // Mutual match: weighted average (tenant side matters more)
  const mutualScore = Math.round(tenantToPropertyScore * 0.65 + landlordToTenantScore * 0.35);

  // Collect all explanations
  const explanation: MatchExplanationItem[] = [
    locationResult.explanation,
    budgetResult.explanation,
    propertyTypeResult.explanation,
    bedroomResult.explanation,
    availabilityResult.explanation,
    amenityResult.explanation,
    furnishingResult.explanation,
    commuteResult.explanation,
    ...prefResult.explanation,
  ];

  return {
    overall: mutualScore,
    tenantToPropertyScore,
    landlordToTenantScore,
    mutualScore,
    locationScore: locationResult.score,
    budgetScore: budgetResult.score,
    propertyTypeScore: propertyTypeResult.score,
    bedroomScore: bedroomResult.score,
    availabilityScore: availabilityResult.score,
    amenityScore: amenityResult.score,
    furnishingScore: furnishingResult.score,
    commuteScore: commuteResult.score,
    preferenceScore: prefResult.score,
    explanation,
    isFiltered: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH MATCHING
// ─────────────────────────────────────────────────────────────────────────────

export interface RankedProperty {
  property: PropertyWithDetails;
  score: MatchScoreResult;
}

export function rankProperties(
  pref: TenantPreference,
  properties: PropertyWithDetails[],
  landlordProfiles: Map<string, LandlordProfile | null> = new Map(),
  weights: MatchWeights = DEFAULT_WEIGHTS
): RankedProperty[] {
  const results: RankedProperty[] = [];

  for (const property of properties) {
    const landlordProfile = landlordProfiles.get(property.ownerId) ?? null;
    const score = calculateMatchScore(pref, property, landlordProfile, weights);
    if (!score.isFiltered && score.overall >= 30) {
      results.push({ property, score });
    }
  }

  return results.sort((a, b) => b.score.overall - a.score.overall);
}

// ─────────────────────────────────────────────────────────────────────────────
// HAVERSINE DISTANCE UTILITY
// ─────────────────────────────────────────────────────────────────────────────

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
