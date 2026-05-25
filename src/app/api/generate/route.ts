import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  getCourseMapForUser,
  storedToClientData,
  updateCourseMapForUser,
} from "@/lib/course-library-store";
import { saveCourseMap } from "@/lib/course-map-store";
import { extractTextFromFiles } from "@/lib/extract-content";
import { generateCourseStructure } from "@/lib/generate-course";
import { friendlyApiError } from "@/lib/parse-api-response";
import { refineCourseStructure } from "@/lib/refine-course";
import {
  canUserGenerate,
  getUserAccess,
  markFreeMapUsed,
} from "@/lib/subscription-store";
import { getAnonymousId, getAuthenticatedUser } from "@/lib/identity";
import type { GenerateCourseRequest } from "@/types/course";

export const runtime = "nodejs";
export const maxDuration = 120;

const MIN_TEXT_LENGTH = 50;
const MAX_TEXT_LENGTH = 120000;

interface GenerateInput {
  rawText: string;
  mapId: string | null;
}

async function resolveGenerateInput(
  request: NextRequest,
  openai: OpenAI
): Promise<GenerateInput> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const pasted = (formData.get("rawText") as string | null)?.trim() ?? "";
    const mapId = (formData.get("mapId") as string | null)?.trim() || null;
    const fileEntries = formData.getAll("files");
    const files = fileEntries.filter((f): f is File => f instanceof File);

    const extracted =
      files.length > 0 ? await extractTextFromFiles(files, openai) : "";

    const combined = [pasted, extracted].filter(Boolean).join("\n\n").trim();
    return { rawText: combined, mapId };
  }

  const body = (await request.json()) as GenerateCourseRequest & {
    mapId?: string;
  };
  return {
    rawText: body.rawText?.trim() ?? "",
    mapId: body.mapId?.trim() || null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key is not configured." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const { rawText, mapId } = await resolveGenerateInput(request, openai);
    const authUser = await getAuthenticatedUser();
    const anonymousId = await getAnonymousId();

    if (!rawText || rawText.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Please add enough material to analyze (at least ${MIN_TEXT_LENGTH} characters from uploads or pasted text).`,
        },
        { status: 400 }
      );
    }

    if (rawText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Combined content is too long. Please limit to ${MAX_TEXT_LENGTH.toLocaleString()} characters.`,
        },
        { status: 400 }
      );
    }

    const isRefine = Boolean(mapId);

    if (isRefine) {
      if (!authUser) {
        return NextResponse.json(
          {
            success: false,
            error: "Sign in to refine your course map.",
            code: "AUTH_REQUIRED",
          },
          { status: 401 }
        );
      }

      const existing = await getCourseMapForUser(authUser.id, mapId!);
      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Course map not found." },
          { status: 404 }
        );
      }

      const existingPayload = {
        course_map_overview: existing.course_map_overview,
        concept_map: existing.concept_map,
        learning_sequence: existing.learning_sequence,
        high_level_dependencies: existing.high_level_dependencies,
        missing_or_unclear_areas: existing.missing_or_unclear_areas,
      };

      const payload = await refineCourseStructure(
        openai,
        existingPayload,
        rawText
      );
      const updated = await updateCourseMapForUser(
        authUser.id,
        mapId!,
        payload,
        rawText
      );
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Could not update course map." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: storedToClientData(updated),
        refined: true,
      });
    }

    // New course map
    if (!authUser) {
      if (!canUserGenerate(anonymousId)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Create an account to generate another course map, or subscribe for unlimited maps.",
            code: "AUTH_REQUIRED",
          },
          { status: 401 }
        );
      }

      const generated = await generateCourseStructure(openai, rawText);
      const data = await saveCourseMap(anonymousId, generated, rawText);
      markFreeMapUsed(anonymousId);

      return NextResponse.json({
        success: true,
        data,
        refined: false,
        requiresAuth: true,
      });
    }

    if (!canUserGenerate(authUser.id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Subscribe to generate more course maps.",
          code: "SUBSCRIPTION_REQUIRED",
        },
        { status: 402 }
      );
    }

    const accessBefore = getUserAccess(authUser.id);
    const generated = await generateCourseStructure(openai, rawText);
    const data = await saveCourseMap(authUser.id, generated, rawText);

    if (!accessBefore.subscriptionActive) {
      markFreeMapUsed(authUser.id);
    }

    return NextResponse.json({ success: true, data, refined: false });
  } catch (error) {
    console.error("Generate course error:", error);
    const message = friendlyApiError(
      error instanceof Error ? error.message : "Something went wrong."
    );
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
