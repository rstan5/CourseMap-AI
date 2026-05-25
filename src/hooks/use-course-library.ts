"use client";

import { useCallback, useEffect, useState } from "react";
import type { CourseMapsListResponse, CourseMapSummary } from "@/types/course-library";

export function useCourseLibrary(enabled: boolean) {
  const [maps, setMaps] = useState<CourseMapSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setMaps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/course-maps");
      const json = (await res.json()) as CourseMapsListResponse;
      if (json.success && json.data) {
        setMaps(json.data);
      } else {
        setMaps([]);
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { maps, loading, refresh };
}
