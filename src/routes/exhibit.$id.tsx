import { createFileRoute, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LanguagePills,
  SiriOrb,
  ThemeShell,
  TopBar,
} from "@/components/saarthi";
import { LANGS, T, type Lang } from "@/lib/i18n";
import { getExhibit, getExhibitCopy } from "@/lib/museums";
import { EXHIBIT_IMAGE } from "@/lib/exhibit-images";
import { useLang } from "@/lib/use-lang";

export const Route = createFileRoute("/exhibit/$id")({
  loader: ({ params }) => {
    const found = getExhibit(params.id);
    if (!found) throw notFound();
    return found;
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Exhibit — Saarthi" },
          { name: "robots", content: "noindex" },
        ],
      };
    const { exhibit, museum } = loaderData;
    const title = `${exhibit.name} — ${museum.name} | Saarthi`;
    const description = exhibit.context.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ExhibitPage,
});

type Turn = { role: "user" | "assistant"; content: string };
type Source = { title: string; uri: string };

function ExhibitPage() {
  const { exhibit, museum } = Route.useLoaderData();
  const [lang, setLang] = useLang();
  const t = T[lang];
  const copy = getExhibitCopy(exhibit, lang);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [state, setState] = useState<
    "idle" | "intro" | "listening" | "thinking" | "speaking"
  >("intro");
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const turnsRef = useRef<Turn[]>([]);
  const [activeProvider, setActiveProvider] = useState("rime");
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const introducedFor = useRef<string>("");
  const requestVersion = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cancelRecordingRef = useRef(false);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  const stopSaarthi = useCallback(() => {
    requestVersion.current += 1;
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    audioRef.current = null;
    recognitionRef.current?.abort?.();
    cancelRecordingRef.current = true;
    recorderRef.current?.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setState("idle");
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANGS.find((l) => l.code === lang)?.bcp ?? "en-IN";
      u.rate = 0.98;
      u.onend = () => setState("idle");
      setState("speaking");
      window.speechSynthesis.speak(u);
    },
    [lang],
  );

  const run = useCallback(
    async (mode: "intro" | "chat", query: string, history: Turn[], audio?: Blob) => {
      setState(mode === "intro" ? "intro" : "thinking");
      setNotice(null);
      const version = requestVersion.current;
      try {
        if (!sessionIdRef.current) {
          const sessionResponse = await fetch("/sessions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              exhibit_id: exhibit.id,
              language: lang,
            }),
          });
          if (!sessionResponse.ok) throw new Error(`SESSION_ERROR_${sessionResponse.status}`);
          const session = (await sessionResponse.json()) as { session_id: string };
          sessionIdRef.current = session.session_id;
        }
        const form = new FormData();
        if (audio) form.set("audio", audio, "question.webm");
        else
          form.set(
            "transcript",
            mode === "intro"
              ? `Introduce ${copy.name} using only the exhibit context.`
              : query,
          );
        let response = await fetch(
          `/sessions/${sessionIdRef.current}/message`,
          { method: "POST", body: form },
        );
        if (response.status === 404) {
          sessionIdRef.current = null;
          const retrySession = await fetch("/sessions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ exhibit_id: exhibit.id, language: lang }),
          });
          if (!retrySession.ok) throw new Error(`SESSION_ERROR_${retrySession.status}`);
          const retry = (await retrySession.json()) as { session_id: string };
          sessionIdRef.current = retry.session_id;
          response = await fetch(
            `/sessions/${retry.session_id}/message`,
            { method: "POST", body: form },
          );
        }
        if (!response.ok) {
          const detail = await response.text();
          let message = detail;
          try {
            const payload = JSON.parse(detail) as { error?: unknown };
            if (typeof payload.error === "string") message = payload.error;
          } catch {
            // Keep the plain response when the server did not return JSON.
          }
          throw new Error(message || `MESSAGE_ERROR_${response.status}`);
        }
        const res = (await response.json()) as {
          answer_text?: string;
          transcript?: string;
          active_provider?: string;
          audio_url?: string;
          sources?: Source[];
        };
        if (version !== requestVersion.current) return;
        const answer = res.answer_text || t.noSpeech;
        setActiveProvider(res.active_provider ?? "rime");
        if (res.sources?.length) setSources(res.sources);
        if (audio && res.transcript) {
          setTurns((prev) => {
            const next = [...prev];
            const pendingIndex = next.findIndex(
              (turn) => turn.role === "user" && turn.content === "Transcribing your question…",
            );
            if (pendingIndex >= 0) next[pendingIndex] = { role: "user", content: res.transcript! };
            else next.push({ role: "user", content: res.transcript });
            return next;
          });
          setTimeout(() => {
            setTurns((prev) => [...prev, { role: "assistant", content: answer }]);
          }, 0);
        } else {
          setTurns((prev) => [...prev, { role: "assistant", content: answer }]);
        }
        if (res.audio_url) {
          const audio = new Audio(res.audio_url);
          audioRef.current = audio;
          audio.onended = () => {
            audioRef.current = null;
            setState("idle");
          };
          audio.onerror = () => {
            audioRef.current = null;
            speak(answer);
          };
          setState("speaking");
          await audio.play().catch(() => {
            audio.onerror = null;
            audioRef.current = null;
            speak(answer);
          });
        } else {
          speak(answer);
        }
      } catch (err) {
        console.error(err);
        setState("idle");
        setNotice(
          err instanceof Error && err.message.includes("NO_CREDITS")
            ? "AI credits exhausted — please top up to continue."
            : err instanceof Error
              ? err.message
              : "Couldn't reach the guide. Check your connection and try again.",
        );
      }
    },
    [copy, exhibit, lang, museum, speak, t.noSpeech],
  );

  // Introduce the exhibit first, then invite interaction. Re-runs on language change.
  useEffect(() => {
    const stamp = `${exhibit.id}:${lang}`;
    if (introducedFor.current === stamp) return;
    introducedFor.current = stamp;
    stopSaarthi();
    sessionIdRef.current = null;
    setTurns([]);
    void run("intro", "", []);
  }, [exhibit.id, lang, run, stopSaarthi]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns, state]);

  const submit = (text: string) => {
    const q = text.trim();
    if (!q || state === "thinking") return;
    if (state === "intro" || state === "speaking") stopSaarthi();
    const history = [...turns];
    setTurns([...history, { role: "user", content: q }]);
    setDraft("");
    void run("chat", q, history);
  };

  const startListening = async () => {
    if (state === "speaking") stopSaarthi();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType, audioBitsPerSecond: 128000 } : undefined,
      );
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        const audio = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (audio.size && !cancelRecordingRef.current) {
          setTurns((prev) => [
            ...prev,
            { role: "user", content: "Transcribing your question…" },
          ]);
          void run("chat", "", turnsRef.current, audio);
        }
        else if (!cancelRecordingRef.current) {
          setState("idle");
          setNotice("No audio was captured. Check microphone permission and try again.");
        }
      };
      streamRef.current = stream;
      recorderRef.current = recorder;
      cancelRecordingRef.current = false;
      setNotice(null);
      setState("listening");
      recorder.start(250);
      return;
    } catch {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SR) {
        setNotice(t.noMic);
        return;
      }
      const rec = new SR();
      rec.lang = LANGS.find((l) => l.code === lang)?.bcp ?? "en-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e: any) => submit(e.results[0][0].transcript as string);
      rec.onerror = (e: any) => {
        recognitionRef.current = null;
        setState("idle");
        setNotice(e.error === "not-allowed" ? t.noMic : t.noSpeech);
      };
      rec.onend = () => {
        recognitionRef.current = null;
        setState((s) => (s === "listening" ? "idle" : s));
      };
      recognitionRef.current = rec;
      setNotice(null);
      setState("listening");
      rec.start();
    }
  };

  const busy = state === "thinking" || state === "intro";
  const toggleListening = () => {
    if (state === "listening" && recorderRef.current) {
      setState("thinking");
      recorderRef.current.requestData?.();
      recorderRef.current.stop();
      return;
    }
    if (state === "listening" && recognitionRef.current) {
      recognitionRef.current.stop?.();
      recognitionRef.current = null;
      setState("idle");
      return;
    }
    void startListening();
  };

  return (
    <ThemeShell theme={museum.theme}>
      <TopBar
        backTo={{ to: "/museum/$id", params: { id: museum.id } }}
        backLabel={museum.name.split(" ")[0] ?? t.back}
        right={<LanguagePills value={lang} onChange={setLang} compact />}
      />

      <div className="saarthi-card overflow-hidden">
        <div
          className="flex h-28 items-end p-4"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--brand) 45%, transparent), transparent)",
          }}
        >
          <p className="text-[11px] uppercase tracking-widest opacity-70">
            {museum.name} · {copy.gallery}
          </p>
        </div>
        <img
          src={EXHIBIT_IMAGE[exhibit.id]}
          alt={copy.name}
          className="h-56 w-full object-cover"
          loading="eager"
        />
        <div className="p-4">
          <h1 className="display text-2xl leading-tight">{copy.name}</h1>
          <p className="mt-1 text-xs opacity-65">{exhibit.period}</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-4 flex-1 space-y-3 overflow-y-auto pb-2"
        style={{ maxHeight: "48vh" }}
      >
        {turns.map((turn, i) =>
          turn.role === "assistant" ? (
            <p key={i} className="text-[15px] leading-relaxed">
              {turn.content}
            </p>
          ) : (
            <p
              key={i}
              className="ml-auto w-fit max-w-[85%] rounded-2xl px-3.5 py-2 text-sm"
              style={{
                backgroundColor: "var(--brand)",
                color: "var(--brand-foreground)",
              }}
            >
              {turn.content}
            </p>
          ),
        )}
        {busy && (
          <p className="text-sm italic opacity-60">
            {state === "intro"
              ? t.introducing
              : state === "thinking" && turns.length > 0
                ? "Transcribing and preparing an answer…"
                : t.thinking}
          </p>
        )}
        {state === "speaking" && (
          <div className="saarthi-speaking-bubble flex items-center gap-3 rounded-3xl px-4 py-3 text-sm">
            <SiriOrb active size={44} />
            <span>{t.speaking}</span>
          </div>
        )}
        {notice && (
          <p className="text-xs" style={{ color: "var(--destructive)" }}>
            {notice}
          </p>
        )}
        {sources.length > 0 && (
          <div className="text-xs opacity-70">
            <p className="mb-1 font-medium">Sources</p>
            <ul className="space-y-1">
              {sources.map((source) => (
                <li key={source.uri}>
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 pt-3" style={{ background: "var(--background)" }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleListening}
            disabled={state === "thinking"}
            aria-label={state === "listening" ? "Stop recording" : t.tapToSpeak}
            className={`grid h-16 w-16 shrink-0 place-items-center rounded-full disabled:opacity-50 ${
              state === "listening" ? "mic-live" : ""
            }`}
            style={{
              backgroundColor: "var(--brand)",
              color: "var(--brand-foreground)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" />
              <path d="M18 11a1 1 0 1 0-2 0 4 4 0 0 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.91V20a1 1 0 1 0 2 0v-3.09A6 6 0 0 0 18 11Z" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {state === "listening"
                ? "Recording — tap the mic again to stop"
                : state === "speaking"
                  ? t.speaking
                  : busy
                    ? t.thinking
                    : t.tapToSpeak}
            </p>
            <p className="text-xs opacity-60">{t.askAnything}</p>
          </div>
          <button
            type="button"
            onClick={stopSaarthi}
            disabled={state === "idle"}
            className="rounded-full border px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-35"
            style={{ borderColor: "var(--border)" }}
          >
            {t.stop}
          </button>
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(draft);
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t.typeInstead}
            className="min-w-0 flex-1 rounded-full border bg-transparent px-4 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--border)" }}
          />
          <button
            type="submit"
            disabled={state === "thinking" || !draft.trim()}
            className="rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
            style={{
              backgroundColor: "var(--brand)",
              color: "var(--brand-foreground)",
            }}
          >
            {t.send}
          </button>
        </form>

        <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] opacity-60">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "var(--brand)" }}
          />
          {t.provider.replace("Rime", activeProvider)}
        </p>
      </div>
    </ThemeShell>
  );
}

export type { Lang };
