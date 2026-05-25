"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { friendlyApiError, parseApiResponse } from "@/lib/parse-api-response";
import type { CourseMapData, GetCourseMapResponse } from "@/types/course";

const CourseGraph = dynamic(
  () => import("@/components/CourseGraph").then((m) => m.CourseGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
);

function CourseMapContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { user, loading: authLoading, refresh: refreshAuth } = useAuth();
  const [course, setCourse] = useState<CourseMapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const fetchMap = useCallback(async (mapId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/get-course-map?id=${encodeURIComponent(mapId)}`);
      const json = await parseApiResponse<GetCourseMapResponse>(res);

      if (res.status === 401 || json.code === "AUTH_REQUIRED") {
        setAuthOpen(true);
        setCourse(null);
        return;
      }

      if (!res.ok || !json.success || !json.data) {
        throw new Error(
          friendlyApiError(json.error ?? "Failed to load course map.")
        );
      }

      setCourse(json.data);
    } catch (err) {
      setError(
        friendlyApiError(
          err instanceof Error ? err.message : "Something went wrong."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError("No course map id provided.");
      setLoading(false);
      return;
    }
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setAuthOpen(true);
      return;
    }
    void fetchMap(id);
  }, [id, user, authLoading, fetchMap]);

  const onAuthSuccess = async () => {
    await refreshAuth();
    setAuthOpen(false);
    if (id) await fetchMap(id);
  };

  return (
    <div className="mesh-gradient flex h-dvh flex-col">
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={onAuthSuccess}
        title="Sign in to view your map"
        description="Create an account or sign in to open this course map."
      />

      <header className="glass-strong z-30 shrink-0 border-b border-white/60">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo href="/" />
          <div className="min-w-0 flex-1 text-center">
            {course && (
              <>
                <h1 className="truncate text-base font-extrabold sm:text-lg">
                  {course.course_map_overview.title}
                </h1>
                <p className="hidden truncate text-xs font-medium text-muted-foreground sm:block">
                  {course.course_map_overview.inferred_subject} ·{" "}
                  {course.course_map_overview.structure_confidence} confidence
                </p>
              </>
            )}
          </div>
          <Link
            href={id ? `/generate?mapId=${id}` : "/generate"}
            className="glass-pill flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Add materials</span>
          </Link>
        </div>
      </header>

      <main className="relative min-h-0 flex-1">
        {(loading || authLoading) && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && !loading && !authLoading && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="glass-soft max-w-md rounded-2xl px-6 py-4 text-sm font-semibold text-red-500">
              {error}
            </p>
            <Link
              href="/generate"
              className="glass-button inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-bold text-primary-foreground"
            >
              Generate FREE course map
            </Link>
          </div>
        )}

        {course && !loading && !error && user && (
          <CourseGraph
            conceptMap={course.concept_map}
            height="h-full"
            className="h-full rounded-none"
          />
        )}
      </main>
    </div>
  );
}

export default function CourseMapPage() {
  return (
    <Suspense
      fallback={
        <div className="mesh-gradient flex h-dvh items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CourseMapContent />
    </Suspense>
  );
}
