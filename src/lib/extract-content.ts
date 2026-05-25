import mammoth from "mammoth";
import OpenAI from "openai";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "csv",
  "json",
  "rtf",
  "log",
]);

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

const AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
]);

function extension(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isTextFile(file: File): boolean {
  if (file.type.startsWith("text/")) return true;
  return TEXT_EXTENSIONS.has(extension(file.name));
}

function isImage(file: File): boolean {
  return IMAGE_TYPES.has(file.type) || ["jpg", "jpeg", "png", "webp", "gif"].includes(extension(file.name));
}

function isVideo(file: File): boolean {
  return VIDEO_TYPES.has(file.type) || ["mp4", "webm", "mov", "avi"].includes(extension(file.name));
}

function isAudio(file: File): boolean {
  return AUDIO_TYPES.has(file.type) || ["mp3", "m4a", "wav", "webm"].includes(extension(file.name));
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || extension(file.name) === "pdf";
}

function isDocx(file: File): boolean {
  return (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension(file.name) === "docx"
  );
}

function isPptx(file: File): boolean {
  return (
    file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    extension(file.name) === "pptx"
  );
}

async function extractFromImage(
  openai: OpenAI,
  buffer: Buffer,
  mime: string,
  fileName: string
): Promise<string> {
  const base64 = buffer.toString("base64");
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract all educational content from this image (${fileName}): headings, bullet points, diagrams described in words, formulas, and notes. Return plain text only, organized clearly.`,
          },
          {
            type: "image_url",
            image_url: { url: `data:${mime};base64,${base64}` },
          },
        ],
      },
    ],
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

async function transcribeMedia(
  openai: OpenAI,
  file: File,
  buffer: Buffer
): Promise<string> {
  const blob = new Blob([new Uint8Array(buffer)], { type: file.type || "application/octet-stream" });
  const uploadFile = new File([blob], file.name, { type: file.type || "application/octet-stream" });

  const transcription = await openai.audio.transcriptions.create({
    file: uploadFile,
    model: "whisper-1",
  });

  return transcription.text.trim();
}

export async function extractTextFromFile(
  file: File,
  openai: OpenAI
): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `"${file.name}" is too large. Maximum file size is 25 MB.`
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (isTextFile(file)) {
    return buffer.toString("utf-8").trim();
  }

  if (isPdf(file)) {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text.trim();
  }

  if (isDocx(file)) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (isPptx(file)) {
    const officeParser = (await import("officeparser")).default;
    const text = await officeParser.parseOfficeAsync(buffer);
    return (typeof text === "string" ? text : String(text)).trim();
  }

  if (isImage(file)) {
    const mime = file.type || "image/jpeg";
    return extractFromImage(openai, buffer, mime, file.name);
  }

  if (isVideo(file) || isAudio(file)) {
    return transcribeMedia(openai, file, buffer);
  }

  throw new Error(
    `Unsupported file type: "${file.name}". Try notes, PDF, slides, images, or video/audio.`
  );
}

export async function extractTextFromFiles(
  files: File[],
  openai: OpenAI
): Promise<string> {
  const sections: string[] = [];

  for (const file of files) {
    const text = await extractTextFromFile(file, openai);
    if (text.length > 0) {
      sections.push(`--- ${file.name} ---\n${text}`);
    }
  }

  return sections.join("\n\n");
}
