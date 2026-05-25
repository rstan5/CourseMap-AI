"use client";

import { useCallback, useRef, useState } from "react";
import {
  FileText,
  Film,
  ImageIcon,
  Loader2,
  Presentation,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPTED =
  ".txt,.md,.pdf,.docx,.pptx,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.webm,.mp3,.m4a,.wav";

const UPLOAD_TYPES = [
  { icon: FileText, label: "Notes & docs", hint: ".txt, .md, .pdf, .docx" },
  { icon: Presentation, label: "Slides", hint: ".pptx" },
  { icon: ImageIcon, label: "Pictures", hint: ".png, .jpg, photos of boards" },
  { icon: Film, label: "Videos & audio", hint: ".mp4, .mov, .mp3 (transcribed)" },
];

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "mov", "webm", "mp3", "m4a", "wav"].includes(ext)) return Film;
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return ImageIcon;
  if (ext === "pptx") return Presentation;
  return FileText;
}

interface UploadStudioProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting?: boolean;
  generateLabel?: string;
  requiresSubscription?: boolean;
  requiresAuth?: boolean;
  onSubscribeClick?: () => void;
  onAuthClick?: () => void;
  refineMode?: boolean;
}

export function UploadStudio({
  onSubmit,
  isSubmitting = false,
  generateLabel = "Generate FREE course map",
  requiresSubscription = false,
  requiresAuth = false,
  onSubscribeClick,
  onAuthClick,
  refineMode = false,
}: UploadStudioProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const unique = list.filter((f) => !names.has(f.name));
      return [...prev, ...unique];
    });
  }, []);

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const canGenerate =
    !isSubmitting && (files.length > 0 || pastedText.trim().length >= 50);

  const handleGenerate = async () => {
    if (requiresAuth) {
      onAuthClick?.();
      return;
    }
    if (requiresSubscription) {
      onSubscribeClick?.();
      return;
    }

    const formData = new FormData();
    if (pastedText.trim()) {
      formData.append("rawText", pastedText.trim());
    }
    files.forEach((file) => formData.append("files", file));
    await onSubmit(formData);
  };

  return (
    <div className="flex flex-col gap-6">
      <DropZone
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        addFiles={addFiles}
        inputRef={inputRef}
        refineMode={refineMode}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {UPLOAD_TYPES.map((type) => (
          <div
            key={type.label}
            className="glass-soft flex flex-col items-center gap-2 rounded-2xl px-3 py-4 text-center"
          >
            <type.icon className="h-5 w-5 text-primary" />
            <span className="text-xs font-extrabold">{type.label}</span>
            <span className="text-[10px] font-semibold leading-tight text-muted-foreground">
              {type.hint}
            </span>
          </div>
        ))}
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file) => {
            const Icon = fileIcon(file.name);
            return (
              <li
                key={file.name}
                className="glass-pill flex items-center gap-3 rounded-2xl px-4 py-3"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {file.name}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.name);
                  }}
                  disabled={isSubmitting}
                  className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground disabled:opacity-50"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="glass-strong overflow-hidden rounded-3xl">
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder={
            refineMode
              ? "Paste new lecture notes, assignments, or snippets to merge into this map…"
              : "Or paste extra notes, links text, or snippets here (optional)…"
          }
          disabled={isSubmitting}
          className="min-h-[140px] w-full resize-y bg-transparent px-6 py-5 text-base font-medium leading-relaxed placeholder:text-muted-foreground/80 focus:outline-none disabled:opacity-60"
          spellCheck={false}
        />
      </div>

      <Button
        size="lg"
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            {refineMode ? "Refining your course map…" : "Building your course map…"}
          </>
        ) : (
          <>
            <Sparkles />
            {generateLabel}
          </>
        )}
      </Button>

      {!canGenerate && !isSubmitting && (
        <p className="text-sm font-semibold text-muted-foreground">
          Upload at least one file, or paste 50+ characters of course material.
        </p>
      )}
    </div>
  );
}

function DropZone({
  isDragging,
  setIsDragging,
  addFiles,
  inputRef,
  refineMode,
}: {
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  addFiles: (files: FileList | File[]) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  refineMode?: boolean;
}) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "glass-strong group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300",
        isDragging
          ? "border-primary/60 bg-primary/5"
          : "border-white/80 hover:border-primary/40"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex flex-col items-center px-6 py-14 text-center sm:py-16">
        <div className="glass-pill mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-primary transition-transform duration-300 group-hover:scale-105">
          <Upload className="h-8 w-8" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-extrabold sm:text-2xl">
          {refineMode
            ? "Add more materials to this course"
            : "Drop your class materials here"}
        </h2>
        <p className="mt-2 max-w-md text-sm font-semibold text-muted-foreground">
          {refineMode
            ? "Upload new lectures, slides, or notes — CourseMap will merge them into your existing map."
            : "Videos, slides, pictures, notes, PDFs, and more — upload everything for this course in one place."}
        </p>
        <p className="glass-pill mt-6 rounded-full px-5 py-2 text-xs font-bold text-primary">
          Click or drag files · up to 25 MB each
        </p>
      </div>
    </div>
  );
}
