# SPEC 04 — Diálogo «Agregar niño» desde /kids

> **Status:** Approved
> **Depends on:** SPEC 02
> **Date:** 2026-10-20
> **Objective:** Implementar el modal «Agregar niño» que se abre desde el botón de `/kids`, con validación de los tres campos obligatorios, combo de 10 salas fake y alta en memoria del array `kids`.

## Scope

**In:**

- `app/components/AddKidDialog.tsx` (client component): renderiza el botón «Agregar niño» que reemplaza al `<a href="#">` del header de `/kids` y, al clickearlo, abre el diálogo modal superpuesto a `/kids`.
- Diálogo: backdrop oscuro + card de `max-width 520px` con header «Cancelar · Agregar niño · Guardar» y los cinco campos de `agregar-nino.dc.html` (NOMBRE COMPLETO, FECHA DE NACIMIENTO, SALA, ALERGIAS (ETIQUETAS), NOTAS MÉDICAS).
- NOMBRE COMPLETO, FECHA DE NACIMIENTO y SALA son **obligatorios**. Validación propia en el cliente al pulsar Guardar: borde `#D9583C` + mensaje en español bajo cada campo; el modal no se cierra hasta que los tres sean válidos.
- FECHA DE NACIMIENTO: input de texto con máscara `dd/mm/aaaa` (auto-formato con barras al escribir) y validación de fecha real; rechaza fechas futuras.
- SALA: `<select>` nativo estilizado (`appearance-none` + chevron propio), inicia vacío con placeholder «Selecciona una sala…», alimentado por un arreglo fake de **10 salas** en `app/lib/data.ts`.
- ALERGIAS (ETIQUETAS) y NOTAS MÉDICAS son **opcionales**.
- Cierre del diálogo: enlace «Cancelar», tecla `Esc` y clic en el backdrop descartan lo escrito. «Guardar» solo cierra si la validación pasa.
- `app/kids/actions.ts` (nuevo, `"use server"`): la server action recibe el `FormData`, revalida los tres obligatorios, construye el objeto `Kid` con valores derivados + fake y hace `kids.push()` al final del array. El navegador y el servidor tienen instancias separadas del módulo, por eso el alta ocurre en el servidor.
- Tras guardar, el componente cliente hace `router.refresh()` para que `/kids` (server component) vuelva a leer `kids` y pinte la tarjeta nueva. El Link de la tarjeta navega a `/kids/[id]`, que también se renderiza desde el servidor y por eso encuentra al niño nuevo.
- `app/kids/page.tsx`: el rótulo de la grilla pasa de «SALA SOLES» a «TODAS LAS SALAS · {kids.length} niños» (el contador ya es derivado).
- `app/lib/data.ts`: nuevos exports `rooms` (10 salas), `avatarPalette` y helpers `slugifyKidId`, `computeAgeLabel`, `formatBirthDateLabel`, `formatJoinedLabel`.
- Fidelidad visual contra `references/pantallas/agregar-nino.dc.html`: colores hex, radios, sombras y tamaños exactos del HTML fuente.

**Out of scope (para specs futuros):**

- Persistencia real: BD, API, base de datos de cualquier tipo. El alta vive en memoria del proceso servidor y se pierde al reiniciarlo.
- Editar o eliminar niños (el botón «Editar» del perfil sigue con `href="#"`).
- Búsqueda funcional y filtro por sala (el buscador de `/kids` sigue siendo visual).
- Vincular padres desde el alta: el niño nuevo nace con 0 padres y por eso muestra el badge VINCULAR.
- Detectar badges MANÍ / LACTOSA a partir del texto libre de ALERGIAS.
- Subida de foto o selección de color de avatar por el usuario.
- Reutilizar el mismo diálogo para «Editar niño».
- Maquetación mobile dedicada.

## Data model

