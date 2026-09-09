export type Lang = "en" | "hi" | "mr";

export const LANGS: { code: Lang; label: string; native: string; bcp: string }[] = [
  { code: "en", label: "English", native: "English", bcp: "en-IN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", bcp: "hi-IN" },
  { code: "mr", label: "Marathi", native: "मराठी", bcp: "mr-IN" },
];

export const LANG_NAME: Record<Lang, string> = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
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
    listening: "Listening…",
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

  hi: {
    tagline: "संग्रहालय में आपका आवाज़ मार्गदर्शक",
    chooseLanguage: "अपनी भाषा चुनें",
    chooseMuseum: "संग्रहालय चुनें",
    searchPlaceholder: "संग्रहालय खोजें…",
    scanQr: "प्रदर्श का QR स्कैन करें",
    scanQrHint: "प्रदर्श के पास लगे QR पर कैमरा रखें",
    orSearch: "या सूची में से चुनें",
    exhibits: "प्रदर्श",
    back: "वापस",
    askAnything: "इसके बारे में कुछ भी पूछिए",
    tapToSpeak: "बोलने के लिए दबाएँ",
    listening: "सुन रहा हूँ…",
    thinking: "सोच रहा हूँ…",
    speaking: "बोल रहा हूँ…",
    typeInstead: "या यहाँ लिखकर पूछें",
    send: "भेजें",
    provider: "सक्रिय वॉइस प्रोवाइडर: Rime",
    noMic: "माइक उपलब्ध नहीं — नीचे लिखकर पूछें।",
    noSpeech: "समझ नहीं आया। फिर कोशिश करें।",
    replay: "फिर सुनें",
    stop: "रोकें",
    introducing: "इस प्रदर्श के बारे में…",
    exhibitsIn: "प्रदर्श —",
    noResults: "कोई संग्रहालय नहीं मिला।",
    enterCode: "QR के नीचे छपा कोड लिखें",
    open: "खोलें",
    codeNotFound: "इस कोड का कोई प्रदर्श नहीं मिला।",
    qrInMuseum: "इस संग्रहालय का QR स्कैन करें",
    qrInMuseumHint: "यहाँ किसी भी प्रदर्श के पास छपा कोड लिखें",
    codeNotInMuseum: "यह कोड किसी दूसरे संग्रहालय का है।",
  },

  mr: {
    tagline: "संग्रहालयातील तुमचा आवाज मार्गदर्शक",
    chooseLanguage: "तुमची भाषा निवडा",
    chooseMuseum: "संग्रहालय निवडा",
    searchPlaceholder: "संग्रहालय शोधा…",
    scanQr: "प्रदर्शाचा QR स्कॅन करा",
    scanQrHint: "प्रदर्शाशेजारील QR वर कॅमेरा धरा",
    orSearch: "किंवा यादीतून निवडा",
    exhibits: "प्रदर्श",
    back: "मागे",
    askAnything: "याविषयी काहीही विचारा",
    tapToSpeak: "बोलण्यासाठी दाबा",
    listening: "ऐकत आहे…",
    thinking: "विचार करत आहे…",
    speaking: "बोलत आहे…",
    typeInstead: "किंवा इथे लिहून विचारा",
    send: "पाठवा",
    provider: "सक्रिय व्हॉइस प्रोव्हायडर: Rime",
    noMic: "माइक उपलब्ध नाही — खाली लिहून विचारा.",
    noSpeech: "नीट ऐकू आले नाही. पुन्हा प्रयत्न करा.",
    replay: "पुन्हा ऐका",
    stop: "थांबा",
    introducing: "या प्रदर्शाविषयी…",
    exhibitsIn: "प्रदर्श —",
    noResults: "कोणतेही संग्रहालय सापडले नाही.",
    enterCode: "QR खाली छापलेला कोड लिहा",
    open: "उघडा",
    codeNotFound: "या कोडचा प्रदर्श सापडला नाही.",
    qrInMuseum: "या संग्रहालयातील QR स्कॅन करा",
    qrInMuseumHint: "इथल्या कोणत्याही प्रदर्शाशेजारी छापलेला कोड लिहा",
    codeNotInMuseum: "हा कोड दुसऱ्या संग्रहालयाचा आहे.",
  },

};
