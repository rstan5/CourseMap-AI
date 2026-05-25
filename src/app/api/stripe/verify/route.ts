import { NextRequest, NextResponse } from "next/server";
import { activateSubscription } from "@/lib/subscription-store";
import { getStripe } from "@/lib/stripe";
import { getAuthenticatedUser } from "@/lib/identity";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "Missing session_id." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json(
        { success: false, error: "Checkout is not complete yet." },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser();
    const userId = user?.id ?? session.client_reference_id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Sign in required." },
        { status: 401 }
      );
    }

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    activateSubscription(userId, {
      stripeCustomerId: session.customer as string | undefined,
      stripeSubscriptionId: subscriptionId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Stripe verify error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Verification failed.",
      },
      { status: 500 }
    );
  }
}