```ts
// app/lib/data.ts (extensiones)

export const rooms: string[] = [
  "Soles", "Lunas", "Estrellas", "Nubes", "Arcoíris",
  "Mariposas", "Peces", "Dinosaurios", "Globos", "Ballenas",
];

export const avatarPalette: { bg: string; fg: string }[] = [
  { bg: "#A9D9E8", fg: "#1F7A93" },
  { bg: "#F4B8CC", fg: "#C44A7A" },
  { bg: "#B9DEC4", fg: "#3E8B62" },
  { bg: "#F4DC8E", fg: "#9A7B1E" },
  { bg: "#C9B6E8", fg: "#7B5FC0" },
  { bg: "#A9C7E8", fg: "#1F7A93" },
];

export function slugifyKidId(fullName: string): string;        // "martina-lopez"; si choca: "martina-lopez-2"
export function computeAgeLabel(birthDate: Date): string;       // "3 años" | "1 año"
export function formatBirthDateLabel(birthDate: Date): string;  // "12 mar 2022"
export function formatJoinedLabel(date: Date): string;          // "oct 2026"
```

```ts
// app/kids/actions.ts (nuevo)

export type AddKidResult =
  | { ok: true }
  | { ok: false; errors: { fullName?: string; birthDate?: string; room?: string } };

export async function addKid(formData: FormData): Promise<AddKidResult>;
```

El `Kid` construido al guardar:

```ts
{
  id: slugifyKidId(fullName),           // "martina-lopez"; si choca: "martina-lopez-2"
  fullName,                             // tal cual se escribió (trim)
  initial: fullName[0].toUpperCase(),
  ageLabel: computeAgeLabel(birthDate), // derivada de la fecha ingresada
  room,                                 // nombre elegido en el combo, p. ej. "Lunas"
  birthDateLabel: formatBirthDateLabel(birthDate),
  joinedLabel: formatJoinedLabel(new Date()),
  ...avatarPalette[kids.length % avatarPalette.length],
  allergyNotes,                         // "alergias · notas" (solo lo no vacío)
  linkedParents: [],                    // sin padres → badge VINCULAR en KidCard
}
```

Reglas derivadas (no se guardan duplicadas):

- `allergyNotes` concatena ALERGIAS y NOTAS en ese orden, separados por ` · `, omitiendo los vacíos. Si ambos quedan vacíos, el campo no se asigna y el perfil no pinta la caja «Alergias y notas».
- No se asigna `allergy` (el badge MANÍ/LACTOSA sigue reservado a los datos fake del SPEC 02).
- `id` se genera en minúsculas sin acentos ni `ñ` (NFD + strip diacríticos), con `-` como separador; ante colisión se añade sufijo `-2`, `-3`, …
- El contador del encabezado sigue siendo `kids.length`.

## Implementation plan

