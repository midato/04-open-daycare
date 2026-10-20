"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { addKid } from "@/app/kids/actions";
import { rooms } from "@/app/lib/data";

type FieldErrors = { fullName?: string; birthDate?: string; room?: string };

type BirthDateValidation = { date: Date } | { error: string };

function maskBirthDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [day, month, year].filter((part) => part.length > 0).join("/");
}

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

function withoutError(errors: FieldErrors, field: keyof FieldErrors) {
  if (!errors[field]) {
    return errors;
  }
  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}

const labelClassName =
  "mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";
const inputClassName =
  "w-full rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] outline-none placeholder:text-[#B6A99B]";
const errorClassName = "mt-[6px] text-[12.5px] font-bold text-[#D9583C]";

function fieldBorder(hasError: boolean) {
  return hasError ? "border-[#D9583C]" : "border-[#EADFD0]";
}

export default function AddKidDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [room, setRoom] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const resetForm = useCallback(() => {
    setFullName("");
    setBirthDate("");
    setRoom("");
    setAllergies("");
    setMedicalNotes("");
    setErrors({});
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (isOpen) {
      fullNameInputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!fullName.trim()) {
      nextErrors.fullName = "Escribe el nombre completo.";
    }

    const birthDateValidation = validateBirthDate(birthDate.trim());
    if ("error" in birthDateValidation) {
      nextErrors.birthDate = birthDateValidation.error;
    }

    if (!room) {
      nextErrors.room = "Selecciona una sala.";
    } else if (!rooms.includes(room)) {
      nextErrors.room = "Selecciona una sala.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setIsSaving(true);
    try {
      const result = await addKid(formData);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      closeModal();
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex cursor-pointer items-center gap-2 rounded-[14px] border-none bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Agregar niño
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-[rgba(40,32,26,0.5)] px-6 py-10"
          onClick={closeModal}
        >
          <div
            className="h-fit w-full max-w-[520px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="cursor-pointer border-none bg-transparent p-0 text-[15px] font-bold text-[#94887B]"
                >
                  Cancelar
                </button>
                <span className="font-display text-[18px] font-semibold text-[#3F362E]">
                  Agregar niño
                </span>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="cursor-pointer border-none bg-transparent p-0 text-[15px] font-extrabold text-[#D9583C] disabled:cursor-default disabled:opacity-60"
                >
                  Guardar
                </button>
              </div>

              <div className="px-[26px] py-6">
                <label
                  htmlFor="add-kid-full-name"
                  className={labelClassName}
                >
                  NOMBRE COMPLETO
                </label>
                <input
                  id="add-kid-full-name"
                  name="fullName"
                  ref={fullNameInputRef}
                  type="text"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setErrors((prev) => withoutError(prev, "fullName"));
                  }}
                  placeholder="Ej. Martina López"
                  className={`${inputClassName} ${
                    errors.fullName ? "mb-[6px]" : "mb-[18px]"
                  } ${fieldBorder(Boolean(errors.fullName))}`}
                />
                {errors.fullName ? (
                  <p className={`mb-[18px] ${errorClassName}`}>
                    {errors.fullName}
                  </p>
                ) : null}

                <div className="mb-[18px] flex gap-[14px]">
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="add-kid-birth-date"
                      className={labelClassName}
                    >
                      FECHA DE NACIMIENTO
                    </label>
                    <input
                      id="add-kid-birth-date"
                      name="birthDate"
                      type="text"
                      inputMode="numeric"
                      value={birthDate}
                      onChange={(event) => {
                        setBirthDate(maskBirthDate(event.target.value));
                        setErrors((prev) => withoutError(prev, "birthDate"));
                      }}
                      placeholder="dd/mm/aaaa"
                      className={`${inputClassName} ${fieldBorder(
                        Boolean(errors.birthDate),
                      )}`}
                    />
                    {errors.birthDate ? (
                      <p className={errorClassName}>{errors.birthDate}</p>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <label htmlFor="add-kid-room" className={labelClassName}>
                      SALA
                    </label>
                    <div className="relative">
                      <select
                        id="add-kid-room"
                        name="room"
                        value={room}
                        onChange={(event) => {
                          setRoom(event.target.value);
                          setErrors((prev) => withoutError(prev, "room"));
                        }}
                        className={`w-full appearance-none rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] pr-10 text-[15px] font-bold outline-none ${fieldBorder(
                          Boolean(errors.room),
                        )} ${room ? "text-[#3F362E]" : "text-[#B6A99B]"}`}
                      >
                        <option value="">Selecciona una sala…</option>
                        {rooms.map((roomName) => (
                          <option key={roomName} value={roomName}>
                            {roomName}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#B0A290"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                    {errors.room ? (
                      <p className={errorClassName}>{errors.room}</p>
                    ) : null}
                  </div>
                </div>

                <label
                  htmlFor="add-kid-allergies"
                  className={labelClassName}
                >
                  ALERGIAS (ETIQUETAS)
                </label>
                <input
                  id="add-kid-allergies"
                  name="allergies"
                  type="text"
                  value={allergies}
                  onChange={(event) => setAllergies(event.target.value)}
                  placeholder="Ej. Maní, Lactosa"
                  className={`${inputClassName} mb-[18px] border-[#EADFD0]`}
                />

                <label
                  htmlFor="add-kid-medical-notes"
                  className={labelClassName}
                >
                  NOTAS MÉDICAS
                </label>
                <textarea
                  id="add-kid-medical-notes"
                  name="medicalNotes"
                  value={medicalNotes}
                  onChange={(event) => setMedicalNotes(event.target.value)}
                  placeholder="Indicaciones, medicación, contactos…"
                  className={`min-h-[90px] resize-y border-[#EADFD0] leading-[1.5] ${inputClassName}`}
                />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
