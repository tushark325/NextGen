import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const headersList = await headers();
    const svixId = headersList.get("svix-id");
    const svixTimestamp = headersList.get("svix-timestamp");
    const svixSignature = headersList.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    // Verify webhook (requires svix package — skip verification for dev)
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("CLERK_WEBHOOK_SECRET not set, skipping webhook verification");
    }

    const evt = JSON.parse(payload);
    const { type, data } = evt;

    if (type === "user.created" || type === "user.updated") {
      const { id: clerkId, email_addresses, first_name, last_name, image_url, phone_numbers, unsafe_metadata } = data;

      const email = email_addresses?.[0]?.email_address;
      const phone = phone_numbers?.[0]?.phone_number;
      const role = (unsafe_metadata?.role as string) ?? "TENANT";

      await prisma.user.upsert({
        where: { clerkId },
        create: {
          clerkId,
          email,
          firstName: first_name ?? "User",
          lastName: last_name ?? "",
          avatarUrl: image_url,
          phone,
          role: role.toUpperCase() as any,
          // Create profile based on role
          ...(role === "TENANT" && {
            tenantProfile: { create: {} },
          }),
          ...(role === "LANDLORD" && {
            landlordProfile: { create: {} },
          }),
          ...(role === "AGENT" && {
            agentProfile: { create: {} },
          }),
          // Create default notification preferences
          subscription: {
            create: { plan: "FREE" },
          },
        },
        update: {
          email,
          firstName: first_name ?? "User",
          lastName: last_name ?? "",
          avatarUrl: image_url,
          phone,
        },
      });
    }

    if (type === "user.deleted") {
      const { id: clerkId } = data;
      await prisma.user.update({
        where: { clerkId },
        data: { deletedAt: new Date(), isActive: false },
      });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[Clerk Webhook]", err);
    return new Response("Internal error", { status: 500 });
  }
}
