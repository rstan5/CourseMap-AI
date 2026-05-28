import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  activateSubscription,
  deactivateSubscription,
  findUserIdBySubscriptionId,
} from "@/lib/subscription-store";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature error:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.client_reference_id ?? session.metadata?.user_id ?? null;
        if (!userId) break;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        await activateSubscription(userId, {
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id,
          stripeSubscriptionId: subscriptionId ?? undefined,
        });
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId =
          subscription.metadata.user_id ??
          (await findUserIdBySubscriptionId(subscription.id));
        if (!userId) break;

        if (
          subscription.status === "active" ||
          subscription.status === "trialing"
        ) {
          await activateSubscription(userId, {
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
          });
        } else {
          await deactivateSubscription(userId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId =
          subscription.metadata.user_id ??
          (await findUserIdBySubscriptionId(subscription.id));
        if (userId) await deactivateSubscription(userId);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
