import { NextResponse } from "next/server";
import { getAppUrl, getStripe, getStripePriceId } from "@/lib/stripe";
import { getAuthenticatedUser } from "@/lib/identity";

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sign in to subscribe." },
        { status: 401 }
      );
    }

    const stripe = getStripe();
    const priceId = getStripePriceId();
    const userId = user.id;
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/generate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/generate?checkout=cancelled`,
      client_reference_id: userId,
      allow_promotion_codes: true,
      metadata: { user_id: userId },
      subscription_data: {
        metadata: { user_id: userId },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { success: false, error: "Could not start checkout." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
