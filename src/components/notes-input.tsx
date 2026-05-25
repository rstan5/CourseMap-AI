"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  id?: string;
}

export function NotesInput({
  value,
  onChange,
  onGenerate,
  isLoading = false,
  error,
  className,
  id = "notes-input",
}: NotesInputProps) {
  const charCount = value.length;
  const canGenerate = charCount >= 50 && !isLoading;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="glass-strong group relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-[0_16px_48px_rgba(139,156,248,0.15)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#e8eeff]/30" />
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your messy notes, lecture slides, readings, or study materials here…"
          disabled={isLoading}
          className="relative min-h-[220px] w-full resize-y bg-transparent px-7 py-6 text-base font-medium leading-relaxed text-foreground placeholder:text-muted-foreground/80 focus:outline-none disabled:opacity-60 md:min-h-[280px]"
          spellCheck={false}
        />
        <div className="glass-soft relative flex items-center justify-between border-t border-white/60 px-6 py-3.5">
          <span
            className={cn(
              "text-xs font-semibold text-muted-foreground transition-colors",
              charCount > 0 && charCount < 50 && "text-amber-500"
            )}
          >
            {charCount < 50
              ? `${50 - charCount} more characters needed`
              : `${charCount.toLocaleString()} characters`}
          </span>
        </div>
      </div>

      {error && (
        <p className="glass-soft animate-fade-in rounded-2xl px-5 py-3.5 text-sm font-semibold text-red-500">
          {error}
        </p>
      )}

      <Button
        size="lg"
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Structuring your course…
          </>
        ) : (
          <>
            <Sparkles />
            Generate FREE course map
          </>
        )}
      </Button>
    </div>
  );
}
