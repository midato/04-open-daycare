# SPEC 06 — Diálogo «Nueva publicación» desde el sidebar

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-10-23
> **Objective:** Implementar el modal «Nueva publicación» lanzado desde el botón del sidebar en `/`, con PARA, TIPO y DESCRIPCIÓN obligatorios (validados al pulsar Publicar), fotos opcionales en múltiple y un CTA «Publicar» sin funcionalidad de publicación todavía.

## Scope

**In:**

- `app/components/CreatePostDialog.tsx` (nuevo, client component): renderiza el botón «Nueva publicación» idéntico al actual del sidebar y, al clickearlo, abre el diálogo modal superpuesto.
- `app/components/Sidebar.tsx`: el `<a href="#">` «Nueva publicación» se reemplaza por `<CreatePostDialog />`. El sidebar sigue siendo server component y el resto se queda exactamente igual.
- Diálogo idéntico a `crear-publicacion.dc.html`: card de `max-width 580px` en `#FBF4EC` con header «Cancelar · Nueva publicación · Publicar» y las cuatro secciones PARA, TIPO, DESCRIPCIÓN y FOTOS.
- PARA (obligatorio, selección múltiple): chips generados desde `kids` de `app/lib/data.ts` (8 niños, avatar circular con `avatarBg`/`avatarFg`/`initial`) + chip «Toda la sala». «Toda la sala» es excluyente: activarla limpia los niños y elegir un niño la desactiva.
- Expansión de PARA: colapsado muestra los 3 primeros niños de `data.ts` + «Toda la sala» + pill `+N ⌄` (N = niños ocultos no seleccionados). Expandirla muestra todos con la pill `Mostrar menos ⌃`. Al colapsar jamás se oculta un chip seleccionado: los niños ocultos que sumaron selección permanecen visibles y `N` solo cuenta los ocultos sin marcar.
- TIPO (obligatorio, selección única): los 7 chips con los colores exactos del mockup (Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio). El chip seleccionado se marca con un anillo alrededor, sin alterar sus colores.
- DESCRIPCIÓN (obligatorio): textarea con placeholder «Cuenta cómo le fue hoy…» y estilo del mockup (borde `#EADFD0`, `min-height 120px`).
- FOTOS (opcional, sin validación): botón «Agregar» de borde discontinuo que abre un selector de archivos oculto (`accept="image/*"`, `multiple`); cada foto se pinta como tile de 96×96 con preview vía `URL.createObjectURL` y un botón ✕ para quitarla.
- Validación solo en el cliente, al pulsar «Publicar»: los tres campos obligatorios muestran borde `#D9583C` y mensajes en español bajo su sección; los errores se limpian al corregir el campo.
- CTA «Publicar» **sin funcionalidad de publicación**: con el formulario válido el clic es un no-op (no publica, no cierra, no muta el feed). La validación sí se ejecuta y muestra los errores correspondientes.
- Cierre del diálogo: enlace «Cancelar», tecla `Esc` y clic en el backdrop descartan lo escrito y resetean todo el estado (selecciones, expansión y errores). Al abrir, el foco cae en el primer chip de PARA.
- Fidelidad visual contra `references/pantallas/crear-publicacion.dc.html`: colores hex, radios, sombras y tamaños exactos del HTML fuente.

**Out of scope (para specs futuros):**

- La publicación en sí: Publicar no agrega la entrada al feed, no persiste nada ni consulta servicios. Se habilitará en otro spec.
- Persistencia real: BD, API, archivos, localStorage. Todo vive en memoria del cliente y se descarta al cerrar el modal.
- Subida de fotos a servidor o almacenamiento externo.
- Reutilizar el mismo diálogo para «Editar publicación» (los enlaces «Editar» del feed siguen con `href="#"`).
- Notificar al usuario que Publicar es no-op con un toast o mensaje.
- Maquetación mobile dedicada.

## Data model

```ts
// app/components/CreatePostDialog.tsx (estructuras locales, no se exportan a data.ts)

type FieldErrors = { recipients?: string; postType?: string; description?: string };

interface PhotoPreview {
  id: string;
  file: File;
  url: string; // URL.createObjectURL(file) — revocar al quitar o cerrar
}

// Estado del diálogo
let isOpen: boolean;
let selectedKidIds: string[];   // ids de `kids` (app/lib/data.ts); vacío → error
let allRoom: boolean;           // "Toda la sala"; excluyente con selectedKidIds
let selectedType: PostTypeKey | null;
let description: string;        // trimeada para validar
let photos: PhotoPreview[];     // opcional, sin límite
let showAllKids: boolean;       // controla la pill +N / Mostrar menos
let errors: FieldErrors;
```

Constantes de TIPO dentro del componente con los valores del mockup:

