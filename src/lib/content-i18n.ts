import type { Lang } from "./i18n";
import type { ThemeKey } from "./museums";

type Tri = { hi: string; mr: string };

/** Hindi / Marathi renderings of museum + exhibit content. English is the source. */
const MUSEUM_NAME: Record<string, Tri> = {
  csmvs: {
    hi: "छत्रपति शिवाजी महाराज वस्तु संग्रहालय",
    mr: "छत्रपती शिवाजी महाराज वस्तु संग्रहालय",
  },
  "ngma-mumbai": {
    hi: "राष्ट्रीय आधुनिक कला दीर्घा",
    mr: "राष्ट्रीय आधुनिक कला दालन",
  },
  "nehru-science": { hi: "नेहरू विज्ञान केंद्र", mr: "नेहरू विज्ञान केंद्र" },
  ajanta: { hi: "अजंता गुफाएँ", mr: "अजिंठा लेणी" },
};

const MUSEUM_DESC: Record<string, Tri> = {
  csmvs: {
    hi: "इंडो-सारासेनिक दीर्घाएँ — मूर्तिकला, लघुचित्र और मराठाकालीन शस्त्र।",
    mr: "इंडो-सारासेनिक दालने — शिल्प, लघुचित्रे आणि मराठाकालीन शस्त्रे.",
  },
  "ngma-mumbai": {
    hi: "आधुनिक भारतीय चित्रकला — बंगाल स्कूल से प्रोग्रेसिव्स तक।",
    mr: "आधुनिक भारतीय चित्रकला — बंगाल स्कूलपासून प्रोग्रेसिव्हपर्यंत.",
  },
  "nehru-science": {
    hi: "भारत का सबसे बड़ा इंटरैक्टिव विज्ञान केंद्र — यांत्रिकी, प्रकाश और ऊर्जा।",
    mr: "भारतातील सर्वात मोठे परस्परसंवादी विज्ञान केंद्र — यांत्रिकी, प्रकाश व ऊर्जा.",
  },
  ajanta: {
    hi: "वाघोरा नदी के ऊपर बेसाल्ट घाटी में तीस शैलकृत बौद्ध गुफाएँ।",
    mr: "वाघोरा नदीवरील बेसाल्ट दरीत कोरलेली तीस बौद्ध लेणी.",
  },
};

const CITY: Record<string, Tri> = {
  Mumbai: { hi: "मुंबई", mr: "मुंबई" },
  Aurangabad: { hi: "औरंगाबाद", mr: "छत्रपती संभाजीनगर" },
};

const THEME: Record<ThemeKey, Tri> = {
  art_gallery: { hi: "कला दीर्घा", mr: "कला दालन" },
  history_museum: { hi: "इतिहास संग्रहालय", mr: "इतिहास संग्रहालय" },
  science_museum: { hi: "विज्ञान केंद्र", mr: "विज्ञान केंद्र" },
  heritage_site: { hi: "विरासत स्थल", mr: "वारसा स्थळ" },
};

const EXHIBIT_NAME: Record<string, Tri> = {
  "chola-nataraja": { hi: "चोल कांस्य नटराज", mr: "चोल कांस्य नटराज" },
  "maratha-armour": {
    hi: "मराठा चिल्ता हज़ार मासा कवच",
    mr: "मराठा चिलखत — हजार मासा",
  },
  "indus-seal": { hi: "सिंधु घाटी की मुहर", mr: "सिंधू संस्कृतीची मुद्रा" },
  "mughal-miniature": { hi: "अकबरनामा लघुचित्र", mr: "अकबरनामा लघुचित्र" },
  "bharat-mata": { hi: "भारत माता", mr: "भारत माता" },
  "husain-horses": { hi: "अश्व (हुसैन शैली)", mr: "अश्व (हुसेन शैली)" },
  "raza-bindu": { hi: "बिंदु", mr: "बिंदू" },
  "foucault-pendulum": { hi: "फूको लोलक", mr: "फूको लंबक" },
  vandegraaff: { hi: "वैन डे ग्राफ जनरेटर", mr: "व्हॅन डी ग्राफ जनरेटर" },
  "bernoulli-blower": { hi: "बर्नूली वायु गोला", mr: "बर्नूली वायु चेंडू" },
  "cave-1-padmapani": {
    hi: "पद्मपाणि बोधिसत्त्व, गुफा १",
    mr: "पद्मपाणी बोधिसत्त्व, लेणे १",
  },
  "cave-26-parinirvana": {
    hi: "परिनिर्वाण बुद्ध, गुफा २६",
    mr: "परिनिर्वाण बुद्ध, लेणे २६",
  },
  "chaitya-window": { hi: "चैत्य गवाक्ष, गुफा १९", mr: "चैत्य गवाक्ष, लेणे १९" },
};

