"use client";

import { type SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors: typeof fieldErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextFieldErrors.email = "Escribe tu correo electrónico.";
    }
    if (!password) {
      nextFieldErrors.password = "Escribe tu contraseña.";
    }

    setFieldErrors(nextFieldErrors);
    setAuthError(null);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setAuthError(
        error.message.toLowerCase().includes("invalid login credentials")
          ? "El correo o la contraseña no son correctos."
          : "No pudimos iniciar sesión. Inténtalo de nuevo.",
      );
      setIsSubmitting(false);
      return;
    }

    router.replace("/");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-[9px] text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
        EMAIL
      </div>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        aria-invalid={Boolean(fieldErrors.email)}
        aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
        className={`w-full rounded-[14px] border-[1.5px] bg-white px-4 py-[14px] text-[15px] text-[#3F362E] focus:outline-none ${
          fieldErrors.email ? "border-[#D9583C]" : "border-[#EADFD0]"
        }`}
      />
      {fieldErrors.email && (
        <p id="login-email-error" className="mt-1.5 mb-[18px] text-[13px] text-[#D9583C]">
          {fieldErrors.email}
        </p>
      )}
      {!fieldErrors.email && <div className="mb-[18px]" />}
      <div className="mb-2 text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
        CONTRASEÑA
      </div>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        placeholder="••••••••"
        aria-invalid={Boolean(fieldErrors.password)}
        aria-describedby={
          fieldErrors.password ? "login-password-error" : undefined
        }
        className={`w-full rounded-[14px] border-[1.5px] bg-white px-4 py-[14px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none ${
          fieldErrors.password ? "border-[#D9583C]" : "border-[#EADFD0]"
        }`}
      />
      {fieldErrors.password && (
        <p
          id="login-password-error"
          className="mt-1.5 mb-2.5 text-[13px] text-[#D9583C]"
        >
          {fieldErrors.password}
        </p>
      )}
      {!fieldErrors.password && <div className="mb-2.5" />}
      <div className="mb-5 text-right">
        <span className="text-[13.5px] font-bold text-[#C5503A]">
          ¿Olvidaste tu contraseña?
        </span>
      </div>

      {authError && (
        <p
          role="alert"
          className="mb-4 rounded-[12px] bg-[#FBE3D8] px-3.5 py-3 text-[13px] text-[#B8432F]"
        >
          {authError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="block w-full rounded-[15px] p-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
        style={{
          background: "linear-gradient(180deg,#F4977E,#EE8164)",
        }}
      >
        {isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>

      <p className="mt-6 text-center text-[14.5px] text-[#94887B]">
        ¿Te invitó la guardería?{" "}
        <a href="/activate-account" className="font-extrabold text-[#C5503A]">
          Activa tu cuenta
        </a>
      </p>
    </form>
  );
}
