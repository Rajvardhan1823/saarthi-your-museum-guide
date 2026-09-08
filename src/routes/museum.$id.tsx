import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { LanguagePills, ThemeShell, TopBar } from "@/components/saarthi";
import { T } from "@/lib/i18n";
import { THEME_LABEL, getMuseum } from "@/lib/museums";
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

  return (
    <ThemeShell theme={museum.theme}>
      <TopBar backTo={{ to: "/" }} backLabel={t.back} />

      <div>
        <p className="text-xs uppercase tracking-widest opacity-60">
          {museum.city} · {THEME_LABEL[museum.theme]}
        </p>
        <h1 className="display mt-2 text-[28px] leading-tight">{museum.name}</h1>
        <p className="mt-2 text-sm opacity-75">{museum.description}</p>
      </div>

      <div className="mt-5">
        <LanguagePills value={lang} onChange={setLang} compact />
      </div>

      <h2 className="mt-7 text-xs uppercase tracking-widest opacity-60">
        {t.exhibitsIn} {museum.city}
      </h2>

      <ul className="mt-3 flex-1 space-y-3">
        {museum.exhibits.map((e) => (
          <li key={e.id}>
            <Link
              to="/exhibit/$id"
              params={{ id: e.id }}
              className="saarthi-card block p-4 transition-transform active:scale-[0.99]"
            >
              <span className="display block text-base leading-snug">
                {e.name}
              </span>
              <span className="mt-1 block text-xs opacity-65">
                {e.gallery} · {e.period}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </ThemeShell>
  );
}
