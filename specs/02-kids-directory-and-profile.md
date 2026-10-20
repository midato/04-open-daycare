# SPEC 02 — Directorio de niños (/kids) y perfil de niño (/kids/[id])

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-10-19
> **Objective:** Implementar las pantallas `/kids` (directorio de niños) y `/kids/[id]` (perfil) como copias visuales de `ninos.dc.html` y `perfil-nino.dc.html`, con datos estáticos en TypeScript y sin persistencia.

## Scope

**In:**

- Extender `app/components/Sidebar.tsx` con prop `activeItem: "feed" | "kids"`; el ítem activo usa fondo `#FBE3D8` / texto `#D9583C`. Actualizar `app/page.tsx` para pasar `activeItem="feed"`. Nav label «Niños» con `href="/kids"`.
- Ruta `/kids` (`app/kids/page.tsx`): header «GESTIÓN / Niños», botón «Agregar niño» (`href="#"`), buscador visual (input sin lógica), encabezado de sala «SALA SOLES · 8 niños», grid de 2 columnas con las 8 tarjetas del mockup.
- Componente `app/components/KidCard.tsx`: avatar con inicial + color, nombre, «N años · X padres vinculados» (o «sin padres vinculados»), badge de alergia (MANÍ / LACTOSA) o badge VINCULAR (si 0 padres) o chevron; hover `#F2A78E` + `translateY(-2px)`.
- Ruta `/kids/[id]` (`app/kids/[id]/page.tsx`): resuelve `params.id` contra el array estático. Link «Volver a Niños» → `/kids`. Cabecera (avatar 84px, nombre, «N años · Sala Soles», botón «Editar» → `href="#"`). Caja «Alergias y notas» **solo si el niño tiene alergia/notas**. Tarjeta de datos (fecha de nacimiento, sala, ingreso). Columna derecha: botón «Resumen del día» (`href="#"`) y card «PADRES VINCULADOS» con lista de padres (badges ACTIVA/PENDIENTE) y «Vincular otro padre» (`href="#"`).
- Datos estáticos en `app/lib/data.ts`: array de 8 niños del mockup + enumeración de alergias con colores + padres ficticios.
- Si `params.id` no existe: página simple «Niño no encontrado» con enlace a `/kids` (estilo mínimo dentro de la paleta).
- Fidelidad visual con valores hex/px exactos del mockup (mismo criterio Tailwind que SPEC 01).

**Out of scope (para specs futuros):**

- Búsqueda funcional, CRUD de niños, formulario agregar/editar (`agregar-nino`).
- Persistencia, BD, API, autenticación.
- Flujo de vinculación de padres (`vincular-padre`) y resumen del día (`resumen-dia`).
- Estados vacíos de sala sin niños, loading, error de red.
- Maquetación mobile dedicada.

## Data model

```ts
// app/lib/data.ts (extensiones)

export type AllergyKey = "peanut" | "lactose";

export interface AllergyBadge {
  label: string;        // "MANÍ" | "LACTOSA"
  bg: string;           // "#FBD8CC"
  fg: string;           // "#D9684A"
}

export type ParentStatus = "active" | "pending";

export interface KidParent {
  id: string;
  name: string;         // "Lucía Fernández"
  role: string;         // "Mamá" | "Papá"
  status: ParentStatus; // ACTIVA #CFEBD8/#3E9B6C · PENDIENTE #F7E7A6/#9A7B1E
  avatarBg: string;
}

export interface Kid {
  id: string;             // "mateo-fernandez"
  fullName: string;       // "Mateo Fernández"
  initial: string;        // "M"
  ageLabel: string;       // "3 años"
  room: string;           // "Soles"
  birthDateLabel: string; // "12 mar 2022"
  joinedLabel: string;    // "feb 2025"
  avatarBg: string;       // "#A9D9E8"
  avatarFg: string;       // "#1F7A93"
  allergy?: AllergyKey;
  allergyNotes?: string;  // caja «Alergias y notas» del perfil
  linkedParents: KidParent[];
}

export const allergyBadges: Record<AllergyKey, AllergyBadge> = { /* peanut, lactose */ };
export const kids: Kid[] = [/* 8 niños del mockup */];
```

Reglas derivadas (no se guardan duplicadas):

- Contador «X padres vinculados» = `linkedParents.length`.
- Badge VINCULAR en la lista cuando `linkedParents.length === 0`.
- Caja de alerta del perfil solo si `allergyNotes` está presente.

## Implementation plan

