import "server-only";

import { cookies } from "next/headers";
import {
  avatarPalette,
  computeAgeLabel,
  formatBirthDateLabel,
  formatJoinedLabel,
  type AllergyKey,
  type Kid,
} from "@/app/lib/data";
import { createClient as createServerClient } from "@/utils/supabase/server";

export type KidsDataError =
  | "unauthenticated"
  | "profile-unavailable"
  | "daycare-unavailable"
  | "insufficient-role"
  | "rooms-unavailable"
  | "children-unavailable";

export interface RoomRecord {
  id: string;
  name: string;
}

export interface ChildRecord {
  id: string;
  roomId: string;
  fullName: string;
  birthDate: string;
  enrolledAt: string;
  medicalNotes: string | null;
  allergyTags: string[];
  photoConsent: boolean;
  status: "active" | "archived";
}

export interface KidsPageData {
  rooms: RoomRecord[];
  children: ChildRecord[];
  error: KidsDataError | null;
}

export interface KidDetailData {
  room: RoomRecord | null;
  child: ChildRecord | null;
  error: KidsDataError | null;
}

type UserProfile = {
  daycare_id: string | null;
  role: "staff" | "parent" | "admin";
};

type RoomRow = {
  id: string;
  name: string;
};

type ChildRow = {
  id: string;
  room_id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes: string | null;
  allergy_tags: string[];
  photo_consent: boolean;
  status: "active" | "archived";
};

const allergyLabels: Record<string, string> = {
  peanut: "Maní",
  lactose: "Lactosa",
  gluten: "Gluten",
  egg: "Huevo",
  soy: "Soya",
  tree_nut: "Nueces",
  shellfish: "Mariscos",
};

type ServerSupabaseClient = ReturnType<typeof createServerClient>;

type AuthorizedContext =
  | { supabase: ServerSupabaseClient; daycareId: string }
  | { error: KidsDataError };

async function getAuthorizedContext(): Promise<AuthorizedContext> {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return { error: "unauthenticated" };
  }

  const { data: profileData, error: profileError } = await supabase
    .from("user")
    .select("daycare_id, role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profileData) {
    return { error: "profile-unavailable" };
  }

  const profile = profileData as UserProfile;
  if (!profile.daycare_id) {
    return { error: "daycare-unavailable" };
  }

  if (profile.role !== "staff" && profile.role !== "admin") {
    return { error: "insufficient-role" };
  }

  return { supabase, daycareId: profile.daycare_id };
}

function mapChildRow(child: ChildRow): ChildRecord {
  return {
    id: child.id,
    roomId: child.room_id,
    fullName: child.full_name,
    birthDate: child.birth_date,
    enrolledAt: child.enrolled_at,
    medicalNotes: child.medical_notes,
    allergyTags: child.allergy_tags,
    photoConsent: child.photo_consent,
    status: child.status,
  };
}

function parseDatabaseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function toKidViewModel(
  child: ChildRecord,
  roomName: string,
  index: number,
): Kid {
  const birthDate = parseDatabaseDate(child.birthDate);
  const enrolledAt = parseDatabaseDate(child.enrolledAt);
  const allergy = child.allergyTags.find(
    (tag): tag is AllergyKey => tag === "peanut" || tag === "lactose",
  );
  const allergyNotes = [
    child.allergyTags
      .map((tag) => allergyLabels[tag] ?? tag)
      .filter(Boolean)
      .join(", "),
    child.medicalNotes,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
  const avatar = avatarPalette[index % avatarPalette.length];

  return {
    id: child.id,
    fullName: child.fullName,
    initial: child.fullName.charAt(0).toUpperCase(),
    ageLabel: computeAgeLabel(birthDate),
    room: roomName,
    birthDateLabel: formatBirthDateLabel(birthDate),
    joinedLabel: formatJoinedLabel(enrolledAt),
    avatarBg: avatar.bg,
    avatarFg: avatar.fg,
    allergy,
    allergyNotes: allergyNotes || undefined,
    linkedParents: [],
  };
}

export async function getKidsPageData(): Promise<KidsPageData> {
  const context = await getAuthorizedContext();
  if ("error" in context) {
    return { rooms: [], children: [], error: context.error };
  }

  const { supabase, daycareId } = context;
  const { data: roomData, error: roomsError } = await supabase
    .from("room")
    .select("id, name")
    .eq("daycare_id", daycareId)
    .order("name");

  if (roomsError) {
    return { rooms: [], children: [], error: "rooms-unavailable" };
  }

  const { data: childData, error: childrenError } = await supabase
    .from("child")
    .select(
      "id, room_id, full_name, birth_date, enrolled_at, medical_notes, allergy_tags, photo_consent, status",
    )
    .eq("status", "active")
    .order("full_name");

  if (childrenError) {
    return {
      rooms: (roomData ?? []) as RoomRow[],
      children: [],
      error: "children-unavailable",
    };
  }

  return {
    rooms: (roomData ?? []) as RoomRow[],
    children: ((childData ?? []) as ChildRow[]).map(mapChildRow),
    error: null,
  };
}

export async function getKidDetailData(id: string): Promise<KidDetailData> {
  const context = await getAuthorizedContext();
  if ("error" in context) {
    return { room: null, child: null, error: context.error };
  }

  const { supabase, daycareId } = context;
  const { data: childData, error: childError } = await supabase
    .from("child")
    .select(
      "id, room_id, full_name, birth_date, enrolled_at, medical_notes, allergy_tags, photo_consent, status",
    )
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (childError) {
    return { room: null, child: null, error: "children-unavailable" };
  }

  if (!childData) {
    return { room: null, child: null, error: null };
  }

  const child = mapChildRow(childData as ChildRow);
  const { data: roomData, error: roomError } = await supabase
    .from("room")
    .select("id, name")
    .eq("id", child.roomId)
    .eq("daycare_id", daycareId)
    .maybeSingle();

  if (roomError || !roomData) {
    return { room: null, child: null, error: "rooms-unavailable" };
  }

  return {
    room: roomData as RoomRecord,
    child,
    error: null,
  };
}
