"use client";

import { Brain, Layers, Network } from "lucide-react";

const steps = [
  { icon: Brain, label: "Reading your notes" },
  { icon: Layers, label: "Keeping every detail" },
  { icon: Network, label: "Building your note map" },
];

interface GeneratingOverlayProps {
  refining?: boolean;
}

export function GeneratingOverlay({ refining = false }: GeneratingOverlayProps) {
  return (
    <div className="animate-fade-in flex min-h-[60vh] flex-col items-center justify-center gap-10 px-6">
      <div className="relative animate-float-gentle">
        <div className="glass-strong h-24 w-24 rounded-3xl shimmer" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-pill h-12 w-12 rounded-2xl animate-pulse-soft" />
        </div>
      </div>

      <div className="glass-strong max-w-lg rounded-3xl px-8 py-6 text-center">
        <h2 className="text-2xl font-extrabold text-foreground">
          {refining ? "Merging new notes into your map" : "Digitizing your notes"}
        </h2>
        <p className="mt-3 font-medium text-muted-foreground">
          {refining
            ? "AI is adding your new notes into the existing notebook and updating the map — without dropping what you already stored."
            : "AI is storing your notes digitally and organizing them into a map you can navigate and chat with."}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        {steps.map((step, i) => (
          <div
            key={step.label}
            className="glass-pill flex items-center gap-3 rounded-2xl px-5 py-3 opacity-0 animate-fade-in-up"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationFillMode: "forwards",
            }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <step.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-muted-foreground">
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
