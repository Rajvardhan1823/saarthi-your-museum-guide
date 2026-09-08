export type ThemeKey =
  | "art_gallery"
  | "history_museum"
  | "science_museum"
  | "heritage_site";

export type Exhibit = {
  id: string;
  museumId: string;
  name: string;
  gallery: string;
  period: string;
  context: string;
};

export type Museum = {
  id: string;
  name: string;
  city: string;
  description: string;
  theme: ThemeKey;
  exhibits: Exhibit[];
};

export const THEME_LABEL: Record<ThemeKey, string> = {
  art_gallery: "Art Gallery",
  history_museum: "History Museum",
  science_museum: "Science Museum",
  heritage_site: "Heritage Site",
};

export const THEME_TONE: Record<ThemeKey, string> = {
  art_gallery:
    "Speak like a gallery curator: evocative and sensory. Lead with composition, brushwork, colour, mood and the artist's intent.",
  history_museum:
    "Speak like a historian: chronological and factual. Lead with dates, dynasties, rulers, material culture and historical context.",
  science_museum:
    "Speak like an enthusiastic science communicator: crisp, curious, mechanism-first. Lead with how it works and why it matters, with a simple analogy.",
  heritage_site:
    "Speak like a heritage guide standing at the site: grounded and atmospheric. Lead with stone, craft, place, legend and the people who built it.",
};

const m = (
  museumId: string,
  list: Array<Omit<Exhibit, "museumId" | "id"> & { id: string }>,
): Exhibit[] => list.map((e) => ({ ...e, museumId }));

