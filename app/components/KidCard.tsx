import Link from "next/link";
import { allergyBadges, type Kid } from "@/app/lib/data";

function linkedParentsLabel(count: number) {
  if (count === 0) return "sin padres vinculados";
  if (count === 1) return "1 padre vinculado";
  return `${count} padres vinculados`;
}

export default function KidCard({ kid }: { kid: Kid }) {
  const allergy = kid.allergy ? allergyBadges[kid.allergy] : undefined;
  const showLinkBadge = kid.linkedParents.length === 0;

  return (
    <Link
      href={`/kids/${kid.id}`}
      className="flex min-w-0 items-center gap-3.5 rounded-[18px] border border-[#ECE0D0] bg-[#FFFDF9] p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition duration-150 hover:-translate-y-0.5 hover:border-[#F2A78E]"
    >
      <span
        className="flex h-12 w-12 flex-none items-center justify-center rounded-full font-display text-[19px] font-semibold"
        style={{ backgroundColor: kid.avatarBg, color: kid.avatarFg }}
      >
        {kid.initial}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-display text-[16px] font-semibold text-[#3F362E]">
          {kid.fullName}
        </span>
        <span className="text-[13px] text-[#A89A8B]">
          {kid.ageLabel} · {linkedParentsLabel(kid.linkedParents.length)}
        </span>
      </span>
      {allergy ? (
        <span
          className="flex-none rounded-full px-[9px] py-[5px] text-[11px] font-extrabold"
          style={{ backgroundColor: allergy.bg, color: allergy.fg }}
        >
          {allergy.label}
        </span>
      ) : showLinkBadge ? (
        <span className="flex-none rounded-full bg-[#F9D2DE] px-[9px] py-[5px] text-[11px] font-extrabold text-[#C56486]">
          VINCULAR
        </span>
      ) : (
        <svg
          className="flex-none"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#CBB89F"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </Link>
  );
}
