import AddKidDialog from "@/app/components/AddKidDialog";
import KidCard from "@/app/components/KidCard";
import Sidebar from "@/app/components/Sidebar";
import { getKidsPageData, toKidViewModel } from "@/app/kids/data";

export default async function Kids() {
  const { rooms, children, error } = await getKidsPageData();
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));
  const kids = children.map((child, index) =>
    toKidViewModel(
      child,
      roomNames.get(child.roomId) ?? "Sala no disponible",
      index,
    ),
  );

  return (
    <div className="flex min-h-screen bg-[#F6ECDF]">
      <Sidebar activeItem="kids" />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[880px] px-10 pt-[34px] pb-20">
          <div className="mb-[22px] flex items-end justify-between gap-4">
            <div>
              <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
                GESTIÓN
              </div>
              <h1 className="m-0 font-display text-[30px] font-semibold text-[#3F362E]">
                Niños
              </h1>
            </div>
            <AddKidDialog rooms={rooms} />
          </div>

          <div className="mb-[22px] flex items-center gap-[11px] rounded-[14px] border border-[#ECE0D0] bg-[#FFFDF9] px-4 py-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B0A290"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              placeholder="Buscar niño…"
              className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-[#3F362E] outline-none placeholder:text-[#B6A99B]"
            />
          </div>

          <div className="mb-3.5 flex items-center gap-3">
            <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#3F362E]">
              TODAS LAS SALAS ·
            </span>
            <span className="text-[13px] text-[#A89A8B]">
              {kids.length} niños
            </span>
            <span className="h-px flex-1 bg-[#E7DAC8]" />
          </div>

          {error ? (
            <div className="rounded-[18px] border border-[#F0C8B9] bg-[#FFF4EE] px-5 py-6 text-[14px] text-[#A84B37]">
              No pudimos cargar la información de los niños. Intenta de nuevo
              más tarde.
            </div>
          ) : kids.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[#DCCBB7] bg-[#FFFDF9] px-6 py-12 text-center">
              <h2 className="mb-2 font-display text-[21px] font-semibold text-[#3F362E]">
                Aún no hay niños registrados
              </h2>
              <p className="m-0 text-[14px] leading-[1.5] text-[#94887B]">
                Agrega al primer niño para comenzar a organizar tu guardería.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {kids.map((kid) => (
                <KidCard key={kid.id} kid={kid} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
