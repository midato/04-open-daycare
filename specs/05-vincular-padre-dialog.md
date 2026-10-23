# SPEC 05 — Diálogo «Vincular padre» desde el perfil del niño

> **Status:** Implemented
> **Depends on:** SPEC 02, SPEC 04
> **Date:** 2026-10-23
> **Objective:** Implementar el modal «Vincular padre» que se abre desde el link «Vincular otro padre» de `/kids/[id]`, con validación de NOMBRE DEL PADRE/MADRE, EMAIL y PARENTESCO, código de invitación estático y un CTA que solo valida y cierra.

## Scope

**In:**

- `app/components/LinkParentDialog.tsx` (client component, nueva): renderiza el link trigger «Vincular otro padre» (círculo punteado + plus, texto `#C5503A`) que vive en el card PADRES VINCULADOS del perfil, y al clickearlo abre el diálogo modal superpuesto.
- Diálogo: backdrop oscuro + card de `max-width 480px` con header («Vincular padre» / «a {nombre del niño}» / botón X 34×34 `#F0E6D8`) y cuerpo con banner informativo azul + los cuatro bloques de `vincular-padre.dc.html`: NOMBRE DEL PADRE/MADRE, EMAIL, PARENTESCO (pills Mamá / Papá / Tutor/a) y CÓDIGO DE INVITACIÓN (caja amarilla punteada, código `7K4P9` + «Vence en 7 días»).
- Banner informativo y subtítulo del header **dinámicos** con el nombre del niño (`kid.fullName`), recibido por prop.
- NOMBRE DEL PADRE/MADRE, EMAIL y PARENTESCO son **obligatorios**. Validación propia en cliente al pulsar el CTA: borde `#D9583C` + mensaje en español bajo cada campo; el email además valida **formato**. El modal no se cierra con errores.
- CÓDIGO DE INVITACIÓN es un **display estático** (feature decisión 1a): se pinta desde `invitation.code` de `data.ts`, nunca muestra error; no es input.
- PARENTESCO arranca **vacío** (decisión 2): ninguna pill seleccionada; equivale a SALA en SPEC 04.
- Cierre del diálogo con X, `Esc` y clic en backdrop, descartando lo escrito y reseteando el form.
- CTA «Enviar invitación» (decisión 4a): valida; inválido → muestra errores y queda abierto; válido → **cierra el modal sin agregar padre, sin action, sin persistencia**.
- `app/kids/[id]/page.tsx`: el `<a href="#">` «Vincular otro padre» se reemplaza por `<LinkParentDialog kidFullName={kid.fullName} />`; la página sigue server component.
- `app/lib/data.ts`: nuevo export `parentescoOptions = ["Mamá", "Papá", "Tutor/a"] as const`; reutilización de `invitation.code` ya existente.
- Fidelidad visual exacta contra `vincular-padre.dc.html`.

**Out of scope (para specs futuros):**

- Envío real de invitación (correo, action, backend); el CTA se implementará posteriormente a pedido del usuario.
- Agregar el padre a `linkedParents` o badge PENDIENTE dinámico tras el cierre.
- Validar que el email no duplique a un padre ya vinculado.
- Generación de códigos aleatorios por invitación y expiración real.
- Cualquier persistencia: BD, API, localStorage.
- Maquetación mobile dedicada.

## Data model

```ts
// app/lib/data.ts (extensión)
export const parentescoOptions = ["Mamá", "Papá", "Tutor/a"] as const;
// Reutilizado del SPEC 03: invitation.code → "7K4P9"
```

```ts
// Estado del componente (no hay estructuras nuevas en servidor)
type FieldErrors = { fullName?: string; email?: string; parentesco?: string };
type Parentesco = (typeof parentescoOptions)[number]; // "" vacío inicial
```

Todo lo demás se reutiliza del modelo existente (`Kid`, `invitation`); no hay estructuras nuevas de datos en servidor.

## Implementation plan

1. Extender `app/lib/data.ts` con `parentescoOptions`. Verificar: `npx tsc --noEmit` limpio.
2. Crear `app/components/LinkParentDialog.tsx` con el trigger idéntico al link actual y la estructura del modal (backdrop, card 480px, header con botón X), sin formulario. Verificar: clic abre; X, `Esc` y backdrop cierran; foco en el primer input al abrir.
3. Implementar el formulario controlado: banner informativo dinámico, NOMBRE DEL PADRE/MADRE, EMAIL, pills de PARENTESCO (estado vacío + `aria-pressed`), caja de CÓDIGO DE INVITACIÓN desde `invitation.code` y CTA «Enviar invitación». Verificar: visual contra el mockup.
4. Implementar la validación en cliente: mensajes en español bajo nombre/email/parentesco, borde `#D9583C`, errores se limpian al corregir; con todo válido el CTA cierra el modal sin efectos colaterales. Verificar: CTA con todo vacío muestra 3 errores; válido cierra.
5. Reemplazar el `<a href="#">` de `app/kids/[id]/page.tsx` por `<LinkParentDialog kidFullName={kid.fullName} />`. Verificar: el link abre el modal sin navegar y el card PADRES VINCULADOS queda intacto.
6. Detalle de fidelidad: colores, radios, sombras, tipografías contra `vincular-padre.dc.html` (comparación con Playwright; capturas en `.playwright-mcp/`).
7. Verificación final: `npx tsc --noEmit`, `npx eslint app/`, repaso visual de `/kids/[id]`, `/kids` y `/`.

