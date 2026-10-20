<!-- BEGIN:nextjs-agent-rules -->

# Este NO es el Next.js que conoces

Esta versión tiene cambios importantes — las APIs, convenciones y la estructura de archivos pueden diferir de tus datos de entrenamiento. Lee la guía relevante en `node_modules/next/dist/docs/` (resuelta desde el directorio de este archivo; en monorepos el paquete `next` puede no ser visible desde la raíz del repositorio) antes de escribir cualquier código. Presta atención a los avisos de obsolescencia.

Este bloque es escrito y re-añadido por `next dev` — verifícalo en `node_modules/next/dist/server/lib/generate-agent-files.js`. Eliminarlo de un diff solo recrea el cambio sin commitear; commitearlo junto con tu trabajo mantiene el árbol limpio.

<!-- END:nextjs-agent-rules -->

## Stack y comandos

- Next.js 16.3 (App Router), React 19, Tailwind v4 (CSS-first: `@import "tailwindcss"` en `app/globals.css`, sin `tailwind.config`), TypeScript strict, alias `@/*`.
- Gestor de paquetes: **npm** (`package-lock.json`). El `pnpm-workspace.yaml` de la raíz es un placeholder heredado — no se usa (no hay `pnpm-lock.yaml`).
- Comandos: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.
- No hay suite de tests configurada. Verificación: `npx eslint app/` (limpio) y `npx tsc --noEmit`.
- **Gotcha de lint:** `npm run lint` falla con 2 errores en `references/pantallas/support.js` (archivo generado). Ignóralos; lintea solo `app/` para verificar tu código.
- El template de `create-next-app` ya no existe: están implementadas las rutas `/` (feed), `/login`, `/activate-account`, `/kids` y `/kids/[id]`. `specs/` es la fuente de verdad de qué está hecho y qué no — revisa el `Status:` de cada uno antes de asumir algo.

## Referencias de diseño

- `references/pantallas/*.dc.html` son mockups interactivos en español de la app (guardería / daycare); `references/screenshots/*.png` son sus capturas. Son la fuente de verdad del diseño/UI — ábrelos en el navegador (p. ej. con Playwright) para inspeccionar antes de implementar.
- `references/pantallas/support.js` es generado (dc-runtime), nunca editar.
- El copy de la UI va en **español mexicano** (tuteo). El diseño de referencia es la fuente de verdad de la *forma* (colores, tipografías, layout), no del *registro*: si un mockup trae voseo («Activá tu cuenta», «Creá tu contraseña», «Escribí un comentario…»), cámbialo a tuteo («Activa», «Crea», «Escribe») tanto en la implementación como en el `.dc.html`.

## Spec Driven Development - Skills

- /spec Usaremos esta habilidad para crear las especificaciones
- /spec-impl Usaremos esta skill para hacer las implementaciones
- /spec-verify Verifica un spec con el agente `spec-verifier` (`.opencode/agent/spec-verifier.md`): revisa cada criterio de `Acceptance criteria` con evidencia (`npx tsc --noEmit`, `npx eslint app/`, Context7, Playwright MCP + visión), corrige fallos locales, marca los checks en el spec y entrega un reporte en tabla. No cambia `Status:` ni hace commit.
- Hay skills locales en `.agents/skills/`: `spec` (diseña un spec en `specs/NN-slug.md`, en el idioma del prompt inicial) y `spec-impl` (implementa solo specs en estado `Approved`/`Aprobado`, creando rama `spec-NN-slug`). Nunca commitear automáticamente durante `spec-impl`.

## MCPs

- Las capturas de pantalla de Playwright y cualquier cosa relacionada con Playwright tiene que estar en la carpeta `.playwright-mcp` (gitignoreada). El MCP de Playwright ya está configurado en `opencode.json`.

## Reglas de código

- Usa la filosofía / conjunto de principios y buenas prácticas `Code Clean`.
- Usa nombres, funciones, variables, clases, etc en el idioma `Inglés`.
- Toda conversación, explicación y reporte hacia el usuario va en **español mexicano** (tuteo, «tú»). Nada de voseo rioplatense («podés», «contanos», «activá»).