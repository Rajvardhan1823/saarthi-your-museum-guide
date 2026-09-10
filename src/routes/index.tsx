import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import homeBackground from "@/assets/saarthi-home-background.png";
import { LanguagePills, Logo, QrEntry, ThemeShell } from "@/components/saarthi";
import { cityName, museumName, themeLabel } from "@/lib/content-i18n";
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
          "Scan an exhibit QR or search a museum and ask Saarthi anything, out loud, in English.",
      },
      { property: "og:title", content: "Saarthi — Museum voice guide" },
      {
        property: "og:description",
        content:
          "Ask any exhibit anything, out loud, in English.",
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
  const [codeError, setCodeError] = useState<string | null>(null);
  const navigate = useNavigate();
  const t = T[lang as Lang];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MUSEUMS;
    return MUSEUMS.filter((m) =>
      `${m.name} ${museumName(m.id, m.name, lang)} ${m.city} ${THEME_LABEL[m.theme]}`
        .toLowerCase()
        .includes(q),
    );
  }, [query, lang]);

  const openCode = () => {
    const c = code.trim().toLowerCase();
    if (getExhibit(c)) {
      navigate({ to: "/exhibit/$id", params: { id: c } });
    } else {
      setCodeError(t.codeNotFound);
    }
  };

  return (
    <ThemeShell theme="history_museum" backgroundImage={homeBackground}>
      <div className="pt-8">
        <Logo className="h-14 -ml-2" />
        <h1 className="display mt-4 text-3xl leading-tight">{t.tagline}</h1>
      </div>

      <section className="mt-7">
        <p className="mb-2 text-xs uppercase tracking-widest opacity-60">
          {t.chooseLanguage}
        </p>
        <LanguagePills value={lang} onChange={setLang} />
      </section>

      <div className="mt-6">
        <QrEntry
          title={t.scanQr}
          hint={t.scanQrHint}
          placeholder={t.enterCode}
          openLabel={t.open}
          error={codeError}
          value={code}
          onChange={(v) => {
            setCode(v);
            setCodeError(null);
          }}
          onOpen={openCode}
        />
      </div>

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
                    {museumName(m.id, m.name, lang)}
                  </span>
                  <span className="mt-0.5 block text-xs opacity-65">
                    {cityName(m.city, lang)} ·{" "}
                    {themeLabel(m.theme, THEME_LABEL[m.theme], lang)} ·{" "}
                    {m.exhibits.length} {t.exhibits.toLowerCase()}
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
