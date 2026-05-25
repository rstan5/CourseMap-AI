"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccessResponse, AccessSummary } from "@/types/access";

export function useAccess() {
  const [access, setAccess] = useState<AccessSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/access");
      const json = (await res.json()) as AccessResponse;
      if (json.success && json.data) {
        setAccess(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { access, loading, refresh };
}
