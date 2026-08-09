"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";
import { NotesWorkspace } from "@/components/notes-workspace";
import { CourseWorkspaceShell } from "@/components/course-workspace-shell";
import { GenerateHeader } from "@/components/generate-header";
import { GeneratingOverlay } from "@/components/generating-overlay";
import { MapReadyAuthGate } from "@/components/map-ready-auth-gate";
import { PricingPaywall } from "@/components/pricing-paywall";
import { UploadStudio } from "@/components/upload-studio";
import { useAccess } from "@/hooks/use-access";
import { useAuth } from "@/hooks/use-auth";
import { useCourseLibrary } from "@/hooks/use-course-library";
import { getUploadGenerateLabel } from "@/lib/generate-label";
import { friendlyApiError, parseApiResponse } from "@/lib/parse-api-response";
import type { CourseMapData, GenerateCourseResponse, GetCourseMapResponse } from "@/types/course";

type GenerateView = "upload" | "generating";

interface PendingMapPreview {
  id: string;
  title: string;
  subject: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapId = searchParams.get("mapId");

  const [view, setView] = useState<GenerateView>("upload");
  const [refining, setRefining] = useState(false);
  const [course, setCourse] = useState<CourseMapData | null>(null);
  const [pendingMap, setPendingMap] = useState<PendingMapPreview | null>(null);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const mapRef = useRef<HTMLDivElement>(null);