const GALLERY: Record<string, Tri> = {
  "Sculpture Gallery": { hi: "मूर्तिकला दीर्घा", mr: "शिल्प दालन" },
  "Arms & Armour Gallery": { hi: "शस्त्र एवं कवच दीर्घा", mr: "शस्त्र व चिलखत दालन" },
  "Indus Civilisation Gallery": { hi: "सिंधु सभ्यता दीर्घा", mr: "सिंधू संस्कृती दालन" },
  "Miniature Painting Gallery": { hi: "लघुचित्र दीर्घा", mr: "लघुचित्र दालन" },
  "Bengal School": { hi: "बंगाल स्कूल", mr: "बंगाल स्कूल" },
  "Progressive Artists' Group": {
    hi: "प्रोग्रेसिव आर्टिस्ट्स ग्रुप",
    mr: "प्रोग्रेसिव्ह आर्टिस्ट्स ग्रुप",
  },
  Atrium: { hi: "अलिंद", mr: "प्रांगण" },
  "Energy Ball Hall": { hi: "ऊर्जा हॉल", mr: "ऊर्जा सभागृह" },
  "Mechanics Gallery": { hi: "यांत्रिकी दीर्घा", mr: "यांत्रिकी दालन" },
  "Cave 1": { hi: "गुफा १", mr: "लेणे १" },
  "Cave 26": { hi: "गुफा २६", mr: "लेणे २६" },
  "Cave 19": { hi: "गुफा १९", mr: "लेणे १९" },
};

const PERIOD: Record<string, Tri> = {
  "11th century CE, Chola dynasty": {
    hi: "११वीं सदी, चोल राजवंश",
    mr: "११वे शतक, चोल राजवंश",
  },
  "17th–18th century CE": { hi: "१७वीं–१८वीं सदी", mr: "१७वे–१८वे शतक" },
  "c. 2500 BCE": { hi: "लगभग २५०० ईसा पूर्व", mr: "सुमारे २५०० इ.स.पू." },
  "c. 1590 CE, Mughal": { hi: "लगभग १५९० ई., मुग़ल", mr: "सुमारे १५९० इ.स., मुघल" },
  "Early 20th century": { hi: "२०वीं सदी का आरंभ", mr: "२०व्या शतकाची सुरुवात" },
  "Mid 20th century": { hi: "२०वीं सदी का मध्य", mr: "२०व्या शतकाचा मध्य" },
  "1980s": { hi: "१९८० का दशक", mr: "१९८० चे दशक" },
  "Principle demonstrated 1851": {
    hi: "सिद्धांत १८५१ में प्रदर्शित",
    mr: "सिद्धांत १८५१ मध्ये सिद्ध",
  },
  "Invented 1929": { hi: "आविष्कार १९२९", mr: "शोध १९२९" },
  "Principle 1738": { hi: "सिद्धांत १७३८", mr: "सिद्धांत १७३८" },
  "c. 5th century CE, Vakataka": {
    hi: "लगभग ५वीं सदी, वाकाटक",
    mr: "सुमारे ५वे शतक, वाकाटक",
  },
  "c. late 5th century CE": { hi: "५वीं सदी का उत्तरार्ध", mr: "५व्या शतकाचा उत्तरार्ध" },
  "c. 5th century CE": { hi: "लगभग ५वीं सदी", mr: "सुमारे ५वे शतक" },
};

const pick = (table: Record<string, Tri>, key: string, en: string, lang: Lang) =>
  lang === "en" ? en : (table[key]?.[lang] ?? en);

export const museumName = (id: string, en: string, lang: Lang) =>
  pick(MUSEUM_NAME, id, en, lang);
export const museumDesc = (id: string, en: string, lang: Lang) =>
  pick(MUSEUM_DESC, id, en, lang);
export const cityName = (en: string, lang: Lang) => pick(CITY, en, en, lang);
export const themeLabel = (theme: ThemeKey, en: string, lang: Lang) =>
  lang === "en" ? en : (THEME[theme]?.[lang] ?? en);
export const exhibitName = (id: string, en: string, lang: Lang) =>
  pick(EXHIBIT_NAME, id, en, lang);
export const galleryName = (en: string, lang: Lang) => pick(GALLERY, en, en, lang);
export const periodName = (en: string, lang: Lang) => pick(PERIOD, en, en, lang);
