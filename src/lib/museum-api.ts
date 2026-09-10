import { MUSEUMS, getExhibit } from "./museums";
import { EXHIBIT_IMAGE } from "./exhibit-images";

export type Session = {
  session_id: string;
  exhibit_id: string;
  language: "en";
  conversation_history: Array<{ role: "user" | "assistant"; content: string }>;
  created_at: string;
};

type AnswerResult = {
  text: string;
  sources: Array<{ title: string; uri: string }>;
};

const sessions = new Map<string, Session>();
const qrCodes = new Map(
  MUSEUMS.flatMap((museum) =>
    museum.exhibits.map((exhibit) => [exhibit.id, exhibit.id] as const),
  ),
);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function publicMuseum(museum: (typeof MUSEUMS)[number]) {
  return {
    id: museum.id,
    name: museum.name,
    city: museum.city,
    description: museum.description,
    thumbnail: null,
    theme: museum.theme,
    exhibit_ids: museum.exhibits.map((exhibit) => exhibit.id),
  };
}

function publicExhibit(exhibitId: string) {
  const found = getExhibit(exhibitId);
  if (!found) return null;
  return {
    id: found.exhibit.id,
    museum_id: found.museum.id,
    name: found.exhibit.name,
    description: found.exhibit.context,
    image: EXHIBIT_IMAGE[found.exhibit.id] ?? null,
    qr_code: found.exhibit.id,
    supported_languages: ["en"],
  };
}

function fallbackAnswer(exhibitId: string, question: string): string {
  const exhibit = getExhibit(exhibitId)?.exhibit;
  if (!exhibit) return "This exhibit is not available.";
  if (question && !question.startsWith("Introduce ")) {
    const normalizedQuestion = question.toLowerCase();
    if (
      /\b(what is this|what's this|what is this object|idol|object|sculpture|exhibit|artwork)\b/.test(
        normalizedQuestion,
      )
    ) {
      return `This is ${exhibit.name}. ${exhibit.context.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")}`;
    }
    const words = normalizedQuestion.match(/[a-z]{3,}/g) ?? [];
    const ignored = new Set([
      "about",
      "and",
      "are",
      "for",
      "from",
      "how",
      "its",
      "the",
      "was",
      "were",
      "does",
      "this",
      "that",
      "what",
      "when",
      "where",
      "which",
      "who",
      "why",
      "with",
      "tell",
      "please",
      "mean",
      "means",
    ]);
    const questionTerms = words.filter((word) => !ignored.has(word));
    const semanticTerms: Record<string, string[]> = {
      made: ["made", "painted", "carved", "cast", "technique", "process", "formed"],
      work: [
        "works",
        "mechanism",
        "process",
        "principle",
        "causes",
        "swings",
        "swinging",
        "rotates",
        "rotation",
        "pressure",
        "charge",
        "belt",
        "hovers",
        "moves",
      ],
      use: ["used", "use", "purpose", "carried", "trade", "festival", "demonstrates"],
      meaning: ["meaning", "symbol", "represent", "compassion", "ignorance", "cosmos", "meditation"],
      history: ["dynasty", "century", "period", "harappan", "mughal", "vakataka", "invented"],
      material: ["bronze", "steel", "paper", "watercolour", "stone", "basalt", "pigment", "rubber"],
    };
    const expandedTerms = new Set(questionTerms);
    if (/\b(make|made|create|created|paint|painted|carve|carved|technique|process)\b/.test(normalizedQuestion)) {
      semanticTerms.made.forEach((term) => expandedTerms.add(term));
    }
    if (/\b(work|works|function|operate|happen|why|how)\b/.test(normalizedQuestion)) {
      semanticTerms.work.forEach((term) => expandedTerms.add(term));
      ["because", "represent", "symbol", "meaning", "cosmos", "purpose"].forEach((term) =>
        expandedTerms.add(term),
      );
    }
    if (/\b(use|used|purpose|for)\b/.test(normalizedQuestion)) {
      semanticTerms.use.forEach((term) => expandedTerms.add(term));
    }
    if (/\b(mean|meaning|symbol|symbolize|represent)\b/.test(normalizedQuestion)) {
      semanticTerms.meaning.forEach((term) => expandedTerms.add(term));
    }
    if (/\b(history|historical|who|when|period|date|dynasty)\b/.test(normalizedQuestion)) {
      semanticTerms.history.forEach((term) => expandedTerms.add(term));
    }
    if (/\b(material|made of|what is it made)\b/.test(normalizedQuestion)) {
      semanticTerms.material.forEach((term) => expandedTerms.add(term));
    }
    const sentences = exhibit.context.split(/(?<=[.!?])\s+/).filter(Boolean);
    const matches = sentences
      .map((candidate, index) => {
        const sentence = candidate.toLowerCase();
        let score = [...expandedTerms].reduce((total, word) => {
          if (sentence.includes(word)) return total + (word.length >= 6 ? 3 : 2);
          if (
            (word === "symbol" || word === "symbolize" || word === "meaning") &&
            /symbol|represent|release|fearlessness|creation|destruction/.test(sentence)
          ) {
            return total + 2;
          }
          if ((word === "surround" || word === "fire") && /flame|cosmos/.test(sentence)) {
            return total + 2;
          }
          if ((word === "history" || word === "period") && /century|dynasty|bce|ce/.test(sentence)) {
            return total + 2;
          }
          return total;
        }, 0);
        if (!expandedTerms.size && /\b(who|when|made|created|period|date)\b/i.test(question)) {
          score = /\bmade\b|\bcentury\b|\bdynasty\b|\bbce\b|\bce\b/i.test(sentence) ? 4 : 0;
        }
        return { candidate, index, score };
      })
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index);
    if (matches.length) {
      return matches[0].candidate;
    }
    return "The exhibit text does not provide that information.";
  }
  const opening = `This is ${exhibit.name}. ${exhibit.context.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")}`;
  return opening;
}

