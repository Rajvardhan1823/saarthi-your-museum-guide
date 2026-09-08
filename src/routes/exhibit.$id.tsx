import { createFileRoute, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { LanguagePills, ThemeShell, TopBar } from "@/components/saarthi";
import { generateResponse } from "@/lib/agent.functions";
import { LANGS, LANG_NAME, T, type Lang } from "@/lib/i18n";
import { THEME_TONE, getExhibit } from "@/lib/museums";
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

function ExhibitPage() {
  const { exhibit, museum } = Route.useLoaderData();
  const [lang, setLang] = useLang();
  const t = T[lang];
  const ask = useServerFn(generateResponse);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [state, setState] = useState<
    "idle" | "intro" | "listening" | "thinking" | "speaking"
  >("intro");
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const introducedFor = useRef<string>("");

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
    async (mode: "intro" | "chat", query: string, history: Turn[]) => {
      setState(mode === "intro" ? "intro" : "thinking");
      setNotice(null);
      try {
        const res = await ask({
          data: {
            exhibitContext: `${exhibit.name} (${exhibit.period}, ${exhibit.gallery}). ${exhibit.context}`,
            exhibitName: exhibit.name,
            museumName: museum.name,
            themeTone: THEME_TONE[museum.theme],
            language: LANG_NAME[lang],
            mode,
            query,
            history,
          },
        });
        const answer = res.answer_text || t.noSpeech;
        setTurns((prev) => [...prev, { role: "assistant", content: answer }]);
        speak(answer);
      } catch (err) {
        console.error(err);
        setState("idle");
        setNotice(
          err instanceof Error && err.message.includes("NO_CREDITS")
            ? "AI credits exhausted — please top up to continue."
            : "Couldn't reach the guide. Check your connection and try again.",
        );
      }
    },
    [ask, exhibit, museum, lang, speak, t.noSpeech],
  );

  // Introduce the exhibit first, then invite interaction. Re-runs on language change.
  useEffect(() => {
    const stamp = `${exhibit.id}:${lang}`;
    if (introducedFor.current === stamp) return;
    introducedFor.current = stamp;
    window.speechSynthesis?.cancel();
    setTurns([]);
    void run("intro", "", []);
  }, [exhibit.id, lang, run]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns, state]);

  const submit = (text: string) => {
    const q = text.trim();
    if (!q || state === "thinking" || state === "intro") return;
    const history = [...turns];
    setTurns([...history, { role: "user", content: q }]);
    setDraft("");
    void run("chat", q, history);
  };

  const startListening = () => {
    if (state === "speaking") window.speechSynthesis?.cancel();
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
      setState("idle");
      setNotice(e.error === "not-allowed" ? t.noMic : t.noSpeech);
    };
    rec.onend = () => setState((s) => (s === "listening" ? "idle" : s));
    recognitionRef.current = rec;
    setNotice(null);
    setState("listening");
    rec.start();
  };

  const busy = state === "thinking" || state === "intro";

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
            {museum.name} · {exhibit.gallery}
          </p>
        </div>
        <div className="p-4">
          <h1 className="display text-2xl leading-tight">{exhibit.name}</h1>
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
            {state === "intro" ? t.introducing : t.thinking}
          </p>
        )}
        {state === "speaking" && (
          <div className="flex items-center gap-2 text-xs opacity-70">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="mic-live block h-3 w-1 rounded-full"
                  style={{
                    backgroundColor: "var(--brand)",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </span>
            {t.speaking}
          </div>
        )}
        {notice && (
          <p className="text-xs" style={{ color: "var(--destructive)" }}>
            {notice}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 pt-3" style={{ background: "var(--background)" }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={startListening}
            disabled={busy}
            aria-label={t.tapToSpeak}
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
                ? t.listening
                : state === "speaking"
                  ? t.speaking
                  : busy
                    ? t.thinking
                    : t.tapToSpeak}
            </p>
            <p className="text-xs opacity-60">{t.askAnything}</p>
          </div>
          {state === "speaking" && (
            <button
              type="button"
              onClick={() => {
                window.speechSynthesis.cancel();
                setState("idle");
              }}
              className="rounded-full border px-3 py-1.5 text-xs"
              style={{ borderColor: "var(--border)" }}
            >
              {t.stop}
            </button>
          )}
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
            disabled={busy || !draft.trim()}
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
          {t.provider}
        </p>
      </div>
    </ThemeShell>
  );
}

export type { Lang };
