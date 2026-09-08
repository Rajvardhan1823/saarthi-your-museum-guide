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