function focusAnswer(question: string, answer: string, exhibitId: string): string {
  const normalized = question.toLowerCase();
  const sentences = answer.split(/(?<=[.!?])\s+/).filter(Boolean);
  let terms: RegExp | null = null;
  if (/\b(foot|release|raised|symbolize|symbolise)\b/.test(normalized)) {
    terms = /\bfoot\b|\brelease\b|\braised\b/i;
  } else if (/\b(flame|fire|surround|ring)\b/.test(normalized)) {
    terms = /\bflame(s)?\b|\bfire\b|\bcosmos\b|\bring\b/i;
  }
  else if (/\b(who|when|made|created|period|date)\b/.test(normalized)) {
    terms = /\bmade\b|\bcentury\b|\bdynasty\b|\btamil nadu\b|\bbce\b|\bce\b/i;
  }
  if (!terms) return answer;
  const focused = sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: sentence.match(terms!)?.length ?? 0,
    }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  return focused[0]?.sentence ?? fallbackAnswer(exhibitId, question);
}

function answerFromContext(exhibitId: string, question: string): string {
  const answer = fallbackAnswer(exhibitId, question);
  return question.startsWith("Introduce ") ? answer : focusAnswer(question, answer, exhibitId);
}

async function answerQuestion(
  exhibitId: string,
  question: string,
): Promise<AnswerResult> {
  const exhibit = getExhibit(exhibitId)?.exhibit;
  if (!exhibit) return { text: "This exhibit is not available.", sources: [] };
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey || question.startsWith("Introduce ")) {
    return { text: answerFromContext(exhibitId, question), sources: [] };
  }

  const contents = [
    {
      role: "user",
      parts: [{
        text: [
          "Answer only the visitor's current question below. Do not repeat the introduction and do not use earlier conversation turns.",
          `Exhibit: ${exhibit.name}`,
          `Gallery: ${exhibit.gallery}`,
          `Period: ${exhibit.period}`,
          `Context: ${exhibit.context}`,
          `Visitor question: ${question || "Introduce this exhibit."}`,
        ].join("\n"),
      }],
    },
  ];
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env["GEMINI_MODEL"] || "gemini-3.6-flash")}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You are Saarthi, a helpful conversational museum guide." }],
        },
        contents,
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 500,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    if (response.status === 429 || response.status >= 500) {
      return { text: answerFromContext(exhibitId, question), sources: [] };
    }
    throw new Error(`GEMINI_ERROR_${response.status}: ${detail.slice(0, 200)}`);
  }
  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: unknown }> };
      groundingMetadata?: {
        groundingChunks?: Array<{ web?: { uri?: unknown; title?: unknown } }>;
      };
    }>;
  };
  const candidate = payload.candidates?.[0];
  const answer = candidate?.content?.parts
    ?.map((part) => (typeof part.text === "string" ? part.text.trim() : ""))
    .filter((text) => text && !/^[\s\W]+$/.test(text))
    .join(" ")
    .trim();
  if (!answer) {
    return { text: answerFromContext(exhibitId, question), sources: [] };
  }
  const cleanedAnswer = answer.trim();
  const sources = (candidate?.groundingMetadata?.groundingChunks ?? [])
    .map((chunk) => ({
      title: typeof chunk.web?.title === "string" ? chunk.web.title : "Web source",
      uri: typeof chunk.web?.uri === "string" ? chunk.web.uri : "",
    }))
    .filter((source) => source.uri)
    .filter((source, index, all) => all.findIndex((item) => item.uri === source.uri) === index)
    .slice(0, 4);
  return {
    text: cleanedAnswer.startsWith("I can only")
      ? "I can only help with this exhibit."
      : cleanedAnswer,
    sources,
  };
}

