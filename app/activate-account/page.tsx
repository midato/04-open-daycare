import Link from "next/link";
import { invitation } from "@/app/lib/data";

export default function ActivateAccountPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF4EC] p-10">
      <div className="w-full max-w-[440px]">
        <div
          className="mb-[22px] flex h-[58px] w-[58px] items-center justify-center rounded-[18px] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]"
          style={{
            background: "linear-gradient(155deg,#F8C3A8,#F2937A)",
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </div>

        <h1 className="mb-2 font-display text-[32px] font-semibold leading-[1.15] text-[#3F362E]">
          Bienvenida a OpenDayCare
        </h1>
        <p className="mb-[26px] text-[15.5px] leading-[1.55] text-[#94887B]">
          Te invitaron a seguir el día de tu hijo. Creá tu contraseña para
          activar la cuenta.
        </p>

        <div className="mb-[22px] flex items-center gap-3.5 rounded-[16px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px]">
          <div
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full font-display text-[19px] font-semibold"
            style={{
              background: invitation.avatarBg,
              color: invitation.avatarFg,
            }}
          >
            {invitation.initial}
          </div>
          <div>
            <div className="text-[13px] text-[#94887B]">
              Te invitaron a seguir a
            </div>
            <div className="font-display text-[17px] font-semibold text-[#3F362E]">
              {invitation.childName} · {invitation.roomLabel}
            </div>
          </div>
        </div>

        <div className="mb-2 text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
          CÓDIGO DE INVITACIÓN
        </div>
        <input
          type="text"
          defaultValue={invitation.code}
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] font-display text-[18px] font-bold tracking-[3px] text-[#3F362E] focus:outline-none"
        />
        <div className="mb-2 text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
          EMAIL
        </div>
        <input
          type="email"
          defaultValue={invitation.email}
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-[#3F362E] focus:outline-none"
        />
        <div className="mb-2 text-[12px] font-bold tracking-[0.7px] text-[#94887B]">
          CREAR CONTRASEÑA
        </div>
        <input
          type="password"
          defaultValue={invitation.password}
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#F2A78E] bg-white px-4 py-[14px] text-[15px] text-[#3F362E] focus:outline-none"
        />

        <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#FBF1D6] px-4 py-[14px]">
          <input
            type="checkbox"
            defaultChecked
            className="mt-[1px] h-6 w-6 flex-none appearance-none rounded-[8px] border-[1.5px] border-[#D9CBAF] bg-white bg-center bg-no-repeat checked:border-[#5FB97E] checked:bg-[#5FB97E] checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%223%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Cpolyline%20points=%2220%206%209%2017%204%2012%22/%3E%3C/svg%3E')]"
          />
          <span className="text-[14px] leading-[1.45] text-[#8A7234]">
            Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro
            de la app.
          </span>
        </label>

        <Link
          href="/"
          className="block w-full rounded-[15px] p-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
          style={{
            background: "linear-gradient(180deg,#F4977E,#EE8164)",
          }}
        >
          Activar mi cuenta
        </Link>
        <p className="mt-[22px] text-center text-[14.5px] text-[#94887B]">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-extrabold text-[#C5503A]">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
