"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthUser, SessionResponse } from "@/types/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const json = (await res.json()) as SessionResponse;
      setUser(json.user ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
  }, []);

  return { user, loading, refresh, signOut, isAuthenticated: Boolean(user) };
}
