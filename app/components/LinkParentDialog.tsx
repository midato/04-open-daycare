"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { invitation, parentescoOptions } from "@/app/lib/data";

type Parentesco = (typeof parentescoOptions)[number];

type FieldErrors = { fullName?: string; email?: string; parentesco?: string };

const labelClassName =
  "mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";
const inputClassName =
  "w-full rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] outline-none placeholder:text-[#B6A99B]";
const errorClassName = "mt-[6px] text-[12.5px] font-bold text-[#D9583C]";
const parentescoUnselectedClassName =
  "cursor-pointer border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] font-extrabold text-[14px] text-[#6E6359]";
const parentescoSelectedClassName =
  "cursor-pointer border-[1.5px] border-[#9FB8EC] bg-[#CCD8F4] font-extrabold text-[14px] text-[#4E72C8]";

function getKidFirstName(kidFullName: string): string {
  return kidFullName.split(" ")[0];
}

function fieldBorder(hasError: boolean) {
  return hasError ? "border-[#D9583C]" : "border-[#EADFD0]";
}

function withoutError(errors: FieldErrors, field: keyof FieldErrors) {
  if (!errors[field]) {
    return errors;
  }
  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}

function validateEmail(value: string): string | undefined {
  if (!value) {
    return "Escribe el correo electrónico.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Escribe un correo válido, por ejemplo correo@ejemplo.com.";
  }
}

export default function LinkParentDialog({
  kidFullName,
}: {
  kidFullName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [parentesco, setParentesco] = useState<Parentesco | "">("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const fullNameInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setFullName("");
    setEmail("");
    setParentesco("");
    setErrors({});
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!fullName.trim()) {
      nextErrors.fullName = "Escribe el nombre del padre o la madre.";
    }

    const emailError = validateEmail(email.trim());
    if (emailError) {
      nextErrors.email = emailError;
    }

    if (!parentesco) {
      nextErrors.parentesco = "Selecciona el parentesco.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    closeModal();
  };

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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex cursor-pointer items-center gap-3 bg-transparent pt-2 text-left"
      >
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-[#B0A290]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <span className="text-[14.5px] font-extrabold text-[#C5503A]">
          Vincular otro padre
        </span>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-[rgba(40,32,26,0.5)] px-6 py-10"
          onClick={closeModal}
        >
          <div
            className="h-fit w-full max-w-[480px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
              <div>
                <div className="font-display text-[18px] font-semibold text-[#3F362E]">
                  Vincular padre
                </div>
                <div className="text-[13px] text-[#A89A8B]">
                  a {kidFullName}
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Cerrar"
                className="flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-[10px] border-none bg-[#F0E6D8] text-[#94887B]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form noValidate onSubmit={handleSubmit}>
              <div className="px-[26px] py-[22px]">
                <div className="mb-5 flex gap-[11px] rounded-[14px] bg-[#E3ECFB] px-4 py-[13px]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4E72C8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-px flex-none"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
                    Le enviaremos un correo con un código para que active su
                    cuenta. Solo verá el feed de {getKidFirstName(kidFullName)}.
                  </span>
                </div>

                <label
                  htmlFor="link-parent-full-name"
                  className={labelClassName}
                >
                  NOMBRE DEL PADRE/MADRE
                </label>
                <input
                  id="link-parent-full-name"
                  name="fullName"
                  ref={fullNameInputRef}
                  type="text"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setErrors((prev) => withoutError(prev, "fullName"));
                  }}
                  placeholder="Ej. Diego Fernández"
                  className={`${inputClassName} ${
                    errors.fullName ? "mb-[6px]" : "mb-[18px]"
                  } ${fieldBorder(Boolean(errors.fullName))}`}
                />
                {errors.fullName ? (
                  <p className={`mb-[18px] ${errorClassName}`}>
                    {errors.fullName}
                  </p>
                ) : null}

                <label htmlFor="link-parent-email" className={labelClassName}>
                  EMAIL
                </label>
                <input
                  id="link-parent-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((prev) => withoutError(prev, "email"));
                  }}
                  placeholder="correo@ejemplo.com"
                  className={`${inputClassName} ${
                    errors.email ? "mb-[6px]" : "mb-[18px]"
                  } ${fieldBorder(Boolean(errors.email))}`}
                />
                {errors.email ? (
                  <p className={`mb-[18px] ${errorClassName}`}>
                    {errors.email}
                  </p>
                ) : null}

                <div
                  id="link-parent-parentesco"
                  role="group"
                  aria-label="Parentesco"
                >
                  <div className={labelClassName}>PARENTESCO</div>
                  <div className="mb-5 flex gap-[9px]">
                    {parentescoOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={parentesco === option}
                        onClick={() => {
                          setParentesco(option);
                          setErrors((prev) => withoutError(prev, "parentesco"));
                        }}
                        className={`flex-1 rounded-full py-[11px] ${
                          parentesco === option
                            ? parentescoSelectedClassName
                            : parentescoUnselectedClassName
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {errors.parentesco ? (
                    <p className={errorClassName}>{errors.parentesco}</p>
                  ) : null}
                </div>

                <div className="mb-5 rounded-[16px] border-[1.5px] border-dashed border-[#E6D08A] bg-[#FBF1D6] py-[18px] text-center">
                  <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#A88526]">
                    CÓDIGO DE INVITACIÓN
                  </div>
                  <div className="font-display text-[34px] font-semibold tracking-[7px] text-[#8A7234]">
                    {invitation.code}
                  </div>
                  <div className="mt-[6px] text-[13px] text-[#A88526]">
                    Vence en 7 días
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center justify-center gap-[9px] rounded-[14px] border-none bg-[linear-gradient(180deg,#F4977E,#EE8164)] py-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m22 2-7 20-4-9-9-4z" />
                    <path d="M22 2 11 13" />
                  </svg>
                  Enviar invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
