import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/landlord/dashboard(.*)",
  "/admin(.*)",
  "/onboarding(.*)",
  "/applications(.*)",
  "/messages(.*)",
  "/visits(.*)",
  "/matches(.*)",
  "/favorites(.*)",
  "/profile(.*)",
  "/settings(.*)",
]);

const isApiProtectedRoute = createRouteMatcher([
  "/api/applications(.*)",
  "/api/matches(.*)",
  "/api/favorites(.*)",
  "/api/conversations(.*)",
  "/api/visits(.*)",
  "/api/notifications(.*)",
  "/api/tenant(.*)",
  "/api/landlord(.*)",
  "/api/admin(.*)",
  "/api/upload(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) || isApiProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
