"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/utils/supabase/server";

export type AddKidResult =
  | { ok: true }
  | {
      ok: false;
      errors: {
        fullName?: string;
        birthDate?: string;
        room?: string;
        form?: string;
      };
    };

type BirthDateValidation = { date: Date } | { error: string };

function parseBirthDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function isFutureDate(date: Date): boolean {
  const today = new Date();
  const todayAtMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return date.getTime() > todayAtMidnight.getTime();
}

function validateBirthDate(value: string): BirthDateValidation {
  if (!value) {
    return { error: "Escribe la fecha de nacimiento." };
  }

  const date = parseBirthDate(value);
  if (!date) {
    return { error: "Escribe una fecha válida (dd/mm/aaaa)." };
  }

  if (isFutureDate(date)) {
    return { error: "La fecha no puede ser en el futuro." };
  }

  return { date };
}

function formatDatabaseDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeAllergyTags(value: string): string[] {
  const tagMap: Record<string, string> = {
    egg: "egg",
    huevo: "egg",
    gluten: "gluten",
    lactose: "lactose",
    lactosa: "lactose",
    mani: "peanut",
    peanut: "peanut",
    cacahuate: "peanut",
    nuts: "tree_nut",
    nuez: "tree_nut",
    nueces: "tree_nut",
    seafood: "shellfish",
    mariscos: "shellfish",
    shellfish: "shellfish",
    soy: "soy",
    soya: "soy",
  };

  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) =>
          tag
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase(),
        )
        .filter((tag) => tagMap[tag])
        .map((tag) => tagMap[tag]),
    ),
  );
}

export async function addKid(formData: FormData): Promise<AddKidResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const rawBirthDate = String(formData.get("birthDate") ?? "").trim();
  const roomId = String(formData.get("roomId") ?? "").trim();
  const allergies = String(formData.get("allergies") ?? "").trim();
  const medicalNotes = String(formData.get("medicalNotes") ?? "").trim();

  const errors: {
    fullName?: string;
    birthDate?: string;
    room?: string;
  } = {};
  if (!fullName) {
    errors.fullName = "Escribe el nombre completo.";
  }
  if (!roomId) {
    errors.room = "Selecciona una sala.";
  }

  const birthDateValidation = validateBirthDate(rawBirthDate);
  if ("error" in birthDateValidation) {
    return {
      ok: false,
      errors: { ...errors, birthDate: birthDateValidation.error },
    };
  }
  if (errors.fullName || errors.room) {
    return { ok: false, errors };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) {
    return {
      ok: false,
      errors: { form: "Tu sesión expiró. Inicia sesión de nuevo." },
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user")
    .select("daycare_id, role")
    .eq("id", userId)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    (profile.role !== "staff" && profile.role !== "admin")
  ) {
    return {
      ok: false,
      errors: { form: "No tienes permiso para agregar niños." },
    };
  }

  if (!profile.daycare_id) {
    return {
      ok: false,
      errors: { form: "Tu cuenta no tiene una guardería asignada." },
    };
  }

  const { data: room, error: roomError } = await supabase
    .from("room")
    .select("id")
    .eq("id", roomId)
    .eq("daycare_id", profile.daycare_id)
    .maybeSingle();

  if (roomError || !room) {
    return {
      ok: false,
      errors: { room: "Selecciona una sala válida." },
    };
  }

  const { error: insertError } = await supabase.from("child").insert({
    room_id: room.id,
    full_name: fullName,
    birth_date: formatDatabaseDate(birthDateValidation.date),
    enrolled_at: formatDatabaseDate(new Date()),
    medical_notes: medicalNotes || null,
    allergy_tags: normalizeAllergyTags(allergies),
  });

  if (insertError) {
    return {
      ok: false,
      errors: { form: "No se pudo guardar al niño. Intenta de nuevo." },
    };
  }

  revalidatePath("/kids");
  return { ok: true };
}
