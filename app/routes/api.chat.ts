import { type ActionFunctionArgs } from "react-router";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getKnowledge } from "~/lib/loadKnowledge";
import { buildSystemPrompt } from "~/lib/buildSystemPrompt";
import {
  isInjectionAttempt,
  containsLeakedPrompt,
  REFUSAL_MESSAGE,
  SAFE_FALLBACK_MESSAGE,
} from "~/lib/security";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { messages } = await request.json();
    const latest = messages.at(-1)?.content ?? "";

    // Layer 2 — input sanitization
    if (isInjectionAttempt(latest)) {
      return Response.json({ role: "assistant", content: REFUSAL_MESSAGE });
    }

    const kb = getKnowledge();
    const systemPrompt = buildSystemPrompt(kb);

    // generateText (not streamText) so Layer 3 can inspect the full response before sending
    const { text } = await generateText({
      model: google("gemini-3-flash-preview"),
      system: systemPrompt,
      messages,
    });

    // Layer 3 — output validation
    if (containsLeakedPrompt(text)) {
      return Response.json({
        role: "assistant",
        content: SAFE_FALLBACK_MESSAGE,
      });
    }

    return Response.json({ role: "assistant", content: text });
  } catch (error) {
    console.error("API Route Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown internal error";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