1. Extender `app/lib/data.ts` con `rooms`, `avatarPalette` y los cuatro helpers puros. Verificar: `npx tsc --noEmit` limpio y `/kids` sigue idéntico.
2. Crear `app/kids/actions.ts` con `"use server"` y `addKid`: revalida los tres obligatorios (nombre no vacío, fecha `dd/mm/aaaa` real y no futura, sala presente en `rooms`), construye el `Kid` y hace `kids.push()`. Devuelve `AddKidResult`. Verificar: `npx tsc --noEmit` limpio.
3. Crear `app/components/AddKidDialog.tsx` (`"use client"`) con el botón trigger idéntico al actual y la estructura del modal (backdrop, card, header Cancelar/Agregar niño/Guardar). Sin lógica de formulario todavía. Verificar: en `/kids` el botón abre y «Cancelar» cierra el modal.
4. Implementar el formulario controlado dentro del diálogo: los cinco campos con sus estilos del mockup, el `<select>` de `rooms` con placeholder, y la máscara `dd/mm/aaaa` sobre el input de fecha. Verificar: el combo lista 10 salas y la fecha se formatea sola.
5. Implementar la validación en cliente: errores en español bajo cada campo obligatorio, borde `#D9583C`, el modal no se cierra si hay errores; `Esc` y clic en el backdrop cierran descartando; el foco cae en NOMBRE COMPLETO al abrir. Verificar: «Guardar» vacío muestra tres errores.
6. Conectar el submit a `addKid` + `router.refresh()`; resetear el formulario tras cerrar (guardar o cancelar). Verificar: guardar un niño válido cierra el modal, agrega la tarjeta al final del grid y el contador pasa a 9.
7. Reemplazar el rótulo «SALA SOLES» por «TODAS LAS SALAS» en `app/kids/page.tsx` y el `<a href="#">` del botón por `<AddKidDialog />`. Verificar: encabezado correcto y botón sin `href="#"`.
8. Verificar el alta de punta a punta: `/kids/martina-lopez` muestra el perfil completo del niño nuevo con su sala y su fecha; los 8 niños del SPEC 02 siguen intactos. **Si la tarjeta no aparece** (instancia duplicada del módulo), centralizar `kids` en un singleton sobre `globalThis` dentro de `data.ts`.
9. Detalle de fidelidad: colores, radios, sombras y tipografías contra `agregar-nino.dc.html` (abrir el mockup con Playwright para comparar; capturas en `.playwright-mcp/`).
10. Verificación final: `npx tsc --noEmit`, `npx eslint app/`, repaso visual de `/kids` y `/kids/[id]`.

## Acceptance criteria

- [x] Clic en «Agregar niño» de `/kids` abre el diálogo modal sin navegar y sin recargar la página.
- [x] El diálogo replica `agregar-nino.dc.html`: header «Cancelar | Agregar niño | Guardar» y los cinco campos con los mismos textos, colores y radios.
- [x] El combo SALA lista exactamente 10 salas e incluye «Soles»; inicia vacío con el placeholder «Selecciona una sala…».
- [x] La fecha se auto-formatea con barras mientras se escribe y siempre termina en el formato `dd/mm/aaaa`.
- [x] «Guardar» con los tres campos obligatorios vacíos muestra mensajes de error en español bajo cada uno y el modal permanece abierto.
- [x] Una fecha con formato inválido (`31/02/2020`, `99/99/9999`, incompleta) o futura muestra error de fecha y no cierra el modal.
- [x] Seleccionar una de las 10 salas limpia el error de SALA; omitirlo lo mantiene.
- [x] ALERGIAS y NOTAS MÉDICAS son opcionales: guardar con ambos vacíos cierra el modal sin errores.
- [x] Cancelar, la tecla Esc y el clic en el backdrop cierran el diálogo y descartan lo escrito.
- [x] Al reabrir el diálogo después de guardar o cancelar, el formulario arranca limpio.
- [x] Con el formulario válido, «Guardar» cierra el modal y la tarjeta del niño nuevo aparece al final del grid.
- [x] El encabezado de la grilla dice «TODAS LAS SALAS · {N} niños» y el contador refleja el total real.
- [x] La tarjeta nueva navega a `/kids/{id}` y ese perfil muestra nombre, edad derivada, sala, fecha de nacimiento y fecha de ingreso.
- [x] El perfil del niño nuevo pinta la caja «Alergias y notas» solo si se escribió alergias o notas.
- [x] El niño nuevo muestra el badge VINCULAR (0 padres) y el orden de los 8 niños originales no cambia.
- [x] `npx tsc --noEmit` sin errores.
- [x] `npx eslint app/` sin errores.
- [x] Comparación visual con el mockup: colores, radios, sombras y tipografías coinciden.
- [x] `/` y `/kids/[id]` de los SPEC 01/02 siguen renderizando correctamente.

## Decisions

