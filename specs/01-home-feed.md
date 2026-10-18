# SPEC 01 — Home (/) con feed idéntico a la plantilla

> **Status:** Implementado
> **Depends on:** —
> **Date:** 2026-10-18
> **Objective:** Implementar el Home (/) como copia visual fiel de `references/pantallas/feed.dc.html`, con datos estáticos en TypeScript y sin autenticación ni base de datos.

## Scope

**In:**

- Reescribir `app/page.tsx` para renderizar el layout del feed: sidebar fijo + main con header, tarjeta compositor y lista de posts.
- Sidebar completo (logo OpenDayCare / Sala Soles, botón «Nueva publicación», nav con «Feed» activo, footer de usuario Caro Giménez con botón de logout) usando `href="#"` en todos los enlaces que apuntan a páginas inexistentes.
- 3 posts estáticos del mockup: **logro** (Mateo), **actividad con foto** (Mateo), **anuncio general** — badges y colores exactos.
- Fuentes Fredoka y Nunito vía `next/font/google`.
- Estilos en Tailwind v4 traduciendo los valores exactos del mockup (colores, radios, sombras, tamaños).
- Datos en un archivo TS dedicado (array de posts + constantes de usuario/sala).

**Out of scope (para specs futuros):**

- Autenticación, login, logout real.
- Base de datos, persistencia, API.
- Páginas crear-publicacion, detalle-publicacion, foto, niños, avisos, mi cuenta (los enlaces quedan como `href="#"`).
- CRUD de publicaciones.
- Lógica de likes/comentarios (solo se muestran los conteos estáticos).
- Diseño responsive dedicado para mobile (el mockup es desktop; el layout flex reflow natural, sin maquetación mobile propia).

## Data model

```ts
// app/lib/data.ts

export type PostType = "achievement" | "activity" | "announcement";

export interface FeedPost {
  id: string;
  type: PostType;
  authorName: string;        // "Mateo" | "Anuncio general"
  authorInitial?: string;    // "M"; el anuncio usa ícono de megáfono en su lugar
  time: string;              // "14:20"
  publishedBy: string;       // "publicado por vos"
  audience: string;          // "Para: familia de Mateo" | "Para: toda la sala"
  body: string;
  photoLabel?: string;       // solo tipo "activity": "Foto · pintando con témperas"
  likes: number;
  comments: number;
}

export const currentUser = {
  name: "Caro Giménez",
  role: "Maestra · Soles",
  initial: "C",
  room: "Sala Soles",
};

export const feedMeta = {
  kidsCount: 12,
  dateLabel: "martes 17 jun",
};

export const posts: FeedPost[] = [
  // achievement 14:20 (likes 3, comments 1),
  // activity 09:40 con photoLabel (likes 5, comments 2),
  // announcement 07:50 (likes 8, comments 0),
];
```

Tipos de badge por `type`:

- `achievement` → fondo `#CFEBD8`, punto/texto `#3E9B6C`, label `LOGRO`.
- `activity` → fondo `#C7E7F1`, punto/texto `#2E89A6`, label `ACTIVIDAD`.
- `announcement` → fondo `#CCD8F4`, punto/texto `#4E72C8`, label `ANUNCIO`.

## Implementation plan

1. Actualizar `app/layout.tsx`: importar Fredoka (400–700) y Nunito (400–800 + italic 400) con `next/font/google`, exponer variables CSS, `lang="es"`, metadata `title: "OpenDayCare"`. Ajustar `app/globals.css`: mapear las fuentes en `@theme`, fijar fondo `#F6ECDF` y texto `#3F362E`, quitar el bloque dark-mode heredado. Verificar: `npm run dev` sigue compilando (el contenido aún es el boilerplate).
2. Crear `app/lib/data.ts` con `PostType`, `FeedPost`, `currentUser`, `feedMeta` y `posts` (los 3 posts del mockup). Verificar: `npx tsc --noEmit` limpio.
3. Crear `app/components/Sidebar.tsx` (server component, sin props; importa `currentUser` del data file). Reemplazar el contenido de `app/page.tsx` por el layout flex con solo el sidebar renderizado. Verificar: `/` muestra el sidebar con estilo, sin enlaces rotos.
4. Crear `app/components/FeedPostCard.tsx` que recibe `post: FeedPost` y renderiza cabecera, badge, body, placeholder de foto (si `photoLabel`) y fila estática de likes/comentarios/editar. Verificar: renderizar un post de prueba en la página.
5. Componer en `app/page.tsx` el main completo: header («GUARDERÍA · SALA SOLES», «Buenas, Caro», «12 niños · martes 17 jun»), tarjeta compositor «Compartí un momento…» y `.map` de `posts` con `FeedPostCard`. Verificar: los 3 posts se ven con badges correctos.
6. Detalle de fidelidad: sombras, border-radius, scrollbar (`#E4D6C4`), espaciados finales contra el mockup. Verificar: comparación lado a lado con `references/screenshots/` del feed.
7. Verificación final: `npx tsc --noEmit`, `npx eslint app/`, y revisión visual en el navegador.