  const { user, loading: authLoading, refresh: refreshAuth, signOut } = useAuth();
  const { access, refresh: refreshAccess } = useAccess();
  const { maps, loading: mapsLoading, refresh: refreshLibrary } =
    useCourseLibrary(Boolean(user));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    void (async () => {
      try {
        await fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`);
        await refreshAccess();
      } finally {
        const next = mapId ? `/generate?mapId=${mapId}` : "/generate";
        window.history.replaceState({}, "", next);
      }
    })();
  }, [refreshAccess, mapId]);

  const loadCourse = useCallback(async (id: string) => {
    setLoadError("");
    try {
      const res = await fetch(`/api/get-course-map?id=${encodeURIComponent(id)}`);
      const json = await parseApiResponse<GetCourseMapResponse>(res);

      if (res.status === 401 || json.code === "AUTH_REQUIRED") {
        setCourse(null);
        return;
      }

      if (!res.ok || !json.success || !json.data) {
        setLoadError(json.error ?? "Could not load course map.");
        setCourse(null);
        return;
      }

      setCourse(json.data);
      setPendingMap(null);
    } catch (err) {
      setLoadError(
        friendlyApiError(
          err instanceof Error ? err.message : "Could not load course map."
        )
      );
    }
  }, []);

  useEffect(() => {
    if (!mapId) {
      setCourse(null);
      setLoadError("");
      if (!user) setPendingMap(null);
      return;
    }

    if (!user) return;

    void loadCourse(mapId);
  }, [mapId, user, loadCourse]);

  const openAuth = useCallback((mode: "signup" | "signin" = "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const handleAuthSuccess = useCallback(
    async () => {
      await refreshAuth();
      await refreshAccess();
      await refreshLibrary();

      const targetId = mapId ?? pendingMap?.id;
      if (targetId) {
        router.push(`/generate?mapId=${targetId}`);
        await loadCourse(targetId);
        setTimeout(() => {
          mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      }
    },
    [
      mapId,
      pendingMap,
      refreshAuth,
      refreshAccess,
      refreshLibrary,
      router,
      loadCourse,
    ]
  );

  const selectMap = useCallback(
    (id: string) => {
      router.push(`/generate?mapId=${id}`);
    },
    [router]
  );

  const startNewCourse = useCallback(() => {
    router.push("/generate");
    setCourse(null);
    setPendingMap(null);
    setError("");
  }, [router]);

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      setError("");
      const isRefine = Boolean(mapId);

      if (isRefine && !user) {
        openAuth("signup");
        return;
      }

      if (!isRefine && user && access && !access.canGenerate) {
        setPaywallOpen(true);
        return;
      }

      if (isRefine && mapId) {
        formData.append("mapId", mapId);
      }

      setRefining(isRefine);
      setView("generating");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });

        const json = await parseApiResponse<GenerateCourseResponse>(res);

        if (res.status === 401 || json.code === "AUTH_REQUIRED") {
          setView("upload");
          openAuth("signup");
          return;
        }

        if (res.status === 402 || json.code === "SUBSCRIPTION_REQUIRED") {
          await refreshAccess();
          setPaywallOpen(true);
          setView("upload");
          return;
        }

        if (!res.ok || !json.success || !json.data) {
          throw new Error(
            friendlyApiError(
              json.error ?? "Failed to generate course structure."
            )
          );
        }

        const preview: PendingMapPreview = {
          id: json.data.id,
          title: json.data.course_map_overview.title,
          subject: json.data.course_map_overview.inferred_subject,
        };

        if (json.requiresAuth && !user) {
          setPendingMap(preview);
          setCourse(null);
          setAuthOpen(true);
          setAuthMode("signup");
          router.push(`/generate?mapId=${json.data.id}`);
        } else {
          setCourse(json.data);
          setPendingMap(null);
          if (!mapId || mapId !== json.data.id) {
            router.push(`/generate?mapId=${json.data.id}`);
          }
        }

        setView("upload");
        await refreshAccess();
        if (user) await refreshLibrary();

        if (user) {
          setTimeout(() => {
            mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }
      } catch (err) {
        setError(
          friendlyApiError(
            err instanceof Error ? err.message : "Something went wrong."
          )
        );
        setView("upload");
      }
    },
    [
      access,
      mapId,
      openAuth,
      refreshAccess,
      refreshLibrary,
      router,
      user,
    ]
  );

  const generateLabel = getUploadGenerateLabel(
    access,
    Boolean(mapId),
    Boolean(user)
  );
  const activeTitle =
    course?.course_map_overview.title ??
    pendingMap?.title ??
    maps.find((m) => m.id === mapId)?.title;

  const showAuthGate =
    Boolean(mapId || pendingMap) && !user && !authLoading;
  const gatePreview =
    pendingMap ??
    (mapId
      ? {
          id: mapId,
          title: activeTitle ?? "Your course map",
          subject: "",
        }
      : null);

  if (view === "generating") {
    return (
      <div className="mesh-gradient min-h-dvh">
        <GenerateHeader
          user={user}
          onSignIn={() => openAuth("signin")}
          onSignOut={signOut}
        />
        <GeneratingOverlay refining={refining} />
      </div>
    );
  }

  return (
    <div className="mesh-gradient min-h-dvh">
      <GenerateHeader
        user={user}
        onSignIn={() => openAuth("signin")}
        onSignOut={signOut}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
      <PricingPaywall open={paywallOpen} onClose={() => setPaywallOpen(false)} />

      <CourseWorkspaceShell
        maps={maps}
        mapsLoading={mapsLoading}
        activeMapId={mapId}
        onSelectMap={selectMap}
        onNewCourse={startNewCourse}
        mobileMapTitle={activeTitle}
        isAuthenticated={Boolean(user)}
        onRequireAuth={() => openAuth("signup")}
      >
        <Hero
          access={access}
          refining={Boolean(mapId)}
          title={activeTitle}
          isAuthenticated={Boolean(user)}
        />

        {(error || loadError) && (
          <p className="glass-soft mb-6 rounded-2xl px-5 py-3.5 text-sm font-semibold text-red-500">
            {error || loadError}
          </p>
        )}

        <UploadStudio
          onSubmit={handleSubmit}
          generateLabel={generateLabel}
          refineMode={Boolean(mapId)}
          onSubscribeClick={() => setPaywallOpen(true)}
          onAuthClick={() => openAuth("signup")}
          requiresSubscription={Boolean(
            user && !mapId && access && !access.canGenerate
          )}
          requiresAuth={Boolean(
            !user && !mapId && access && !access.canGenerate
          )}
        />

        {showAuthGate && gatePreview && (
          <MapReadyAuthGate
            title={gatePreview.title}
            subject={gatePreview.subject || undefined}
            onCreateAccount={() => openAuth("signup")}
          />
        )}

        {user && course && (
          <div ref={mapRef}>
            <NotesWorkspace course={course} />
          </div>
        )}
      </CourseWorkspaceShell>
    </div>
  );
}

function Hero({
  access,
  refining,
  title,
  isAuthenticated,
}: {
  access: {
    freeMapsRemaining: number | null;
    subscriptionActive: boolean;
    isAuthenticated?: boolean;
  } | null;
  refining: boolean;
  title?: string;
  isAuthenticated: boolean;
}) {
  return (
    <div className="glass-strong mb-8 rounded-3xl px-6 py-6 text-center sm:px-8">
      {refining && title && isAuthenticated ? (
        <>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Refining course
          </p>
          <h1 className="mt-1 text-xl font-extrabold sm:text-2xl">{title}</h1>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-muted-foreground sm:text-base">
            Upload more notes below — they will be merged into your digital
            notebook and map automatically.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Upload your notes
          </h1>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-muted-foreground sm:text-base">
            {isAuthenticated
              ? "CourseMap stores your notes digitally, organizes them into a navigable map, and lets you chat with them."
              : "Upload your first notes for free — then create an account to keep them, navigate the map, and ask the assistant."}
          </p>
        </>
      )}
      {access &&
        !isAuthenticated &&
        access.freeMapsRemaining === 1 &&
        !refining && (
          <p className="glass-pill mt-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold text-primary">
            First map is free · account required to view
          </p>
        )}
      {access &&
        !isAuthenticated &&
        access.freeMapsRemaining === 0 &&
        !refining && (
          <p className="glass-pill mt-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold text-primary">
            Create an account to save your map or start another course
          </p>
        )}
      {access &&
        isAuthenticated &&
        !access.subscriptionActive &&
        access.freeMapsRemaining === 1 &&
        !refining && (
          <p className="glass-pill mt-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold text-primary">
            Your first course map is free
          </p>
        )}
    </div>
  );
}