1. Ampliar `app/lib/data.ts` con `AllergyKey`, `AllergyBadge`, `ParentStatus`, `KidParent`, `Kid`, `allergyBadges` y `kids` (los 8 del mockup). Verificar: `npx tsc --noEmit` limpio.
2. Añadir `activeItem` a `Sidebar.tsx` y pasar `activeItem="feed"` desde `page.tsx`. Verificar: `/` se ve idéntico al SPEC 01 y «Niños» navega a `/kids`.
3. Crear `app/kids/page.tsx` con header, botón «Agregar niño», buscador y encabezado de sala. Verificar: `/kids` compila y muestra el chrome sin la grilla.
4. Crear `app/components/KidCard.tsx` y mapear `kids` en el grid de 2 columnas. Verificar: `/kids` muestra las 8 tarjetas con badges correctos (MANÍ, LACTOSA, VINCULAR, chevron).
5. Crear `app/kids/[id]/page.tsx`: lookup por `params.id`, link de vuelta, cabecera, datos y columna de padres. Verificar: `/kids/mateo-fernandez` replica el mockup del perfil.
6. Condicionar la caja «Alergias y notas» a `allergyNotes` y añadir el fallback «Niño no encontrado». Verificar: `/kids/sofia-mendez` no muestra caja roja; `/kids/no-existe` muestra el fallback.
7. Detalle de fidelidad: hover de tarjeta, sombras, radios, scrollbar. Comparación lado a lado con `references/screenshots/`.
8. Verificación final: `npx tsc --noEmit`, `npx eslint app/`, revisión visual de ambas rutas.

## Acceptance criteria

- [x] `/kids` renderiza el header «GESTIÓN / Niños» y el botón «Agregar niño» (`href="#"`).
- [x] El input «Buscar niño…» es solo visual: sin `onChange`, `useState` ni filtrado.
- [x] Se muestran exactamente 8 tarjetas desde el array `kids`, en grid de 2 columnas.
- [x] Las tarjetas muestran el badge correcto: MANÍ (Mateo), LACTOSA (Tomás), VINCULAR (Valentina), chevron (el resto).
- [x] El hover de las tarjetas cambia el borde a `#F2A78E` y aplica `translateY(-2px)`.
- [x] `/kids/[id]` resuelve el niño por `params.id`; Mateo replica el mockup de perfil.
- [x] Sin `allergyNotes`, la caja «Alergias y notas» no se renderiza.
- [x] La card «PADRES VINCULADOS» lista los padres con badges ACTIVA/PENDIENTE y el enlace «Vincular otro padre» (`href="#"`).
- [x] Un `id` inexistente muestra «Niño no encontrado» con enlace a `/kids`.
- [x] El sidebar reutilizado marca «Niños» como activo en ambas rutas y «Feed» sigue activo en `/`.
- [x] Todos los enlaces a páginas futuras usan `href="#"`; solo `/`, `/kids` y `/kids/[id]` navegan de verdad.
- [x] `npx tsc --noEmit` sin errores.
- [x] `npx eslint app/` sin errores.
- [x] Comparación visual con ambos mockups: colores, tipografías, radios y sombras coinciden.

## Decisions

- **Yes:** rutas en inglés `/kids` y `/kids/[id]`. **No:** `/ninos`. Preparado para el futuro, como pidió el usuario.
- **Yes:** reutilizar `Sidebar.tsx` con `activeItem`. **No:** duplicar el sidebar por sección.
- **Yes:** tipos y campos en inglés (`Kid`, `linkedParents`…); copy de UI en español. Convención `AGENTS.md`.
- **Yes:** enumeración `AllergyKey` + `allergyBadges` con colores. **No:** texto de alergia hardcodeado por niño en el JSX. Ficticio por ahora, pero centralizado.
- **Yes:** badge VINCULAR y contador de padres derivados de `linkedParents`. **No:** campos duplicados en el objeto.
- **Yes:** ocultar la caja de alergias cuando no hay datos. **No:** estado vacío estilizado. Sin copy nuevo que inventar.
- **Yes:** buscador 100% visual. **No:** `useState` de filtrado. Mismo criterio que los likes del SPEC 01.
- **Yes:** fallback mínimo «Niño no encontrado». **No:** rediseñar una página de error. Suficiente para datos estáticos.
- **Yes:** sidebar modificado en sitio (SPEC 01 pasa a usar `activeItem="feed"`). **No:** fork del componente.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Cambiar `Sidebar.tsx` rompe la home del SPEC 01 | Paso 2 incluye verificación visual de `/` antes de continuar. |
| `params.id` en Next 16 puede ser `Promise` | Usar la forma que exija la docs en `node_modules/next/dist/docs/` (App Router params asíncronos si aplica). |
| Deriva de estilos Tailwind vs. mockup | Valores hex/px exactos del HTML fuente + comparación final con screenshots. |

## What is **not** in this spec

- Búsqueda funcional, agregar/editar niños.
- Cualquier persistencia o API.
- Vinculación real de padres y resumen del día.
- Estados de carga o error de red.
- Maquetación mobile dedicada.
