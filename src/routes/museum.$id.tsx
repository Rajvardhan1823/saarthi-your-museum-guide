import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LanguagePills, QrEntry, ThemeShell, TopBar } from "@/components/saarthi";
import {
  cityName,
  exhibitName,
  galleryName,
  museumDesc,
  museumName,
  periodName,
  themeLabel,
} from "@/lib/content-i18n";
import { EXHIBIT_IMAGE } from "@/lib/exhibit-images";
import { T } from "@/lib/i18n";
import { THEME_LABEL, getExhibit, getMuseum } from "@/lib/museums";
import { useLang } from "@/lib/use-lang";

export const Route = createFileRoute("/museum/$id")({
  loader: ({ params }) => {
    const museum = getMuseum(params.id);
    if (!museum) throw notFound();
    return { museum };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [{ title: "Museum — Saarthi" }, { name: "robots", content: "noindex" }],
      };
    const { museum } = loaderData;
    const title = `${museum.name} — Saarthi`;
    return {
      meta: [
        { title },
        { name: "description", content: museum.description },
        { property: "og:title", content: title },
        { property: "og:description", content: museum.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: MuseumPage,
});

function MuseumPage() {
  const { museum } = Route.useLoaderData();
  const [lang, setLang] = useLang();
  const t = T[lang];
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const openCode = () => {
    const c = code.trim().toLowerCase();
    const found = getExhibit(c);
    if (!found) {
      setCodeError(t.codeNotFound);
      return;
    }
    if (found.museum.id !== museum.id) {
      setCodeError(t.codeNotInMuseum);
      return;
    }
    navigate({ to: "/exhibit/$id", params: { id: found.exhibit.id } });
  };

  return (
    <ThemeShell theme={museum.theme}>
      <TopBar
        backTo={{ to: "/" }}
        backLabel={t.back}
        right={<LanguagePills value={lang} onChange={setLang} compact />}
      />

      <div>
        <p className="text-xs uppercase tracking-widest opacity-60">
          {cityName(museum.city, lang)} ·{" "}
          {themeLabel(museum.theme, THEME_LABEL[museum.theme], lang)}
        </p>
        <h1 className="display mt-2 text-[28px] leading-tight">
          {museumName(museum.id, museum.name, lang)}
        </h1>
        <p className="mt-2 text-sm opacity-75">
          {museumDesc(museum.id, museum.description, lang)}
        </p>
      </div>

      <div className="mt-5">
        <QrEntry
          title={t.qrInMuseum}
          hint={t.qrInMuseumHint}
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

      <h2 className="mt-7 text-xs uppercase tracking-widest opacity-60">
        {t.exhibitsIn} {cityName(museum.city, lang)}
      </h2>

      <ul className="mt-3 flex-1 space-y-3">
        {museum.exhibits.map((e) => (
          <li key={e.id}>
            <Link
              to="/exhibit/$id"
              params={{ id: e.id }}
              className="saarthi-card flex gap-3 overflow-hidden p-3 transition-transform active:scale-[0.99]"
            >
              {EXHIBIT_IMAGE[e.id] && (
                <img
                  src={EXHIBIT_IMAGE[e.id]}
                  alt={exhibitName(e.id, e.name, lang)}
                  loading="lazy"
                  width={768}
                  height={512}
                  className="h-20 w-24 shrink-0 rounded-lg object-cover"
                />
              )}
              <span className="min-w-0 self-center">
                <span className="display block text-base leading-snug">
                  {exhibitName(e.id, e.name, lang)}
                </span>
                <span className="mt-1 block text-xs opacity-65">
                  {galleryName(e.gallery, lang)} · {periodName(e.period, lang)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </ThemeShell>
  );
}