- **Yes:** modal overlay sobre `/kids` con backdrop. **No:** ruta `/kids/new` ni card inline. Confirmado por el usuario.
- **Yes:** server action que hace `kids.push()` en el servidor + `router.refresh()` desde el cliente. **No:** mutar el array solo en el navegador (el perfil es un server component y no vería al niño) ni localStorage. Confirmado tras explicar que navegador y servidor tienen instancias separadas del módulo.
- **Yes:** el botón trigger vive dentro de `AddKidDialog.tsx`, de modo que `app/kids/page.tsx` sigue siendo server component. **No:** `"use client"` en la página (rompería el render del grid desde el servidor y el refresh).
- **Yes:** validación propia con mensajes en español. **No:** atributo `required` de HTML5 (el aviso lo pinta el navegador en su idioma).
- **Yes:** input de texto con máscara `dd/mm/aaaa`. **No:** `type="date"`: el formato visible lo decide el navegador según su locale y no se puede forzar.
- **Yes:** SALA arranca vacío con placeholder. **No:** «Soles» preseleccionado como el mockup: la obligatoriedad debe poder comprobarse.
- **Yes:** `<select>` nativo con `appearance-none` + chevron propio. **No:** dropdown custom. Mismo aspecto con menos código y accesibilidad gratis.
- **Yes:** 10 salas inventadas en español (Soles, Lunas, Estrellas, Nubes, Arcoíris, Mariposas, Peces, Dinosaurios, Globos, Ballenas). **No:** «Sala 1 … Sala 10» ni lista externa.
- **Yes:** encabezado «TODAS LAS SALAS». **No:** mantener «SALA SOLES» (mentiría al agregar un niño de otra sala) ni «NIÑOS».
- **Yes:** derivar inicial, edad, fecha de ingreso y color de avatar (paleta existente, índice por `kids.length`). **No:** pedirlos en el formulario.
- **Yes:** alergias y notas como texto libre en `allergyNotes`. **No:** obligatorios ni detección de badges MANÍ/LACTOSA.
- **Yes:** id = slug del nombre con sufijo numérico ante colisión. **No:** id incremental ilegible en la URL.
- **Yes:** el diálogo se cierra con Cancelar, Esc y clic en el backdrop. **No:** solo Cancelar.
- **Yes:** inputs con `outline-none` (consistente con el resto de la app y con el helmet del mockup). **No:** anillo de foco nuevo.
- **Yes:** la action revalida los tres obligatorios aunque el cliente ya validó. **No:** confiar ciegamente en el cliente (defensa ante envíos manipulados).

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `data.ts` podría instanciarse por separado en el bundle de la action y en el de la página, dejando el `kids.push()` invisible para el render | Paso 8 verifica el alta de punta a punta. Si la tarjeta no aparece, centralizar el array en un singleton sobre `globalThis` dentro de `data.ts`. |
| El alta se pierde al reiniciar el servidor (en memoria del proceso) | Aceptado: no hay BD. Registrado en out-of-scope. |
| Mutar `kids` afecta a las vistas que lo leen (`/kids` y `/kids/[id]`) | Paso 8 revisa ambas rutas y confirma que los 8 niños originales y sus badges siguen intactos. |
| Máscara de fecha con pegado parcial o borrado a medias produce secuencias inválidas | La validación de fecha real rechaza cualquier secuencia incompleta antes de cerrar el modal. |
| `Esc` cierra el modal aunque el foco esté en un input y se pierda lo escrito | Decisión del usuario (idéntico a Cancelar); queda registrado en Decisions. |
| El slug del nuevo niño choca con un id ya existente del SPEC 02 | `slugifyKidId` añade sufijo `-2`, `-3`, … hasta encontrar uno libre. |
| Formulario con Enter dentro del input dispara un submit inesperado | El form usa `onSubmit` con `preventDefault` y una única lógica de validación; se prueba Enter en el paso 6. |

## What is **not** in this spec

- Cualquier persistencia: BD, API, archivos, localStorage.
- Editar o eliminar niños.
- Búsqueda funcional y filtro por sala.
- Vinculación de padres desde el alta (el niño nace con 0 padres).
- Detección de badges de alergia desde texto libre.
- Foto de perfil o elección de color de avatar.
- Reutilizar el diálogo para «Editar niño».
- Maquetación mobile dedicada.