## Acceptance criteria

- [x] Clic en «Vincular otro padre» de `/kids/[id]` abre el modal sin navegar ni recargar.
- [x] El modal replica `vincular-padre.dc.html`: header «Vincular padre» + «a {niño}» + botón X (34×34, `#F0E6D8`), banner azul `#E3ECFB`, labels tracking `.7px`, inputs radio 14px, pills 999px y caja de código punteada `#FBF1D6`/`#E6D08A`.
- [x] El subtítulo del header y el banner usan el nombre del niño dinámicamente («a Mateo Fernández», «…el feed de Mateo»).
- [x] NOMBRE DEL PADRE/MADRE vacío muestra borde `#D9583C` + mensaje en español y el modal permanece abierto.
- [x] EMAIL vacío muestra error; texto sin formato de correo muestra error de formato.
- [x] PARENTESCO inicia con ninguna pill seleccionada; sin selección muestra error; al elegir una pill se limpia el error y toma el estilo seleccionado (`#9FB8EC`/`#CCD8F4`/`#4E72C8`).
- [x] CÓDIGO DE INVITACIÓN es solo lectura con `7K4P9` y «Vence en 7 días»; nunca muestra error ni es input.
- [x] «Enviar invitación» con todo válido cierra el modal; no agrega padres al card, no invoca actions ni persiste nada.
- [x] «Enviar invitación» con campos inválidos muestra los errores y deja el modal abierto.
- [x] X, `Esc` y clic en el backdrop cierran descartando lo escrito; al reabrir el form arranca limpio.
- [x] La lista PADRES VINCULADOS queda idéntica tras abrir, cerrar y (re)abrir el modal.
- [x] `npx tsc --noEmit` sin errores; `npx eslint app/` sin errores.
- [x] Comparación visual con el mockup: colores, radios, sombras y tipografías coinciden.
- [x] `/`, `/kids` y `/login` siguen renderizando intactos.

## Decisions

- **Yes:** modal overlay sobre el perfil, patrón del SPEC 04 (backdrop + card + cerrar con X/Esc/backdrop). **No:** ruta dedicada ni panel inline: consistencia con `AddKidDialog` y fidelidad al mockup.
- **Yes:** trigger dentro de `LinkParentDialog.tsx`; `page.tsx` queda server component. **No:** `"use client"` en la página completa.
- **Yes:** CÓDIGO DE INVITACIÓN como display estático. **No:** input editable. Decisión del usuario (1a); el mockup muestra una vitrina del código, no un campo.
- **Yes:** PARENTESCO arranca vacío. **No:** «Mamá» preseleccionada como en el mockup. Decisión del usuario (2); sin vacío no se puede comprobar la obligatoriedad (mismo racional que SALA en SPEC 04).
- **Yes:** email con validación de formato además de obligatorio. **No:** solo no-vacío. Decisión del usuario (3).
- **Yes:** CTA válido cierra el modal sin persistir. **No:** action fake ni «enviado con éxito» reinventado. Decisión del usuario (4a); sin BD, el feedback es el cierre.
- **Yes:** labels del mockup («NOMBRE DEL PADRE/MADRE», «EMAIL»). **No:** «NOMBRE COMPLETO»/«MAIL» del prompt. Decisión del usuario (5, fidelidad).
- **Yes:** validación propia en cliente, sin atributo `required` HTML5. **No:** el tooltip del navegador saldría en el idioma del SO (SPEC 04).
- **Yes:** pills como `<button type="button">` con `aria-pressed`. **No:** radio-group oculto; idéntico visualmente y más simple.
- **Yes:** reutilizar `invitation.code` (7K4P9). **No:** duplicarlo en data.ts ni generarlo al azar: sin BD, un solo código fake demo.
- **Yes:** el botón X cierra el modal. **No:** navegar a otra URL como el `<a>` del mockup (en la app el subyacente ya es el perfil).

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Reemplazar el `<a>` del perfil rompe el layout del card PADRES VINCULADOS | Paso 5 verifica visualmente que el card quede idéntico. |
| Pills sin semántica de selección accesible | `aria-pressed` en cada pill; foco visible heredado del patrón existente. |
| Enter en un input dispara el submit inesperadamente | `onSubmit` con `preventDefault` y validación centralizada (SPEC 04); solo cierra si todo es válido. |
| `7K4P9` compartido con la pantalla de activación (SPEC 03) | Aceptado: código fake demo; se registra para no confundirlo con códigos reales futuros. |

## What is **not** in this spec

- Envío de invitación real (correo/action/backend) ni estado «enviado».
- Alta del padre en `linkedParents` o en el perfil.
- Anti-duplicado de email, códigos aleatorios, expiración real.
- Persistencia de cualquier tipo.
- Maquetación mobile dedicada.