```ts
const postTypeOptions: { key: string; label: string; bg: string; fg: string }[];
// comida:      bg #9A7B1E, fg #fff
// siesta:      bg #E7DCF6, fg #7B5FC0
// actividad:   bg #2E89A6, fg #fff
// logro:       bg #CFEBD8, fg #3E9B6C
// animo:       bg #F9D2DE, fg #C56486
// foto:        bg #FBD8CC, fg #D9684A
// anuncio:     bg #CCD8F4, fg #4E72C8
```

Mensajes de validación:

- PARA: «Selecciona al menos un destinatario.»
- TIPO: «Selecciona el tipo de publicación.»
- DESCRIPCIÓN: «Escribe la descripción.»

Esta feature no introduce datos nuevos en `app/lib/data.ts`: reutiliza `kids` (8 niños) y `currentUser`. No simplifica el data model del feed.

## Implementation plan

1. Crear `app/components/CreatePostDialog.tsx` (`"use client"`) con el botón trigger (mismas clases exactas que el `<a>` actual del sidebar) y el esqueleto del modal: backdrop `rgba(40,32,26,0.5)`, card `580px #FBF4EC`, header «Cancelar | Nueva publicación | Publicar» sin campos aún. Incluir cierre por Esc, backdrop y Cancelar con reset de estado, y foco inicial en el primer chip. Verificar: «Nueva publicación» (temporalmente pegado como `<a href="#">` reemplazado en el paso 7) abre y cierra el modal.
2. Implementar la sección PARA: chips de `kids` con avatar circular, chip «Toda la sala» excluyente, colapsado a 3 niños + pill `+N ⌄` y expansión a `Mostrar menos ⌃` con la regla de no ocultar chips seleccionados. Verificar: seleccionar niño excluye la sala y viceversa; expandir y colapsar no rompe los renglones.
3. Implementar la sección TIPO: 7 chips con `postTypeOptions`, selección única y anillo en el chip activo. Verificar: se marcan y desmarcan correctamente.
4. Implementar la sección DESCRIPCIÓN: textarea controlado con placeholder y estilos del mockup. Verificar: escribir y borrar funciona con el estado en React.
5. Implementar la sección FOTOS: input oculto múltiple, tile «Agregar» discontinuo, tiles de preview 96×96 con botón ✕ y revocación de `objectURL` al quitar/cerrar. Verificar: agregar 2 archivos deja 2 tiles y quitar 1 deja 1.
6. Implementar la validación al pulsar «Publicar»: muestra los tres mensajes, bordes `#D9583C`, limpieza al corregir y no-op con todo válido (el modal queda abierto). Verificar: clic vacío muestra 3 errores; completado, un clic no hace nada y no hay errores.
7. Editar `app/components/Sidebar.tsx`: sustituir el `<a href="#">` «Nueva publicación» por `<CreatePostDialog />` e importarlo. Verificar: el sidebar se pinta idéntico y el botón abre el modal desde `/`.
8. Paso de fidelidad visual con Playwright contra `crear-publicacion.dc.html` (capturas en `.playwright-mcp/`): colores, radios, sombras y tipografías.
9. Verificación final: `npx tsc --noEmit`, `npx eslint app/` y repaso del flujo completo E2E (abrir, validar, fotos, expandir/colapsar, cerrar y reabrir limpio).

## Acceptance criteria

- [x] Clic en «Nueva publicación» del sidebar de `/` abre el diálogo modal sin navegar ni recargar la página.
- [x] El diálogo replica `crear-publicacion.dc.html`: card de 580px en `#FBF4EC`, header «Cancelar | Nueva publicación | Publicar» (título en Fredoka) y las secciones PARA, TIPO, DESCRIPCIÓN y FOTOS con los mismos textos, colores y radios.
- [x] {CU} Con PARA, TIPO y DESCRIPCIÓN vacíos, «Publicar» muestra los 3 mensajes de error en español y el modal permanece abierto.
- [x] {CU} Con el formulario válido, «Publicar» no publica ni cierra el modal (no-op) y no quedan errores visibles.
- [x] {CU} Al corregir un campo con error, su mensaje desaparece automáticamente.
- [x] {CU} PARA lista los 8 niños de `kids` con sus avatares (colores de `avatarBg`/`avatarFg`); colapsado muestra Mateo, Sofía, Benjamín, «Toda la sala» y la pill `+5 ⌄`.
- [x] {CU} Expandir muestra los 8 niños con la pill `Mostrar menos ⌃`; colapsar vuelve al estado inicial.
- [x] {CU} Colapsar con niños ocultos seleccionados mantiene visibles los chips seleccionados y los `+N` cuentan solo los ocultos sin marcar.
- [x] Seleccionar «Toda la sala» limpia la selección de niños y elegir un niño desactiva «Toda la sala».
- [x] {CU} TIPO: los 7 chips usan los colores exactos del mockup; la selección es única y el chip activo se marca con un anillo.
- [x] {CU} DESCRIPCIÓN: textarea con placeholder «Cuenta cómo le fue hoy…» y `min-height 120px`.
- [x] {CU} FOTOS: «Agregar» abre el selector de archivos; se pueden agregar varias; cada tile 96×96 muestra la preview y el ✕ la quita. FOTOS no genera errores.
- [x] {CU} Cancelar, la tecla Esc y el clic en el backdrop cierran el diálogo descartando todo; al reabrir arranca limpio (nada seleccionado, colapsado, sin fotos).
- [x] {CU} Al abrir el diálogo el foco cae en el primer chip de PARA.
- [x] El sidebar pinta exactamente como antes, salvo que «Nueva publicación» pasa de `<a href="#">` a un `<button>`.
- [x] `npx tsc --noEmit` sin errores.
- [x] `npx eslint app/` sin errores.
- [x] Comparación visual con el mockup: colores, radios, sombras y tipografías coinciden.
- [x] El feed de `/` sigue renderizando exactamente como antes (SPEC 01 intacto).

