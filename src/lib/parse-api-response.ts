export async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new Error(
      response.ok
        ? "The server returned an empty response."
        : `Request failed (${response.status}). Please try again.`
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    if (text.startsWith("Internal Server Error") || text.startsWith("<!DOCTYPE")) {
      throw new Error(
        "The server crashed while processing your materials. Try smaller files or paste text only. If this keeps happening, restart the dev server."
      );
    }

    throw new Error(text.length > 200 ? `${text.slice(0, 200)}…` : text);
  }
}

export function friendlyApiError(message: string): string {
  if (message.includes("insufficient_quota") || message.includes("429")) {
    return "OpenAI quota exceeded. Add billing/credits at platform.openai.com and try again.";
  }
  if (message.includes("invalid_api_key") || message.includes("401")) {
    return "Invalid OpenAI API key. Check OPENAI_API_KEY in .env.local.";
  }
  if (message.includes("model") && message.includes("not found")) {
    return "The configured OpenAI model is unavailable. Set OPENAI_MODEL=gpt-4o-mini in .env.local.";
  }
  return message;
}
