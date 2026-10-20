"use server";

import {
  avatarPalette,
  computeAgeLabel,
  formatBirthDateLabel,
  formatJoinedLabel,
  kids,
  rooms,
  slugifyKidId,
  type Kid,
} from "@/app/lib/data";

export type AddKidResult =
  | { ok: true }
  | {
      ok: false;
      errors: { fullName?: string; birthDate?: string; room?: string };
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

export async function addKid(formData: FormData): Promise<AddKidResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const rawBirthDate = String(formData.get("birthDate") ?? "").trim();
  const room = String(formData.get("room") ?? "").trim();
  const allergies = String(formData.get("allergies") ?? "").trim();
  const medicalNotes = String(formData.get("medicalNotes") ?? "").trim();

  const errors: { fullName?: string; birthDate?: string; room?: string } = {};
  if (!fullName) {
    errors.fullName = "Escribe el nombre completo.";
  }
  if (!room) {
    errors.room = "Selecciona una sala.";
  } else if (!rooms.includes(room)) {
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

  const birthDate = birthDateValidation.date;
  const allergyNotes = [allergies, medicalNotes]
    .filter((part) => part.length > 0)
    .join(" · ");
  const avatar = avatarPalette[kids.length % avatarPalette.length];

  const newKid: Kid = {
    id: slugifyKidId(fullName),
    fullName,
    initial: fullName.charAt(0).toUpperCase(),
    ageLabel: computeAgeLabel(birthDate),
    room,
    birthDateLabel: formatBirthDateLabel(birthDate),
    joinedLabel: formatJoinedLabel(new Date()),
    avatarBg: avatar.bg,
    avatarFg: avatar.fg,
    linkedParents: [],
  };
  if (allergyNotes) {
    newKid.allergyNotes = allergyNotes;
  }

  kids.push(newKid);
  return { ok: true };
}
