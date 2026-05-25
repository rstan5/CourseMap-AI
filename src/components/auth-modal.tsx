"use client";

import { useState } from "react";
import { Loader2, Lock, Mail, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";

type AuthMode = "signup" | "signin";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  initialMode?: AuthMode;
  title?: string;
  description?: string;
}

export function AuthModal({
  open,
  onClose,
  onSuccess,
  initialMode = "signup",
  title = "Create your account",
  description = "Sign up to view your course map, save your courses, and keep refining them with new uploads.",
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/signin";
      const body =
        mode === "signup"
          ? { email, password, name }
          : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as {
        success?: boolean;
        user?: AuthUser;
        error?: string;
      };

      if (!res.ok || !json.success || !json.user) {
        throw new Error(json.error ?? "Authentication failed.");
      }

      onSuccess(json.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="glass-strong relative z-10 w-full max-w-md rounded-3xl p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-muted-foreground hover:bg-white/60"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="pr-8 text-2xl font-extrabold">{title}</h2>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 flex rounded-2xl bg-white/40 p-1">
          {(["signup", "signin"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setMode(tab);
                setError("");
              }}
              className={cn(
                "flex-1 rounded-xl py-2 text-sm font-bold transition-colors",
                mode === tab
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {tab === "signup" ? "Sign up" : "Sign in"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-soft w-full rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-soft w-full rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="you@school.edu"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Password
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-soft w-full rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                {mode === "signup" ? "Creating account…" : "Signing in…"}
              </>
            ) : mode === "signup" ? (
              "Create account & view map"
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
