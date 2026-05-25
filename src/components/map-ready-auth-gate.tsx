"use client";

import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapReadyAuthGateProps {
  title: string;
  subject?: string;
  onCreateAccount: () => void;
}

export function MapReadyAuthGate({
  title,
  subject,
  onCreateAccount,
}: MapReadyAuthGateProps) {
  return (
    <section className="mt-12">
      <div className="glass-strong relative overflow-hidden rounded-3xl px-6 py-10 text-center sm:px-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative">
          <span className="glass-pill mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Your course map is ready
          </span>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
          {subject && (
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {subject}
            </p>
          )}
          <p className="mx-auto mt-4 max-w-md text-sm font-semibold leading-relaxed text-muted-foreground">
            Create a free account to view your interactive map, save this
            course, and upload more materials to refine it.
          </p>
          <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-6">
            <Lock className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold text-muted-foreground">
              Map preview locked until you sign up
            </span>
          </div>
          <Button
            size="lg"
            className="mt-8"
            onClick={onCreateAccount}
          >
            Create account to view
          </Button>
        </div>
      </div>
    </section>
  );
}
