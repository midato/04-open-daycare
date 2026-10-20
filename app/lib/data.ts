export type PostType = "achievement" | "activity" | "announcement";

export interface FeedPost {
  id: string;
  type: PostType;
  authorName: string;
  authorInitial?: string;
  time: string;
  publishedBy: string;
  audience: string;
  body: string;
  photoLabel?: string;
  likes: number;
  comments: number;
}

export const currentUser = {
  name: "Caro Giménez",
  role: "Maestra · Soles",
  initial: "C",
  room: "Sala Soles",
};

export const feedMeta = {
  kidsCount: 12,
  dateLabel: "martes 17 jun",
};

export type AllergyKey = "peanut" | "lactose";

export interface AllergyBadge {
  label: string;
  bg: string;
  fg: string;
}

export type ParentStatus = "active" | "pending";

export interface KidParent {
  id: string;
  name: string;
  role: string;
  status: ParentStatus;
  avatarBg: string;
}

export interface Kid {
  id: string;
  fullName: string;
  initial: string;
  ageLabel: string;
  room: string;
  birthDateLabel: string;
  joinedLabel: string;
  avatarBg: string;
  avatarFg: string;
  allergy?: AllergyKey;
  allergyNotes?: string;
  linkedParents: KidParent[];
}

export const allergyBadges: Record<AllergyKey, AllergyBadge> = {
  peanut: { label: "MANÍ", bg: "#FBD8CC", fg: "#D9684A" },
  lactose: { label: "LACTOSA", bg: "#FBD8CC", fg: "#D9684A" },
};

export const kids: Kid[] = [
  {
    id: "mateo-fernandez",
    fullName: "Mateo Fernández",
    initial: "M",
    ageLabel: "3 años",
    room: "Soles",
    birthDateLabel: "12 mar 2022",
    joinedLabel: "feb 2025",
    avatarBg: "#A9D9E8",
    avatarFg: "#1F7A93",
    allergy: "peanut",
    allergyNotes:
      "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
    linkedParents: [
      {
        id: "lucia-fernandez",
        name: "Lucía Fernández",
        role: "Mamá",
        status: "active",
        avatarBg: "#C9B6E8",
      },
      {
        id: "diego-fernandez",
        name: "Diego Fernández",
        role: "Papá",
        status: "pending",
        avatarBg: "#A9C7E8",
      },
    ],
  },
  {
    id: "sofia-mendez",
    fullName: "Sofía Méndez",
    initial: "S",
    ageLabel: "2 años",
    room: "Soles",
    birthDateLabel: "5 ago 2023",
    joinedLabel: "mar 2025",
    avatarBg: "#F4B8CC",
    avatarFg: "#C44A7A",
    linkedParents: [
      {
        id: "jimena-mendez",
        name: "Jimena Méndez",
        role: "Mamá",
        status: "active",
        avatarBg: "#F4B8CC",
      },
    ],
  },
  {
    id: "benjamin-ruiz",
    fullName: "Benjamín Ruiz",
    initial: "B",
    ageLabel: "3 años",
    room: "Soles",
    birthDateLabel: "21 ene 2022",
    joinedLabel: "ene 2024",
    avatarBg: "#B9DEC4",
    avatarFg: "#3E8B62",
    linkedParents: [
      {
        id: "marta-ruiz",
        name: "Marta Ruiz",
        role: "Mamá",
        status: "active",
        avatarBg: "#B9DEC4",
      },
      {
        id: "hector-ruiz",
        name: "Héctor Ruiz",
        role: "Papá",
        status: "pending",
        avatarBg: "#A9C7E8",
      },
    ],
  },
  {
    id: "valentina-soto",
    fullName: "Valentina Soto",
    initial: "V",
    ageLabel: "2 años",
    room: "Soles",
    birthDateLabel: "9 nov 2023",
    joinedLabel: "abr 2025",
    avatarBg: "#F4DC8E",
    avatarFg: "#9A7B1E",
    linkedParents: [],
  },
  {
    id: "tomas-diaz",
    fullName: "Tomás Díaz",
    initial: "T",
    ageLabel: "3 años",
    room: "Soles",
    birthDateLabel: "28 jun 2022",
    joinedLabel: "sep 2024",
    avatarBg: "#C9B6E8",
    avatarFg: "#7B5FC0",
    allergy: "lactose",
    allergyNotes:
      "Alergia a la lactosa. Colación sin lácteos, revisar etiquetas.",
    linkedParents: [
      {
        id: "paula-diaz",
        name: "Paula Díaz",
        role: "Mamá",
        status: "active",
        avatarBg: "#C9B6E8",
      },
    ],
  },
  {
    id: "emma-castro",
    fullName: "Emma Castro",
    initial: "E",
    ageLabel: "2 años",
    room: "Soles",
    birthDateLabel: "14 abr 2023",
    joinedLabel: "ago 2025",
    avatarBg: "#F4B8CC",
    avatarFg: "#C44A7A",
    linkedParents: [
      {
        id: "natalia-castro",
        name: "Natalia Castro",
        role: "Mamá",
        status: "active",
        avatarBg: "#F4B8CC",
      },
    ],
  },
  {
    id: "lucas-romero",
    fullName: "Lucas Romero",
    initial: "L",
    ageLabel: "3 años",
    room: "Soles",
    birthDateLabel: "3 oct 2022",
    joinedLabel: "mar 2025",
    avatarBg: "#A9D9E8",
    avatarFg: "#1F7A93",
    linkedParents: [
      {
        id: "romina-romero",
        name: "Romina Romero",
        role: "Mamá",
        status: "active",
        avatarBg: "#A9C7E8",
      },
    ],
  },
  {
    id: "olivia-vega",
    fullName: "Olivia Vega",
    initial: "O",
    ageLabel: "2 años",
    room: "Soles",
    birthDateLabel: "17 dic 2023",
    joinedLabel: "jun 2025",
    avatarBg: "#B9DEC4",
    avatarFg: "#3E8B62",
    linkedParents: [
      {
        id: "daniela-vega",
        name: "Daniela Vega",
        role: "Mamá",
        status: "active",
        avatarBg: "#B9DEC4",
      },
    ],
  },
];

