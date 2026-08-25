/**
 * NextGen — Shared TypeScript Types
 */

import type { User, TenantProfile, LandlordProfile, Property, PropertyImage, PropertyAmenity, PropertyAvailability, Application, Conversation, Message, Notification, Review } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// RE-EXPORTS FROM PRISMA
// ─────────────────────────────────────────────────────────────────────────────

export type { User, TenantProfile, LandlordProfile, Property, PropertyImage, PropertyAmenity, PropertyAvailability, Application, Conversation, Message, Notification, Review };

// ─────────────────────────────────────────────────────────────────────────────
// EXTENDED TYPES (with relations)
// ─────────────────────────────────────────────────────────────────────────────

export type PropertyWithDetails = Property & {
  images: PropertyImage[];
  amenities: PropertyAmenity[];
  availability: PropertyAvailability | null;
  owner: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl"> & {
    landlordProfile: Pick<LandlordProfile, "rating" | "ratingCount" | "identityVerified" | "responseRate" | "totalRentals"> | null;
  };
  _count?: {
    favorites: number;
    applications: number;
    reviews: number;
  };
};

export type PropertyCard = {
  id: string;
  title: string;
  propertyType: string;
  city: string;
  locality: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  estimatedTotal: number | null;
  deposit: number;
  furnishing: string;
  hasParking: boolean;
  status: string;
  coverImage: string | null;
  isVerified: boolean;
  petsAllowed: boolean;
  owner: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  matchScore?: number;
  matchExplanation?: MatchExplanationItem[];
};

export type MatchExplanationItem = {
  factor: string;
  label: string;
  status: "excellent" | "good" | "partial" | "missing" | "conflict";
  message: string;
  isPositive: boolean;
  score: number;
};

