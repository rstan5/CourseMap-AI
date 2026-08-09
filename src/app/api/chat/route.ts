import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getCourseMapForUser, storedToClientData } from "@/lib/course-library-store";
import {
  buildNotesAssistantUserPrompt,
  NOTES_ASSISTANT_SYSTEM_PROMPT,
} from "@/lib/chat-prompts";
import { getAuthenticatedUser } from "@/lib/identity";
import { friendlyApiError } from "@/lib/parse-api-response";
import type { NotesChatRequest, NotesChatResponse } from "@/types/course";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key is not configured." } satisfies NotesChatResponse,
        { status: 500 }
      );
    }

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Sign in to chat with your notes.",
          code: "AUTH_REQUIRED",
        } satisfies NotesChatResponse,
        { status: 401 }
      );
    }

    const body = (await request.json()) as NotesChatRequest;
    const mapId = body.mapId?.trim();
    const message = body.message?.trim() ?? "";
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    const focusModuleId = body.focusModuleId?.trim() || undefined;

    if (!mapId) {
      return NextResponse.json(
        { success: false, error: "Missing course map id." } satisfies NotesChatResponse,
        { status: 400 }
      );
    }
    if (message.length < 2) {
      return NextResponse.json(
        { success: false, error: "Enter a question or request." } satisfies NotesChatResponse,
        { status: 400 }
      );
    }

    const record = await getCourseMapForUser(user.id, mapId);
    if (!record) {
      return NextResponse.json(
        { success: false, error: "Course map not found." } satisfies NotesChatResponse,
        { status: 404 }
      );
    }

    const course = storedToClientData(record);
    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: NOTES_ASSISTANT_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildNotesAssistantUserPrompt({
            course,
            message,
            history,
            focusModuleId,
          }),
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { success: false, error: "The assistant returned an empty reply." } satisfies NotesChatResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reply } satisfies NotesChatResponse);
  } catch (error) {
    console.error("Notes chat error:", error);
    return NextResponse.json(
      {
        success: false,
        error: friendlyApiError(
          error instanceof Error ? error.message : "Something went wrong."
        ),
      } satisfies NotesChatResponse,
      { status: 500 }
    );
  }
}
