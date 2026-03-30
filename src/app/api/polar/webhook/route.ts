import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, webhookEvents } from "@/lib/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();

  let payload: ReturnType<typeof validateEvent>;

  try {
    payload = validateEvent(
      body,
      Object.fromEntries(request.headers.entries()),
      process.env.POLAR_WEBHOOK_SECRET!
    );
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }
    throw err;
  }

  // Handle successful checkout
  if (payload.type === "checkout.updated" && payload.data.status === "confirmed") {
    const checkoutId = payload.data.id;
    const userId = payload.data.metadata?.userId as string | undefined;
    const packSize = parseInt((payload.data.metadata?.packSize as string) ?? "0", 10);

    if (!userId || !packSize) {
      console.error("Missing userId or packSize in Polar webhook metadata:", payload.data.metadata);
      return Response.json({ received: true }, { status: 200 });
    }

    try {
      await db.transaction(async (tx) => {
        // Idempotency check
        const existing = await tx
          .select()
          .from(webhookEvents)
          .where(eq(webhookEvents.id, checkoutId))
          .limit(1);

        if (existing.length > 0) {
          return; // already processed
        }

        // Record webhook event
        await tx.insert(webhookEvents).values({
          id: checkoutId,
          type: "checkout.updated",
          payload: body,
        });

        // Atomic credit increment
        await tx
          .update(user)
          .set({ credits: sql`${user.credits} + ${packSize}` })
          .where(eq(user.id, userId));
      });
    } catch (error) {
      console.error("Error processing Polar webhook:", error);
      throw error;
    }
  }

  return Response.json({ received: true }, { status: 200 });
}
