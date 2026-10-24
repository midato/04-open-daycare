"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { kids } from "@/app/lib/data";

type FieldErrors = {
  recipients?: string;
  postType?: string;
  description?: string;
};

interface PhotoPreview {
  id: string;
  file: File;
  url: string;
}

type PostTypeKey =
  | "comida"
  | "siesta"
  | "actividad"
  | "logro"
  | "animo"
  | "foto"
  | "anuncio";

const FIRST_VISIBLE_KIDS = 3;

const postTypeOptions: { key: PostTypeKey; label: string; bg: string; fg: string }[] = [
  { key: "comida", label: "Comida", bg: "#9A7B1E", fg: "#FFFFFF" },
  { key: "siesta", label: "Siesta", bg: "#E7DCF6", fg: "#7B5FC0" },
  { key: "actividad", label: "Actividad", bg: "#2E89A6", fg: "#FFFFFF" },
  { key: "logro", label: "Logro", bg: "#CFEBD8", fg: "#3E9B6C" },
  { key: "animo", label: "Ánimo", bg: "#F9D2DE", fg: "#C56486" },
  { key: "foto", label: "Foto", bg: "#FBD8CC", fg: "#D9684A" },
  { key: "anuncio", label: "Anuncio", bg: "#CCD8F4", fg: "#4E72C8" },
];

const sectionLabelClassName =
  "mb-[10px] block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";
const errorClassName = "mt-[6px] text-[12.5px] font-bold text-[#D9583C]";

function withoutError(errors: FieldErrors, field: keyof FieldErrors) {
  if (!errors[field]) {
    return errors;
  }
  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}

function fieldBorder(hasError: boolean) {
  return hasError ? "border-[#D9583C]" : "border-[#EADFD0]";
}

function attendeeChipClassName(isSelected: boolean) {
  return `flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] py-[6px] text-[14px] font-bold ${
    isSelected
      ? "border-[#3F362E] bg-[#3F362E] text-white"
      : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
  }`;
}

