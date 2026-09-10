import { useCallback, useEffect, useState } from "react";
import type { Lang } from "./i18n";

const KEY = "saarthi.lang";

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "en") {
      setLangState(stored);
      return;
    }
    window.localStorage.removeItem(KEY);
    const nav = window.navigator.language.toLowerCase();
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(KEY, l);
  }, []);

  return [lang, setLang];
}