export const MUSEUMS: Museum[] = [
  {
    id: "csmvs",
    name: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
    city: "Mumbai",
    description:
      "Indo-Saracenic galleries holding sculpture, miniature painting and Maratha-era arms.",
    theme: "history_museum",
    exhibits: m("csmvs", [
      {
        id: "chola-nataraja",
        name: "Chola Bronze Nataraja",
        gallery: "Sculpture Gallery",
        period: "11th century CE, Chola dynasty",
        context:
          "A lost-wax cast bronze of Shiva as Nataraja, lord of dance, made under the Chola dynasty in Tamil Nadu around the 11th century. Shiva dances the Ananda Tandava inside a ring of flames (prabhavali) representing the cosmos. His upper right hand holds the damaru drum (creation), the upper left holds agni (destruction), the lower right is in abhaya mudra (fearlessness) and the lower left points to his raised foot (release). He tramples the dwarf Apasmara, symbolising ignorance. Chola bronzes were processional images, carried through streets during temple festivals, which is why the base has lugs for poles.",
      },
      {
        id: "maratha-armour",
        name: "Maratha Chilta Hazar Masa Armour",
        gallery: "Arms & Armour Gallery",
        period: "17th–18th century CE",
        context:
          "A coat of 'a thousand nails' — quilted fabric reinforced with overlapping steel plates and brass rivets, worn by Maratha cavalry. Light enough for the fast-moving ganimi kava (guerrilla) tactics used under Chhatrapati Shivaji Maharaj, unlike the heavier Mughal plate. Often paired with a khanda or pata sword and a small dhal shield of rhino or buffalo hide.",
      },
      {
        id: "indus-seal",
        name: "Indus Valley Steatite Seal",
        gallery: "Indus Civilisation Gallery",
        period: "c. 2500 BCE",
        context:
          "A small carved steatite seal from the Harappan civilisation, showing a unicorn-like bull before a ritual standard, with a line of undeciphered Indus script above. Seals were pressed into clay to mark goods traded as far as Mesopotamia. Roughly 400 signs are known; the script has never been read because there is no bilingual key.",
      },
      {
        id: "mughal-miniature",
        name: "Akbarnama Miniature Folio",
        gallery: "Miniature Painting Gallery",
        period: "c. 1590 CE, Mughal",
        context:
          "A folio from an illustrated Akbarnama, painted in opaque watercolour and gold on paper. Mughal workshops worked collaboratively — one artist for composition, one for colouring, a portrait specialist for faces. The high horizon, crowded court scene and Persian-derived palette blend Persian technique with Indian observation.",
      },
    ]),
  },
  {
    id: "ngma-mumbai",
    name: "National Gallery of Modern Art",
    city: "Mumbai",
    description:
      "A domed rotunda of modern Indian painting, from Bengal School revivalism to the Progressives.",
    theme: "art_gallery",
    exhibits: m("ngma-mumbai", [
      {
        id: "bharat-mata",
        name: "Bharat Mata (after Abanindranath)",
        gallery: "Bengal School",
        period: "Early 20th century",
        context:
          "A saffron-robed four-armed figure holding cloth, book, sheaf of paddy and rosary, painted in the wash technique Abanindranath Tagore adapted from Japanese nihonga. Deliberately soft-edged and small in scale as a rejection of academic oil painting taught in colonial art schools.",
      },
      {
        id: "husain-horses",
        name: "Horses (Husain idiom)",
        gallery: "Progressive Artists' Group",
        period: "Mid 20th century",
        context:
          "Charging horses reduced to sweeping black outline and flat planes of ochre and vermilion. The motif draws on Karbala tazia processions, Chinese Sung brushwork and terracotta votive horses. Energy is carried entirely by line speed rather than modelling.",
      },
      {
        id: "raza-bindu",
        name: "Bindu",
        gallery: "Progressive Artists' Group",
        period: "1980s",
        context:
          "A single black circle anchoring concentric bands of pure colour. Raza's bindu is the seed point of concentration from his childhood, restated as geometry — the canvas is meant to be read as a meditation diagram, not a landscape.",
      },
    ]),
  },
  {
    id: "nehru-science",
    name: "Nehru Science Centre",
    city: "Mumbai",
    description:
      "India's largest interactive science centre — hands-on mechanics, light and energy galleries.",
    theme: "science_museum",
    exhibits: m("nehru-science", [
      {
        id: "foucault-pendulum",
        name: "Foucault Pendulum",
        gallery: "Atrium",
        period: "Principle demonstrated 1851",
        context:
          "A heavy bob on a long wire swinging in a fixed plane while the floor beneath rotates with the Earth. The apparent rotation rate depends on latitude — full 360° per day at the poles, none at the equator, and about 24 hours divided by sine of latitude in Mumbai. It was the first non-astronomical proof that the Earth spins.",
      },
      {
        id: "vandegraaff",
        name: "Van de Graaff Generator",
        gallery: "Energy Ball Hall",
        period: "Invented 1929",
        context:
          "A moving rubber belt carries charge to a hollow metal dome, building hundreds of thousands of volts at very low current — enough to make hair stand up, harmless because almost no charge flows. Charge sits on the outside surface of the sphere, which is also why a car is safe in lightning.",
      },
      {
        id: "bernoulli-blower",
        name: "Bernoulli Ball Blower",
        gallery: "Mechanics Gallery",
        period: "Principle 1738",
        context:
          "A ball hovers in a tilted air jet. Faster-moving air in the jet has lower pressure, so whenever the ball drifts out, higher-pressure still air pushes it back in. The same pressure difference lifts an aircraft wing and curves a swing bowler's delivery.",
      },
    ]),
  },
  {
    id: "ajanta",
    name: "Ajanta Caves",
    city: "Aurangabad",
    description:
      "Thirty rock-cut Buddhist caves in a basalt horseshoe gorge above the Waghora river.",
    theme: "heritage_site",
    exhibits: m("ajanta", [
      {
        id: "cave-1-padmapani",
        name: "Padmapani Bodhisattva, Cave 1",
        gallery: "Cave 1",
        period: "c. 5th century CE, Vakataka",
        context:
          "A mural of the lotus-bearing bodhisattva painted in mineral pigment over a mud-and-rice-husk plaster ground. The downcast eyes and slight tribhanga bend express karuna — compassion at the moment of turning back from nirvana to help others. Painted by lamplight inside a windowless hall.",
      },
      {
        id: "cave-26-parinirvana",
        name: "Parinirvana Buddha, Cave 26",
        gallery: "Cave 26",
        period: "c. late 5th century CE",
        context:
          "A seven-metre reclining Buddha carved from the living basalt of the cave wall, showing the moment of final passing. Mourners crowd below while celestial beings rejoice above — one carving holding two responses to death at once.",
      },
      {
        id: "chaitya-window",
        name: "Chaitya Arch, Cave 19",
        gallery: "Cave 19",
        period: "c. 5th century CE",
        context:
          "The horseshoe-shaped sun window over the facade, descended in shape from wooden barrel-vaulted halls that no longer survive. It throws a shaft of light down the nave onto the stupa, so the object of worship is lit while the aisles stay dark.",
      },
    ]),
  },
];

export const getMuseum = (id: string) => MUSEUMS.find((x) => x.id === id);

export const getExhibit = (id: string) => {
  for (const museum of MUSEUMS) {
    const exhibit = museum.exhibits.find((e) => e.id === id);
    if (exhibit) return { museum, exhibit };
  }
  return null;
};