export type MatchScoreSummary = {
  overall: number;
  tenantToPropertyScore: number;
  landlordToTenantScore: number;
  locationScore: number;
  budgetScore: number;
  propertyTypeScore: number;
  bedroomScore: number;
  availabilityScore: number;
  amenityScore: number;
  furnishingScore: number;
  explanation: MatchExplanationItem[];
};

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ApiSuccess<T = unknown> = {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH & FILTER TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type PropertySearchFilters = {
  city?: string;
  locality?: string;
  minRent?: number;
  maxRent?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  propertyType?: string[];
  furnishing?: string[];
  hasParking?: boolean;
  petsAllowed?: boolean;
  isVerified?: boolean;
  availableFrom?: string;
  amenities?: string[];
  sortBy?: "best_match" | "lowest_rent" | "highest_rent" | "newest" | "most_viewed";
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// FORM TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type TenantOnboardingData = {
  // Step 1: About
  occupation: string;
  company?: string;
  jobTitle?: string;
  monthlyIncome?: number;
  employmentType: string;
  // Step 2: Location
  preferredCities: string[];
  preferredLocalities: string[];
  workLocation?: string;
  // Step 3: Budget
  maxRent: number;
  preferredRent?: number;
  maxDeposit?: number;
  // Step 4: Property
  propertyTypes: string[];
  minBedrooms?: number;
  maxBedrooms?: number;
  furnishing: string[];
  // Step 5: Lifestyle
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  parkingRequired?: boolean;
  workFromHome?: boolean;
  quietEnvironment?: boolean;
  // Step 6: Move-in
  moveInDate?: Date;
  minStayMonths?: number;
  // Step 7: Required amenities
  requiredAmenities: string[];
};

export type PropertyListingData = {
  // Step 1: Basic
  title: string;
  propertyType: string;
  description: string;
  // Step 2: Location
  state: string;
  city: string;
  locality: string;
  address: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  // Step 3: Details
  bedrooms: number;
  bathrooms: number;
  balconies?: number;
  carpetArea?: number;
  builtUpArea?: number;
  floor?: number;
  totalFloors?: number;
  facing?: string;
  propertyAge?: number;
  hasParking: boolean;
  hasLift: boolean;
  hasPowerBackup: boolean;
  // Step 4: Pricing
  rent: number;
  deposit: number;
  maintenance?: number;
  brokerage?: number;
  electricityRule?: string;
  // Step 5: Furnishing
  furnishing: string;
  furnitureItems: string[];
  // Step 6: Amenities
  amenities: string[];
  // Step 7: Rules
  petsAllowed: boolean;
  smokingAllowed: boolean;
  guestsAllowed: boolean;
  vegetarianOnly: boolean;
  customRules: string[];
  // Step 8: Tenant Preferences
  preferredGender?: string;
  preferredOccupation?: string;
  maxOccupants?: number;
  // Step 9: Availability
  availabilityStatus: string;
  availableFrom?: Date;
  noticePeriodDays?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type TenantDashboardStats = {
  matchScore: number;
  recommendedCount: number;
  savedCount: number;
  applicationCount: number;
  upcomingVisits: number;
  unreadMessages: number;
};

export type LandlordDashboardStats = {
  activeProperties: number;
  totalApplications: number;
  shortlistedCount: number;
  upcomingVisits: number;
  unreadMessages: number;
  expectedMonthlyRent: number;
  receivedThisMonth: number;
};

export type AdminDashboardStats = {
  totalUsers: number;
  newUsersToday: number;
  activeListings: number;
  pendingVerifications: number;
  openReports: number;
  totalApplications: number;
  successfulRentals: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationData = {
  propertyId?: string;
  applicationId?: string;
  conversationId?: string;
  visitId?: string;
  userId?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const INDIAN_CITIES = [
  "Mumbai", "Pune", "Bangalore", "Hyderabad", "Chennai",
  "Delhi", "Noida", "Gurgaon", "Kolkata", "Ahmedabad",
  "Surat", "Jaipur", "Lucknow", "Kochi", "Chandigarh",
] as const;

export const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "FLAT", label: "Flat" },
  { value: "HOUSE", label: "House" },
  { value: "VILLA", label: "Villa" },
  { value: "STUDIO", label: "Studio" },
  { value: "ROOM", label: "Room" },
  { value: "PG", label: "PG / Paying Guest" },
  { value: "SHARED", label: "Shared Accommodation" },
  { value: "CO_LIVING", label: "Co-Living" },
  { value: "INDEPENDENT_HOUSE", label: "Independent House" },
] as const;

export const FURNISHING_TYPES = [
  { value: "FULLY_FURNISHED", label: "Fully Furnished" },
  { value: "SEMI_FURNISHED", label: "Semi Furnished" },
  { value: "UNFURNISHED", label: "Unfurnished" },
] as const;

export const COMMON_AMENITIES = [
  "Gym", "Swimming Pool", "Security", "CCTV", "Clubhouse",
  "Garden", "Children's Play Area", "Parking", "Internet / WiFi",
  "Power Backup", "Lift", "24/7 Water Supply", "Security Guard",
  "Visitor Parking", "Rainwater Harvesting",
] as const;

export const AMENITIES_LIST = COMMON_AMENITIES;
export type PropertyCardData = any;

export const FURNITURE_ITEMS = [
  "Bed", "Sofa", "Dining Table", "Wardrobe", "Refrigerator",
  "Washing Machine", "AC", "TV", "Geyser", "Microwave",
  "Kitchen Appliances", "Study Table", "Curtains",
] as const;

export const APPLICATION_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "gray" },
  { value: "SUBMITTED", label: "Submitted", color: "blue" },
  { value: "VIEWED", label: "Viewed", color: "blue" },
  { value: "SHORTLISTED", label: "Shortlisted", color: "purple" },
  { value: "VISIT_SCHEDULED", label: "Visit Scheduled", color: "indigo" },
  { value: "DOCUMENTS_REQUESTED", label: "Documents Requested", color: "orange" },
  { value: "UNDER_REVIEW", label: "Under Review", color: "yellow" },
  { value: "APPROVED", label: "Approved", color: "green" },
  { value: "REJECTED", label: "Rejected", color: "red" },
  { value: "WITHDRAWN", label: "Withdrawn", color: "gray" },
  { value: "AGREEMENT_PENDING", label: "Agreement Pending", color: "purple" },
  { value: "RENTED", label: "Rented", color: "green" },
] as const;

export const MATCH_COLORS = {
  excellent: { bg: "bg-success-50", text: "text-success-700", border: "border-success-500", label: "Excellent Match" },
  good:      { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-500",   label: "Good Match" },
  partial:   { bg: "bg-warning-50", text: "text-warning-700", border: "border-warning-500", label: "Partial Match" },
  low:       { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-500",     label: "Low Match" },
} as const;

export function getMatchCategory(score: number): keyof typeof MATCH_COLORS {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "partial";
  return "low";
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatFullCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
