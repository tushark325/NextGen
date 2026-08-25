import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  role: z.enum(["TENANT", "LANDLORD", "AGENT"], {
    required_error: "Please select how you want to use NextGen",
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// TENANT PREFERENCE
// ─────────────────────────────────────────────────────────────────────────────

export const tenantPreferenceSchema = z.object({
  preferredCities: z.array(z.string()).min(1, "Select at least one city"),
  preferredLocalities: z.array(z.string()).optional().default([]),
  maxRent: z.number().min(1000, "Minimum rent is ₹1,000").max(10000000),
  preferredRent: z.number().optional(),
  maxDeposit: z.number().optional(),
  maxMonthlyTotal: z.number().optional(),
  propertyTypes: z.array(z.string()).optional().default([]),
  minBedrooms: z.number().min(0).max(10).optional(),
  maxBedrooms: z.number().min(0).max(10).optional(),
  furnishing: z.array(z.string()).optional().default([]),
  moveInDate: z.coerce.date().optional(),
  minStayMonths: z.number().min(1).max(120).optional(),
  maxStayMonths: z.number().min(1).max(120).optional(),
  petsAllowed: z.boolean().optional(),
  smokingAllowed: z.boolean().optional(),
  parkingRequired: z.boolean().optional(),
  workFromHome: z.boolean().optional(),
  quietEnvironment: z.boolean().optional(),
  requiredAmenities: z.array(z.string()).optional().default([]),
  workCity: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTY
// ─────────────────────────────────────────────────────────────────────────────

export const propertyBasicSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  propertyType: z.enum([
    "APARTMENT", "FLAT", "HOUSE", "VILLA", "STUDIO",
    "ROOM", "PG", "SHARED", "CO_LIVING", "INDEPENDENT_HOUSE", "OTHER"
  ]),
  description: z.string().min(50, "Description must be at least 50 characters").max(2000),
});

export const propertyLocationSchema = z.object({
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  address: z.string().min(5, "Address is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode").optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  nearbyLandmarks: z.array(z.string()).optional().default([]),
});

export const propertyDetailsSchema = z.object({
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(1).max(20),
  balconies: z.number().min(0).max(10).optional().default(0),
  carpetArea: z.number().min(50).max(100000).optional(),
  builtUpArea: z.number().min(50).max(100000).optional(),
  floor: z.number().min(0).max(200).optional(),
  totalFloors: z.number().min(1).max(200).optional(),
  facing: z.enum(["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"]).optional(),
  propertyAge: z.number().min(0).max(100).optional(),
  hasParking: z.boolean().default(false),
  parkingType: z.enum(["covered", "open", "none"]).optional(),
  hasLift: z.boolean().default(false),
  hasPowerBackup: z.boolean().default(false),
});

export const propertyPricingSchema = z.object({
  rent: z.number().min(1000, "Minimum rent is ₹1,000"),
  deposit: z.number().min(0),
  maintenance: z.number().min(0).optional(),
  brokerage: z.number().min(0).optional().default(0),
  electricityRule: z.enum(["included", "metered", "fixed"]).optional(),
  waterCharges: z.number().min(0).optional(),
  parkingCharges: z.number().min(0).optional(),
  otherCharges: z.number().min(0).optional(),
});

export const propertyFurnishingSchema = z.object({
  furnishing: z.enum(["FULLY_FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]),
  furnitureItems: z.array(z.string()).optional().default([]),
});

export const propertyRulesSchema = z.object({
  petsAllowed: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),
  guestsAllowed: z.boolean().default(true),
  partyAllowed: z.boolean().default(false),
  vegetarianOnly: z.boolean().default(false),
  customRules: z.array(z.string()).optional().default([]),
});

export const propertyTenantPreferenceSchema = z.object({
  preferredGender: z.enum(["any", "male", "female", "family"]).optional(),
  preferredOccupation: z.string().optional(),
  preferFamilies: z.boolean().default(false),
  preferBachelors: z.boolean().default(false),
  maxOccupants: z.number().min(1).max(20).optional(),
});

export const propertyAvailabilitySchema = z.object({
  status: z.enum(["AVAILABLE_NOW", "AVAILABLE_FROM", "OCCUPIED", "NOTICE_PERIOD"]),
  availableFrom: z.coerce.date().optional(),
  expectedVacancy: z.coerce.date().optional(),
  noticePeriodDays: z.number().min(0).max(365).optional(),
  minimumStay: z.number().min(1).max(120).optional(),
  maximumStay: z.number().min(1).max(120).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATION
// ─────────────────────────────────────────────────────────────────────────────

export const applicationSchema = z.object({
  propertyId: z.string().cuid(),
  moveInDate: z.coerce.date({ required_error: "Move-in date is required" }),
  occupants: z.number().min(1).max(20).default(1),
  message: z.string().min(20, "Please write at least 20 characters").max(1000),
  employmentInfo: z.string().max(500).optional(),
  incomeRange: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// VISIT
// ─────────────────────────────────────────────────────────────────────────────

export const visitSchema = z.object({
  propertyId: z.string().cuid(),
  scheduledAt: z.coerce.date({ required_error: "Please select a date and time" }),
  visitType: z.enum(["IN_PERSON", "VIDEO_TOUR"]).default("IN_PERSON"),
  durationMinutes: z.number().min(15).max(120).default(30),
  notes: z.string().max(500).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE
// ─────────────────────────────────────────────────────────────────────────────

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000),
  messageType: z.enum(["text", "image", "document"]).default("text"),
});

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  subjectId: z.string().cuid(),
  propertyId: z.string().cuid().optional(),
  overallRating: z.number().min(1).max(5),
  communicationRating: z.number().min(1).max(5).optional(),
  accuracyRating: z.number().min(1).max(5).optional(),
  responsivenessRating: z.number().min(1).max(5).optional(),
  comment: z.string().min(10, "Please write at least 10 characters").max(500).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// REPORT
// ─────────────────────────────────────────────────────────────────────────────

export const reportSchema = z.object({
  reportedPropertyId: z.string().cuid().optional(),
  reportedUserId: z.string().cuid().optional(),
  reason: z.enum(["FAKE_LISTING", "WRONG_INFORMATION", "SCAM", "INAPPROPRIATE", "DUPLICATE", "OTHER"]),
  description: z.string().min(20, "Please provide more detail").max(1000),
});

export type TenantPreferenceInput = z.infer<typeof tenantPreferenceSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type VisitInput = z.infer<typeof visitSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
