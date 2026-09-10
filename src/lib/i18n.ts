export type Lang = "en";

export const LANGS: { code: Lang; label: string; native: string; bcp: string }[] = [
  { code: "en", label: "English", native: "English", bcp: "en-IN" },
];

export const LANG_NAME: Record<Lang, string> = {
  en: "English",
};

type Dict = {
  tagline: string;
  chooseLanguage: string;
  chooseMuseum: string;
  searchPlaceholder: string;
  scanQr: string;
  scanQrHint: string;
  orSearch: string;
  exhibits: string;
  back: string;
  askAnything: string;
  tapToSpeak: string;
  listening: string;
  thinking: string;
  speaking: string;
  typeInstead: string;
  send: string;
  provider: string;
  noMic: string;
  noSpeech: string;
  replay: string;
  stop: string;
  introducing: string;
  exhibitsIn: string;
  noResults: string;
  enterCode: string;
  open: string;
  codeNotFound: string;
  qrInMuseum: string;
  qrInMuseumHint: string;
  codeNotInMuseum: string;
};


export const T: Record<Lang, Dict> = {
  en: {
    tagline: "Your voice guide through the museum",
    chooseLanguage: "Choose your language",
    chooseMuseum: "Choose a museum",
    searchPlaceholder: "Search museums…",
    scanQr: "Scan exhibit QR",
    scanQrHint: "Point your camera at the QR beside an exhibit",
    orSearch: "or browse the list",
    exhibits: "Exhibits",
    back: "Back",
    askAnything: "Ask me anything about this",
    tapToSpeak: "Tap to speak",
    listening: "Listening — tap the mic again to stop",
    thinking: "Thinking…",
    speaking: "Speaking…",
    typeInstead: "Type your question instead",
    send: "Send",
    provider: "Active voice provider: Rime",
    noMic: "Microphone unavailable — type your question below.",
    noSpeech: "Didn't catch that. Try again.",
    replay: "Replay",
    stop: "Stop",
    introducing: "Introducing this exhibit…",
    exhibitsIn: "Exhibits in",
    noResults: "No museums match that search.",
    enterCode: "Enter the code printed under the QR",
    open: "Open",
    codeNotFound: "No exhibit found for that code.",
    qrInMuseum: "Scan a QR in this museum",
    qrInMuseumHint: "Enter the code printed beside any exhibit here",
    codeNotInMuseum: "That code belongs to another museum.",
  },
};