function evidence(event: Record<string, unknown>) {
  console.info(JSON.stringify({ type: "saarthi_evidence", at: new Date().toISOString(), ...event }));
}

async function transcribeAudio(audio: File): Promise<string> {
  const apiKey = process.env["STT_API_KEY"];
  if (!apiKey) throw new Error("Missing STT_API_KEY");
  if (!audio.size) throw new Error("STT_NO_AUDIO_DATA");

  const form = new FormData();
  form.append("file", audio, audio.name || "question.webm");
  form.append("model", process.env["STT_MODEL"] || "whisper-large-v3-turbo");
  form.append("response_format", "json");

  const response = await fetch(
    process.env["STT_API_URL"] ||
      "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`STT_ERROR_${response.status}: ${detail.slice(0, 200)}`);
  }
  const payload = (await response.json()) as { text?: unknown };
  if (typeof payload.text !== "string" || !payload.text.trim()) {
    throw new Error("STT_EMPTY_TRANSCRIPT: speak clearly and try again");
  }
  const transcript = payload.text.trim();
  if (!/[a-z0-9\u0900-\u097f]/i.test(transcript)) {
    throw new Error("STT_EMPTY_TRANSCRIPT: speak clearly and try again");
  }
  return transcript;
}

async function synthesizeRime(text: string): Promise<string | null> {
  const apiKey = process.env["RIME_API_KEY"];
  const speaker = process.env["RIME_ENGLISH_SPEAKER"] || "astra";
  if (!apiKey || !speaker) return null;
  const ttsText = text.length > 280 ? `${text.slice(0, 277)}...` : text;
  const response = await fetch("https://users.rime.ai/v1/rime-tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "audio/wav",
      "content-type": "application/json",
    },
    body: JSON.stringify({ text: ttsText, modelId: "coda", speaker, lang: "en" }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`RIME_ERROR_${response.status}: ${detail.slice(0, 200)}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length) throw new Error("RIME_EMPTY_AUDIO");
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:${response.headers.get("content-type") || "audio/wav"};base64,${btoa(binary)}`;
}

export async function handleMuseumApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/") && !url.pathname.startsWith("/museums") && !url.pathname.startsWith("/sessions") && !url.pathname.startsWith("/exhibits") && !url.pathname.startsWith("/qr/")) {
    return null;
  }

  if (request.method === "GET" && url.pathname === "/museums") {
    const search = url.searchParams.get("search")?.trim().toLowerCase() ?? "";
    const museums = MUSEUMS.filter((museum) =>
      `${museum.name} ${museum.city}`.toLowerCase().includes(search),
    ).map(publicMuseum);
    return json(museums);
  }

  const museumMatch = url.pathname.match(/^\/museums\/([^/]+)$/);
  if (request.method === "GET" && museumMatch) {
    const museum = MUSEUMS.find((item) => item.id === museumMatch[1]);
    return museum ? json(publicMuseum(museum)) : json({ error: "Museum not found" }, 404);
  }

  const exhibitMatch = url.pathname.match(/^\/exhibits\/([^/]+)$/);
  if (request.method === "GET" && exhibitMatch) {
    const exhibit = publicExhibit(exhibitMatch[1]);
    return exhibit ? json(exhibit) : json({ error: "Exhibit not found" }, 404);
  }

  if (request.method === "POST" && url.pathname === "/sessions") {
    const body = (await request.json()) as { exhibit_id?: string; language?: string };
    const language = body.language === "en" ? "en" : null;
    if (!body.exhibit_id || !language || !getExhibit(body.exhibit_id)) {
      return json({ error: "exhibit_id and language (en) are required" }, 400);
    }
    const session: Session = {
      session_id: crypto.randomUUID(),
      exhibit_id: body.exhibit_id,
      language,
      conversation_history: [],
      created_at: new Date().toISOString(),
    };
    sessions.set(session.session_id, session);
    evidence({ endpoint: "/sessions", request: body, response: { session_id: session.session_id } });
    return json({ session_id: session.session_id });
  }

  const messageMatch = url.pathname.match(/^\/sessions\/([^/]+)\/message$/);
  if (request.method === "POST" && messageMatch) {
    const session = sessions.get(messageMatch[1]);
    if (!session) return json({ error: "Session not found" }, 404);
    const form = await request.formData();
    const audio = form.get("audio");
    const suppliedTranscript = String(form.get("transcript") ?? "").trim();
    let transcript: string;
    try {
      transcript =
        audio instanceof File
          ? await transcribeAudio(audio)
          : suppliedTranscript || "Tell me about this exhibit.";
    } catch (error) {
      const message = error instanceof Error ? error.message : "STT_FAILED";
      evidence({ endpoint: `/sessions/${session.session_id}/message`, error: message });
      return json({ error: message }, 502);
    }
    let answer: AnswerResult;
    try {
      answer = await answerQuestion(
        session.exhibit_id,
        transcript,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "LLM_FAILED";
      evidence({ endpoint: `/sessions/${session.session_id}/message`, error: message });
      answer = {
        text: answerFromContext(session.exhibit_id, transcript),
        sources: [],
      };
    }
    session.conversation_history.push(
      { role: "user", content: transcript },
      { role: "assistant", content: answer.text },
    );
    let audioUrl: string | null;
    try {
      audioUrl = await Promise.race([
        synthesizeRime(answer.text),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200)),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "RIME_FAILED";
      evidence({ endpoint: `/sessions/${session.session_id}/message`, error: message });
      return json({ error: message }, 502);
    }
    const response = {
      transcript,
      answer_text: answer.text,
      sources: answer.sources,
      audio_url: audioUrl,
      active_provider: audioUrl ? "rime" : "browser",
    };
    evidence({
      endpoint: `/sessions/${session.session_id}/message`,
      request: { transcript, audio: form.has("audio") },
      response,
    });
    return json(response);
  }

  const qrMatch = url.pathname.match(/^\/qr\/([^/]+)$/);
  if (request.method === "GET" && qrMatch) {
    const exhibitId = qrCodes.get(qrMatch[1]);
    return exhibitId
      ? Response.redirect(new URL(`/exhibit/${exhibitId}`, url), 302)
      : json({ error: "QR code not found" }, 404);
  }

  return json({ error: "Not found" }, 404);
}
