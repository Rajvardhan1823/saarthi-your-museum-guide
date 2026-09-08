import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BrandMark, LanguagePills, ThemeShell } from "@/components/saarthi";
import { T, type Lang } from "@/lib/i18n";
import { MUSEUMS, THEME_LABEL, getExhibit } from "@/lib/museums";
import { useLang } from "@/lib/use-lang";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saarthi — Voice guide for Indian museums" },
      {
        name: "description",
        content:
          "Scan an exhibit QR or search a museum and ask Saarthi anything, out loud, in Marathi, Hindi or English.",
      },
      { property: "og:title", content: "Saarthi — Museum voice guide" },
      {
        property: "og:description",
        content:
          "Ask any exhibit anything, out loud, in Marathi, Hindi or English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const ACCENT: Record<string, string> = {
  art_gallery: "oklch(0.56 0.11 30)",
  history_museum: "oklch(0.5 0.13 45)",
  science_museum: "oklch(0.62 0.14 195)",
  heritage_site: "oklch(0.6 0.13 300)",
};

function Home() {
  const [lang, setLang] = useLang();
  const [query, setQuery] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const navigate = useNavigate();
  const t = T[lang as Lang];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MUSEUMS;
    return MUSEUMS.filter((m) =>
      `${m.name} ${m.city} ${THEME_LABEL[m.theme]}`.toLowerCase().includes(q),
    );
  }, [query]);

  const openCode = () => {
    const c = code.trim().toLowerCase();
    if (getExhibit(c)) {
      navigate({ to: "/exhibit/$id", params: { id: c } });
    } else {
      setCodeError(true);
    }
  };

  return (
    <ThemeShell theme="history_museum">
      <div className="pt-8">
        <BrandMark />
        <h1 className="display mt-6 text-3xl leading-tight">{t.tagline}</h1>
      </div>

      <section className="mt-7">
        <p className="mb-2 text-xs uppercase tracking-widest opacity-60">
          {t.chooseLanguage}
        </p>
        <LanguagePills value={lang} onChange={setLang} />
      </section>

      <section className="saarthi-card mt-6 p-4">
        <p className="display text-lg">{t.scanQr}</p>
        <p className="mt-1 text-sm opacity-70">{t.scanQrHint}</p>
        <div className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setCodeError(false);
            }}
            placeholder={t.enterCode}
            className="min-w-0 flex-1 rounded-lg border bg-transparent px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--border)" }}
          />
          <button
            type="button"
            onClick={openCode}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold"
            style={{
              backgroundColor: "var(--brand)",
              color: "var(--brand-foreground)",
            }}
          >
            {t.open}
          </button>
        </div>
        {codeError && (
          <p className="mt-2 text-xs" style={{ color: "var(--destructive)" }}>
            {t.codeNotFound}
          </p>
        )}
      </section>

      <section className="mt-7 flex-1">
        <p className="mb-2 text-xs uppercase tracking-widest opacity-60">
          {t.orSearch}
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-full border bg-transparent px-4 py-3 text-sm outline-none"
          style={{ borderColor: "var(--border)" }}
        />

        <ul className="mt-4 space-y-3">
          {results.map((m) => (
            <li key={m.id}>
              <Link
                to="/museum/$id"
                params={{ id: m.id }}
                className="saarthi-card flex gap-3 p-4 transition-transform active:scale-[0.99]"
              >
                <span
                  className="mt-1 h-12 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: ACCENT[m.theme] }}
                />
                <span className="min-w-0">
                  <span className="display block text-base leading-snug">
                    {m.name}
                  </span>
                  <span className="mt-0.5 block text-xs opacity-65">
                    {m.city} · {THEME_LABEL[m.theme]} · {m.exhibits.length}{" "}
                    {t.exhibits.toLowerCase()}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {results.length === 0 && (
            <li className="py-6 text-center text-sm opacity-60">
              {t.noResults}
            </li>
          )}
        </ul>
      </section>
    </ThemeShell>
  );
}