## Acceptance criteria

- [x] `npm run dev` y abrir `/` muestra el feed completo sin errores en consola.
- [x] No hay `<link>` de Google Fonts en el HTML; Fredoka y Nunito se sirven vía `next/font`.
- [x] El sidebar muestra logo «OpenDayCare / Sala Soles», botón «Nueva publicación», nav con «Feed» activo (fondo `#FBE3D8`, texto `#D9583C`) y footer «Caro Giménez · Maestra · Soles».
- [x] Todos los enlaces del sidebar y de los posts usan `href="#"`; ninguno navega a una ruta inexistente.
- [x] El header muestra «GUARDERÍA · SALA SOLES», «Buenas, Caro» y «12 niños · martes 17 jun».
- [x] La tarjeta compositor muestra «Compartí un momento…» con avatar «C» e ícono de cámara.
- [x] Se renderizan exactamente 3 posts desde el array `posts`, con badges LOGRO / ACTIVIDAD / ANUNCIO en sus colores.
- [x] El post de actividad incluye el placeholder de foto punteado con el texto «Foto · pintando con témperas».
- [x] Los contadores de likes y comentarios son texto estático; no hay `onClick` ni `useState` en likes/comentarios/editar.
- [x] `npx tsc --noEmit` sin errores.
- [x] `npx eslint app/` sin errores.
- [x] Comparación visual con el mockup: colores, border-radius, sombras y tipografías coinciden.

## Decisions

- **Yes:** Tailwind v4 con valores exactos del mockup (hex/px). **No:** copiar `style=""` inline. Convención del stack y mantenible.
- **Yes:** array estático + constantes en `app/lib/data.ts`. **No:** texto hardcodeado en JSX. Prepara el reemplazo futuro por BD/auth sin tocar componentes.
- **Yes:** `next/font/google`. **No:** `<link>` de Google Fonts en layout. Autoalojado, sin layout shift.
- **Yes:** componentes separados `Sidebar.tsx` y `FeedPostCard.tsx`. **No:** todo en `page.tsx`. El usuario pidió estructura para crecer.
- **Yes:** enlaces a páginas futuras como `href="#"`. **No:** deshabilitarlos visualmente ni borrarlos. Fidelidad al mockup y cero rutas rotas.
- **Yes:** likes/comentarios 100% estáticos. **No:** `useState` para simular like. Evita rediseño cuando llegue la lógica real.
- **Yes:** eliminar el dark-mode heredado de `globals.css`. **No:** respetar `prefers-color-scheme`. El mockup es solo claro.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Deriva de estilos Tailwind vs. mockup | Usar los valores hex/px exactos del HTML fuente; comparación visual final como criterio de aceptación. |
| Pesos de fuente incompletos (mockup usa Fredoka 400–700, Nunito 400–800 + italic) | Configurar todos los pesos en las opciones de `next/font`. |
| Dark-mode de `globals.css` pisa colores del diseño | Paso 1 elimina el bloque `prefers-color-scheme` y fija la paleta clara única. |

## What is **not** in this spec

- Autenticación y login.
- Base de datos o cualquier tipo de persistencia.
- Páginas crear-publicacion, detalle-publicacion, foto, niños, avisos, mi cuenta.
- Funcionalidad de likes, comentarios o edición.
- Maquetación mobile dedicada.
