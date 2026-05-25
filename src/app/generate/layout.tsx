import { Suspense } from "react";

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="mesh-gradient flex min-h-dvh items-center justify-center">
          <p className="text-sm font-semibold text-muted-foreground">
            Loading workspace…
          </p>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
