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
