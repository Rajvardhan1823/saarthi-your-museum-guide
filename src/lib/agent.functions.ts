import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Turn = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const Input = z.object({
  exhibitContext: z.string(),
  exhibitName: z.string(),
  museumName: z.string(),
  themeTone: z.string(),
  language: z.string(),
  mode: z.enum(["intro", "chat"]),
  query: z.string(),
  history: z.array(Turn).default([]),
});

type Msg = { role: "user" | "assistant" | "system"; content: string };

/**
 * Single AI interface — swapping the model or provider is a change here only.
 * generateResponse(exhibit_context, history, query, language, theme) -> { answer_text, language_used }
 */
export const generateResponse = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const system = `You are Saarthi, a museum voice guide standing beside a visitor at "${data.exhibitName}" in ${data.museumName}.
${data.themeTone}
Reply ONLY in ${data.language}. If the visitor code-switches (e.g. Hindi with English words like "sculpture" or "Chola"), keep proper nouns as-is but answer in ${data.language}.
Ground every answer in the exhibit notes below; if something is not covered, say so briefly and offer what is known.
Speak the way a person speaks aloud: no markdown, no bullet points, no headings. Keep it to 3-5 short sentences.

EXHIBIT NOTES:
${data.exhibitContext}`;

    const intro = `Give the visitor a spoken introduction to this exhibit — what it is, what to look at, why it matters — then end with one short inviting question offering to go deeper.`;

    const messages: Msg[] = [
      { role: "system", content: system },
      ...data.history.slice(-10),
      { role: "user", content: data.mode === "intro" ? intro : data.query },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: messages.map((msg) => ({
          role: msg.role,
          content: [
            {
              type: msg.role === "assistant" ? "output_text" : "input_text",
              text: msg.content,
            },
          ],
        })),
        stream: true,
        store: false,
        reasoning: { effort: "low" },
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("RATE_LIMIT");
      if (res.status === 402) throw new Error("NO_CREDITS");
      throw new Error(`AI_ERROR_${res.status}: ${detail.slice(0, 200)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            response?: { output_text?: string };
          };
          if (evt.type === "response.output_text.delta" && evt.delta) {
            answer += evt.delta;
          } else if (
            evt.type === "response.completed" &&
            !answer &&
            evt.response?.output_text
          ) {
            answer = evt.response.output_text;
          }
        } catch {
          /* ignore keep-alive fragments */
        }
      }
    }

    return {
      answer_text: answer.trim(),
      language_used: data.language,
      active_provider: "Rime",
    };
  });