## Decisions

- **Yes:** validar los tres obligatorios al pulsar «Publicar» y continuar en no-op cuando todo es válido. **No:** botón deshabilitado hasta completar ni validación en vivo. Confirmado por el usuario.
- **Yes:** «Publicar» es no-op con el formulario válido (sin toast ni feedback adicional). **No:** publicar en el feed ni informar por ahora. Confirmado por el usuario (funcionalidad posterior).
- **Yes:** modal overlay sobre `/` reutilizando el patrón de `AddKidDialog` (backdrop, Esc, backdrop-click, card redondeada). **No:** ruta dedicada `/crear-publicacion`.
- **Yes:** el trigger vive dentro de `CreatePostDialog.tsx` para que `Sidebar.tsx` siga siendo server component. **No:** `'use client'` en el Sidebar.
- **Yes:** chips de PARA alimentados por los 8 niños de `data.ts` con expansión `+N`. **No:** hardcodear los 3 del mockup estático ni un `<select>` de niños. Confirmado por el usuario.
- **Yes:** pill `+N ⌄` / `Mostrar menos ⌃` que jamás oculta un chip seleccionado al colapsar. **No:** scroll horizontal para «no ocupar más renglones» ni overlay de niños (propuesta del usuario con la regla de no descomponer el control). Confirmado por el usuario.
- **Yes:** «Toda la sala» excluyente con la selección de niños. **No:** combinación de ambos (destinatarios ambíguos: a quién se le manda si ya va la sala entera).
- **Yes:** anillo alrededor del chip TIPO activo para marcar selección sin tocar los colores del mockup. **No:** estilo seleccionado/deseleccionado distinto por chip (faltaría definirla en el mockup).
- **Yes:** validación propia con mensajes en español. **No:** atributo `required` de HTML5 (el aviso lo pinta el navegador en su idioma, como ya se decidió en SPEC 04).
- **Yes:** previews con `URL.createObjectURL` y revocación explícita. **No:** cargar los archivos a base64 en el estado (innecesario y pesado).
- **Yes:** el textarea arranca vacío con placeholder. **No:** el texto precargado del mockup («Pintamos con témperas…»), que solo ilustra el diseño.
- **Yes:** al quitar una foto, al cerrar el diálogo y al desmontar el modal se revocan los objectURL de las fotos. **No:** checkboxes ni recordatorios sobre fotos pendientes.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `URL.createObjectURL` acumulado si el usuario quita/cierra sin revocar | Revocar el `url` de cada preview en el ✕, en Cancelar/Esc/backdrop y en el desmontaje del modal. |
| El botón reemplaza un `<a>` en el sidebar y puede mover el layout (py, shadow) | Se copian las mismas clases exactas; el paso 7 y el paso 8 verifican visualmente que el sidebar queda idéntico. |
| Filenames con caracteres raros o imágenes gigantes rompen el tile | La preview pinta desde el object URL (no depende del nombre); el tile es `96×96` con `object-fit cover` y no cambia de tamaño. |
| Colapsar PARA tras seleccionar ocultos «pierde» la selección visualmente | Regla de no ocultar seleccionados: collapse mantiene visible todo chip marcado y los `+N` cuentan solo los no seleccionados. |
| Enter en el foco activa un submit inesperado | Igual que SPEC 04: validación explícita sobre `preventDefault` y sin lógica de submit en Enter. |
| El chip TIPO activo con ring puede diferir del mockup si Playwright compara pixel exacto | La diferencia aceptada por diseño (marcador de selección) queda documentada en Decisions y en la captura comparativa. |

## What is **not** in this spec

- La publicación real: Publicar nunca agrega el post al feed ni toca `data.ts`.
- Cualquier persistencia: BD, API, archivos, localStorage.
- Subida de fotos a un servidor.
- Reutilizar el diálogo para «Editar publicación».
- Notificar al usuario que la publicación es no-op.
- Maquetación mobile dedicada.

Cada uno de esos, si aterrizan, va en su propio spec.
