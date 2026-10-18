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
