import { useCallback, useEffect, useState } from "react";
import type { Lang } from "./i18n";

const KEY = "saarthi.lang";

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "en" || stored === "hi" || stored === "mr") {
      setLangState(stored);
      return;
    }
    const nav = window.navigator.language.toLowerCase();
    if (nav.startsWith("mr")) setLangState("mr");
    else if (nav.startsWith("hi")) setLangState("hi");
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(KEY, l);
  }, []);

  return [lang, setLang];
}