export default function CreatePostDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKidIds, setSelectedKidIds] = useState<string[]>([]);
  const [allRoom, setAllRoom] = useState(false);
  const [selectedType, setSelectedType] = useState<PostTypeKey | null>(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [showAllKids, setShowAllKids] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const firstChipRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<PhotoPreview[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  });

  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setSelectedKidIds([]);
    setAllRoom(false);
    setSelectedType(null);
    setDescription("");
    photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    setPhotos([]);
    setShowAllKids(false);
    setErrors({});
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (isOpen) {
      firstChipRef.current?.focus();
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

  const toggleKidSelection = (kidId: string) => {
    setSelectedKidIds((previous) =>
      previous.includes(kidId)
        ? previous.filter((id) => id !== kidId)
        : [...previous, kidId],
    );
    setAllRoom(false);
    setErrors((previous) => withoutError(previous, "recipients"));
  };

  const toggleAllRoom = () => {
    setAllRoom((previous) => !previous);
    setSelectedKidIds((previous) => (previous.length > 0 ? [] : previous));
    setErrors((previous) => withoutError(previous, "recipients"));
  };

  const togglePostType = (postTypeKey: PostTypeKey) => {
    setSelectedType((previous) =>
      previous === postTypeKey ? null : postTypeKey,
    );
    setErrors((previous) => withoutError(previous, "postType"));
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) {
      return;
    }
    const previews = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((previous) => [...previous, ...previews]);
  };

  const removePhoto = (photoId: string) => {
    setPhotos((previous) => {
      const target = previous.find((photo) => photo.id === photoId);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      return previous.filter((photo) => photo.id !== photoId);
    });
  };

  const handlePublish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!allRoom && selectedKidIds.length === 0) {
      nextErrors.recipients = "Selecciona al menos un destinatario.";
    }
    if (!selectedType) {
      nextErrors.postType = "Selecciona el tipo de publicación.";
    }
    if (!description.trim()) {
      nextErrors.description = "Escribe la descripción.";
    }
    setErrors(nextErrors);
  };

  const visibleKids = showAllKids
    ? kids
    : kids.filter(
        (kid, index) =>
          index < FIRST_VISIBLE_KIDS || selectedKidIds.includes(kid.id),
      );
  const hiddenUnselectedCount = kids.length - visibleKids.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mb-[18px] flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] p-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
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
        Nueva publicación
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-[rgba(40,32,26,0.5)] px-6 py-10"
          onClick={closeModal}
        >
          <div
            className="h-fit w-full max-w-[580px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <form onSubmit={handlePublish}>
              <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer border-none bg-transparent p-0 text-[15px] font-bold text-[#94887B]"
              >
                Cancelar
              </button>
              <span className="font-display text-[18px] font-semibold text-[#3F362E]">
                Nueva publicación
              </span>
              <button
                type="submit"
                className="cursor-pointer border-none bg-transparent p-0 text-[15px] font-extrabold text-[#D9583C]"
              >
                Publicar
              </button>
            </div>
            <div className="px-[26px] py-6">
              <div className={sectionLabelClassName}>PARA</div>
              <div
                className={`flex flex-wrap items-center gap-[9px] ${
                  errors.recipients
                    ? "mb-[6px] rounded-[14px] border-[1.5px] border-[#D9583C] p-[10px]"
                    : "mb-[22px]"
                }`}
              >
                {visibleKids.map((kid, index) => {
                  const isSelected = selectedKidIds.includes(kid.id);
                  return (
                    <button
                      key={kid.id}
                      ref={index === 0 ? firstChipRef : undefined}
                      type="button"
                      onClick={() => toggleKidSelection(kid.id)}
                      className={`${attendeeChipClassName(isSelected)} py-[6px] pl-[6px] pr-[14px]`}
                    >
                      <span
                        className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full font-display text-[13px] font-semibold"
                        style={{ backgroundColor: kid.avatarBg, color: kid.avatarFg }}
                      >
                        {kid.initial}
                      </span>
                      {kid.fullName.split(" ")[0]}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={toggleAllRoom}
                  className={`${attendeeChipClassName(allRoom)} px-[16px]`}
                >
                  Toda la sala
                </button>
                {showAllKids ? (
                  <button
                    type="button"
                    onClick={() => setShowAllKids(false)}
                    className="flex cursor-pointer items-center gap-1 rounded-full border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] px-[16px] py-[6px] text-[14px] font-bold text-[#6E6359]"
                  >
                    Mostrar menos
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#B0A290"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </button>
                ) : hiddenUnselectedCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllKids(true)}
                    className="flex cursor-pointer items-center gap-1 rounded-full border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] px-[16px] py-[6px] text-[14px] font-bold text-[#6E6359]"
                  >
                    +{hiddenUnselectedCount}
                    <svg
                      width="14"
                      height="14"
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
                  </button>
                ) : null}
              </div>
              {errors.recipients ? (
                <p className={errorClassName}>{errors.recipients}</p>
              ) : null}

              <div className={sectionLabelClassName}>TIPO</div>
              <div
                className={`flex flex-wrap items-center gap-[9px] ${
                  errors.postType
                    ? "mb-[6px] rounded-[14px] border-[1.5px] border-[#D9583C] p-[10px]"
                    : "mb-[22px]"
                }`}
              >
                {postTypeOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => togglePostType(option.key)}
                    style={{ backgroundColor: option.bg, color: option.fg }}
                    className={`cursor-pointer rounded-full border-none px-[16px] py-[8px] text-[13.5px] font-extrabold ring-offset-2 ring-offset-[#FBF4EC] ${
                      selectedType === option.key
                        ? "ring-[3px] ring-[#3F362E]"
                        : "ring-0"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.postType ? (
                <p className={errorClassName}>{errors.postType}</p>
              ) : null}

              <div className={sectionLabelClassName}>DESCRIPCIÓN</div>
              <textarea
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setErrors((previous) =>
                    withoutError(previous, "description"),
                  );
                }}
                placeholder="Cuenta cómo le fue hoy…"
                className={`min-h-[120px] w-full resize-y rounded-[14px] border-[1.5px] bg-white px-4 py-[14px] text-[15px] leading-[1.5] text-[#3F362E] outline-none placeholder:text-[#B6A99B] ${fieldBorder(Boolean(errors.description))} ${
                  errors.description ? "mb-[6px]" : "mb-[22px]"
                }`}
              />
              {errors.description ? (
                <p className={errorClassName}>{errors.description}</p>
              ) : null}

              <div className={sectionLabelClassName}>FOTOS</div>
              <div className="flex flex-wrap gap-[12px]">
                {photos.length === 0 ? (
                  <div className="flex h-[96px] w-[96px] flex-none items-center justify-center rounded-[14px] border border-[#ECE0D0] bg-[#F4ECE1] text-[#CBB89F]">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
                    </svg>
                  </div>
                ) : null}
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative h-[96px] w-[96px] flex-none overflow-hidden rounded-[14px] border border-[#ECE0D0]"
                  >
                    <img
                      src={photo.url}
                      alt={photo.file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Quitar foto"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute right-[6px] top-[6px] flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border border-[#ECE0D0] bg-[#FFFDF9]"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C5503A"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-[96px] w-[96px] flex-none cursor-pointer flex-col items-center justify-center gap-[6px] rounded-[14px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[12px] text-[#B0A290]"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C5503A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Agregar
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    addPhotos(event.target.files);
                    event.target.value = "";
                  }}
                />
              </div>
            </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
