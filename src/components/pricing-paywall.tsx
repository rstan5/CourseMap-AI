"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN, PLAN_FEATURES } from "@/constants/plan";
import { friendlyApiError } from "@/lib/parse-api-response";
import { cn } from "@/lib/utils";

interface PricingPaywallProps {
  open: boolean;
  onClose: () => void;
}

export function PricingPaywall({ open, onClose }: PricingPaywallProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubscribe = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = (await res.json()) as { success?: boolean; url?: string; error?: string };

      if (!res.ok || !json.success || !json.url) {
        throw new Error(json.error ?? "Could not start checkout.");
      }

      window.location.href = json.url;
    } catch (err) {
      setError(
        friendlyApiError(
          err instanceof Error ? err.message : "Checkout failed."
        )
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close pricing"
      />

      <div
        className={cn(
          "glass-strong relative z-10 w-full max-w-lg overflow-hidden rounded-3xl",
          "animate-fade-in-up shadow-2xl"
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pb-8 pt-10 sm:px-8">
          <div className="mb-2 flex justify-center">
            <span className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              CourseMap Pro
            </span>
          </div>

          <h2
            id="pricing-title"
            className="text-center text-2xl font-extrabold sm:text-3xl"
          >
            Unlock unlimited course maps
          </h2>
          <p className="mt-3 text-center text-sm font-semibold leading-relaxed text-muted-foreground">
            You&apos;ve used your free map. Subscribe for unlimited access to
            everything CourseMap offers.
          </p>

          <div className="mt-8 text-center">
            <p className="text-4xl font-extrabold tracking-tight">
              ${PLAN.price}
              <span className="text-lg font-bold text-muted-foreground">
                /{PLAN.interval}
              </span>
            </p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {PLAN.description}
            </p>
          </div>

          <ul className="mt-8 space-y-3">
            {PLAN_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm font-semibold"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          {error && (
            <p className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <Button
            size="lg"
            className="mt-8 w-full"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Redirecting to checkout…
              </>
            ) : (
              <>Subscribe for ${PLAN.price}/month</>
            )}
          </Button>

          <p className="mt-4 text-center text-[11px] font-medium text-muted-foreground">
            Cancel anytime. Secure payment via Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
