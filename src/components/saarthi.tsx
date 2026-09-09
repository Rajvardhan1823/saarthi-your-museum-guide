import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/saarthi-logo.png.asset.json";
import { LANGS, type Lang } from "@/lib/i18n";
import type { ThemeKey } from "@/lib/museums";

export function ThemeShell({
  theme,
  children,
}: {
  theme: ThemeKey;
  children: ReactNode;
}) {
  return (
    <div
      data-theme={theme}
      className="min-h-screen transition-colors duration-500"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10">
        {children}
      </div>
    </div>
  );
}

export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="Saarthi"
      className={`${className} w-auto object-contain mix-blend-multiply dark:mix-blend-normal`}
      style={{ mixBlendMode: "multiply" }}
    />
  );
}

/** Logo tinted to the active theme so it never reads as a pasted-on element. */
export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="grid place-items-center rounded-full"
        style={{
          width: small ? 30 : 38,
          height: small ? 30 : 38,
          backgroundColor: "var(--brand)",
        }}
      >
        <span
          className="block rounded-full"
          style={{
            width: small ? 11 : 14,
            height: small ? 11 : 14,
            border: "2.5px solid var(--brand-foreground)",
            borderBottomColor: "transparent",
            transform: "rotate(-35deg)",
          }}
        />
      </span>
      <span
        className="display leading-none"
        style={{ fontSize: small ? 20 : 25, letterSpacing: "0.01em" }}
      >
        saarthi
      </span>
    </div>
  );
}

export function LanguagePills({
  value,
  onChange,
  compact = false,
}: {
  value: Lang;
  onChange: (l: Lang) => void;
  compact?: boolean;
}) {
  return (
    <div
      className="flex gap-2"
      role="group"
      aria-label="Language"
      style={{ fontFamily: "var(--body-font)" }}
    >
      {LANGS.map((l) => {
        const active = l.code === value;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange(l.code)}
            className={`flex-1 rounded-full border px-3 transition-colors ${
              compact ? "py-1.5 text-xs" : "py-3 text-sm"
            }`}
            style={{
              backgroundColor: active ? "var(--brand)" : "transparent",
              color: active ? "var(--brand-foreground)" : "var(--foreground)",
              borderColor: active ? "var(--brand)" : "var(--border)",
              fontWeight: active ? 600 : 500,
            }}
          >
            {compact ? l.native : `${l.native}`}
            {!compact && (
              <span className="block text-[11px] opacity-60">{l.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TopBar({
  backTo,
  backLabel,
  right,
}: {
  backTo?: { to: string; params?: Record<string, string> };
  backLabel?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-3 py-4">
      {backTo ? (
        <Link
          to={backTo.to}
          params={backTo.params as never}
          className="text-sm opacity-75 hover:opacity-100"
        >
          ← {backLabel}
        </Link>
      ) : (
        <BrandMark small />
      )}
      {right}
    </header>
  );
}

/** Siri-style breathing orb shown while Saarthi is thinking or speaking. */
export function SiriOrb({
  active,
  size = 96,
}: {
  active: boolean;
  size?: number;
}) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className={`siri-ring absolute inset-0 rounded-full ${active ? "" : "siri-paused"}`}
      />
      <span
        className={`siri-blob siri-blob-a absolute inset-[10%] rounded-full ${active ? "" : "siri-paused"}`}
      />
      <span
        className={`siri-blob siri-blob-b absolute inset-[18%] rounded-full ${active ? "" : "siri-paused"}`}
      />
      <span
        className={`siri-blob siri-blob-c absolute inset-[26%] rounded-full ${active ? "" : "siri-paused"}`}
      />
    </div>
  );
}

/** QR / printed-code entry, reused on the home screen and inside each museum. */
export function QrEntry({
  title,
  hint,
  placeholder,
  openLabel,
  error,
  value,
  onChange,
  onOpen,
}: {
  title: string;
  hint: string;
  placeholder: string;
  openLabel: string;
  error?: string | null;
  value: string;
  onChange: (v: string) => void;
  onOpen: () => void;
}) {
  return (
    <section className="saarthi-card p-4">
      <div className="flex items-start gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
          style={{
            backgroundColor: "color-mix(in oklab, var(--brand) 18%, transparent)",
            color: "var(--brand)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm8-2h3v3h-3v-3Zm5 0h3v3h-3v-3Zm-5 5h3v3h-3v-3Zm5 0h3v3h-3v-3Z" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="display text-lg leading-snug">{title}</p>
          <p className="mt-1 text-sm opacity-70">{hint}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg border bg-transparent px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--border)" }}
        />
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold"
          style={{
            backgroundColor: "var(--brand)",
            color: "var(--brand-foreground)",
          }}
        >
          {openLabel}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs" style={{ color: "var(--destructive)" }}>
          {error}
        </p>
      )}
    </section>
  );
}