export const rooms: string[] = [
  "Soles",
  "Lunas",
  "Estrellas",
  "Nubes",
  "Arcoíris",
  "Mariposas",
  "Peces",
  "Dinosaurios",
  "Globos",
  "Ballenas",
];

export const avatarPalette: { bg: string; fg: string }[] = [
  { bg: "#A9D9E8", fg: "#1F7A93" },
  { bg: "#F4B8CC", fg: "#C44A7A" },
  { bg: "#B9DEC4", fg: "#3E8B62" },
  { bg: "#F4DC8E", fg: "#9A7B1E" },
  { bg: "#C9B6E8", fg: "#7B5FC0" },
  { bg: "#A9C7E8", fg: "#1F7A93" },
];

const spanishMonthAbbreviations = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

function getCompleteMonths(birthDate: Date, reference: Date): number {
  let months =
    (reference.getFullYear() - birthDate.getFullYear()) * 12 +
    (reference.getMonth() - birthDate.getMonth());
  if (reference.getDate() < birthDate.getDate()) {
    months -= 1;
  }
  return Math.max(months, 0);
}

export function slugifyKidId(fullName: string): string {
  const base =
    fullName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "kid";

  let candidate = base;
  let suffix = 2;
  while (kids.some((kid) => kid.id === candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export function computeAgeLabel(birthDate: Date): string {
  const now = new Date();
  const years = now.getFullYear() - birthDate.getFullYear();
  const hadBirthday =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() &&
      now.getDate() >= birthDate.getDate());

  if (hadBirthday) {
    return years === 1 ? "1 año" : `${years} años`;
  }

  const ageInYears = years - 1;
  if (ageInYears >= 1) {
    return ageInYears === 1 ? "1 año" : `${ageInYears} años`;
  }

  const months = getCompleteMonths(birthDate, now);
  if (months <= 0) {
    return "Menos de 1 mes";
  }
  return months === 1 ? "1 mes" : `${months} meses`;
}

export function formatBirthDateLabel(birthDate: Date): string {
  const day = birthDate.getDate();
  const month = spanishMonthAbbreviations[birthDate.getMonth()];
  return `${day} ${month} ${birthDate.getFullYear()}`;
}

export function formatJoinedLabel(date: Date): string {
  const month = spanishMonthAbbreviations[date.getMonth()];
  return `${month} ${date.getFullYear()}`;
}

export const posts: FeedPost[] = [
  {
    id: "post-1",
    type: "achievement",
    authorName: "Mateo",
    authorInitial: "M",
    time: "14:20",
    publishedBy: "publicado por vos",
    audience: "Para: familia de Mateo",
    body: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    likes: 3,
    comments: 1,
  },
  {
    id: "post-2",
    type: "activity",
    authorName: "Mateo",
    authorInitial: "M",
    time: "09:40",
    publishedBy: "publicado por vos",
    audience: "Para: familia de Mateo",
    body: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoLabel: "Foto · pintando con témperas",
    likes: 5,
    comments: 2,
  },
  {
    id: "post-3",
    type: "announcement",
    authorName: "Anuncio general",
    time: "07:50",
    publishedBy: "publicado por vos",
    audience: "Para: toda la sala",
    body: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    likes: 8,
    comments: 0,
  },
];

export const loginDefaults = {
  email: "caro@opendaycare.com",
};

export const invitation = {
  code: "7K4P9",
  email: "lucia.fernandez@gmail.com",
  password: "contraseña",
  childName: "Mateo",
  roomLabel: "Sala Soles",
  initial: "M",
  avatarBg: "#A9D9E8",
  avatarFg: "#1F7A93",
};
