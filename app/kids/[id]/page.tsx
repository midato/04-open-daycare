import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import { kids, type KidParent } from "@/app/lib/data";

const parentBadges: Record<
  KidParent["status"],
  { label: string; bg: string; fg: string }
> = {
  active: { label: "ACTIVA", bg: "#CFEBD8", fg: "#3E9B6C" },
  pending: { label: "PENDIENTE", bg: "#F7E7A6", fg: "#9A7B1E" },
};

function parentSubtitle(parent: KidParent) {
  if (parent.status === "pending") return `${parent.role} · invitación enviada`;
  return `${parent.role} · ${parent.role === "Mamá" ? "activa" : "activo"}`;
}

function BackToKidsLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/kids"
      className={`flex items-center gap-[7px] text-[14px] font-bold text-[#94887B] ${className}`}
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
        <path d="m15 18-6-6 6-6" />
      </svg>
      Volver a Niños
    </Link>
  );
}

export default async function KidProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kid = kids.find((k) => k.id === id);

  if (!kid) {
    return (
      <div className="flex min-h-screen bg-[#F6ECDF]">
        <Sidebar activeItem="kids" />
        <main className="h-screen min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[820px] flex-col items-center px-10 pt-[34px] pb-20">
            <h1 className="mt-24 mb-0 font-display text-[30px] font-semibold text-[#3F362E]">
              Niño no encontrado
            </h1>
            <BackToKidsLink className="mt-4" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F6ECDF]">
      <Sidebar activeItem="kids" />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] px-10 pt-[34px] pb-20">
          <BackToKidsLink className="mb-5" />

          <div className="flex flex-wrap items-start gap-[26px]">
            <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
              <div className="flex items-center gap-[18px]">
                <span
                  className="flex h-[84px] w-[84px] flex-none items-center justify-center rounded-full font-display text-[34px] font-semibold"
                  style={{ backgroundColor: kid.avatarBg, color: kid.avatarFg }}
                >
                  {kid.initial}
                </span>
                <div className="flex-1">
                  <h1 className="m-0 font-display text-[28px] font-semibold text-[#3F362E]">
                    {kid.fullName}
                  </h1>
                  <p className="mt-[3px] mb-0 text-[15px] text-[#94887B]">
                    {kid.ageLabel} · Sala {kid.room}
                  </p>
                </div>
                <a
                  href="#"
                  className="flex-none rounded-[12px] border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] px-4 py-[9px] text-[14px] font-bold text-[#6E6359]"
                >
                  Editar
                </a>
              </div>

              {kid.allergyNotes && (
                <div className="flex gap-3.5 rounded-[16px] bg-[#FBDAD6] px-[18px] py-4">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-[#F4A8A0]">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                      <path d="M12 9v4M12 17h.01" />
                    </svg>
                  </span>
                  <div>
                    <div className="mb-0.5 text-[15px] font-extrabold text-[#C5413A]">
                      Alergias y notas
                    </div>
                    <div className="text-[14.5px] leading-normal text-[#B25249]">
                      {kid.allergyNotes}
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9]">
                <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
                  <span className="text-[14.5px] text-[#94887B]">
                    Fecha de nacimiento
                  </span>
                  <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                    {kid.birthDateLabel}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
                  <span className="text-[14.5px] text-[#94887B]">Sala</span>
                  <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                    {kid.room}
                  </span>
                </div>
                <div className="flex justify-between px-[18px] py-[15px]">
                  <span className="text-[14.5px] text-[#94887B]">Ingreso</span>
                  <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                    {kid.joinedLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-[300px] flex-none flex-col gap-3.5">
              <a
                href="#"
                className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-[#3F362E] p-[13px] text-[15px] font-extrabold text-white"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
                Resumen del día
              </a>

              <div className="rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] px-[18px] py-4">
                <div className="mb-3.5 text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
                  PADRES VINCULADOS
                </div>
                <div className="flex flex-col gap-3.5">
                  {kid.linkedParents.map((parent) => {
                    const badge = parentBadges[parent.status];
                    return (
                      <div key={parent.id} className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-display text-[16px] font-semibold text-white"
                          style={{ backgroundColor: parent.avatarBg }}
                        >
                          {parent.name.charAt(0)}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                            {parent.name}
                          </span>
                          <span className="text-[12.5px] text-[#A89A8B]">
                            {parentSubtitle(parent)}
                          </span>
                        </span>
                        <span
                          className="flex-none rounded-full px-[9px] py-1 text-[10.5px] font-extrabold"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.fg,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    );
                  })}
                  <a href="#" className="flex items-center gap-3 pt-2">
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
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
