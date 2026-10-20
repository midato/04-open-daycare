# SPEC 03 — Login (/login) y activación de cuenta (/activate-account)

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-10-19
> **Objective:** Implementar las pantallas `/login` y `/activate-account` como copias visuales de `login.dc.html` y `activar-cuenta.dc.html`, estáticas y sin autenticación.

## Scope

**In:**

- Ruta `/login` (`app/login/page.tsx`): pantalla completa a dos columnas **sin sidebar**. Panel izquierdo con gradiente `#F6A98E→#EC7E62`, logo OpenDayCare, titular, subtítulo, «🌿 Guardería Sala Soles» y círculos decorativos (`overflow-hidden`).
- Formulario de login: «Iniciar sesión», subtítulo, EMAIL precargado (`caro@opendaycare.com`), CONTRASEÑA vacía con placeholder `••••••••`, «¿Olvidaste tu contraseña?» sin acción, botón «Iniciar sesión» → `/`, link «Activá tu cuenta» → `/activate-account`.
- **Sin** la sección «INGRESO COMO» (botones Personal / Familia) — excluida a pedido del usuario.
- Ruta `/activate-account` (`app/activate-account/page.tsx`): pantalla centrada, sin sidebar. Logo gradiente, título «Bienvenida a OpenDayCare», subtítulo, card de invitación (avatar «M», «Mateo · Sala Soles»).
- Campos precargados como el mockup: código `7K4P9`, email `lucia.fernandez@gmail.com`, contraseña precargada. Inputs uncontrolled (`defaultValue`), sin `useState`.
- Checkbox nativo de consentimiento de fotos con `defaultChecked` (marcado, sin validación).
- Botón «Activar mi cuenta» → `/`; link «¿Ya tenés cuenta? Iniciar sesión» → `/login`.
- Datos de la invitación y defaults de login en `app/lib/data.ts`.
- Actualizar `Sidebar.tsx`: botón de logout `href="#"` → `href="/login"`.

**Out of scope (para specs futuros):**

- La sección «Ingreso como Personal o Familia» del login.
- Autenticación real, validación de credenciales, sesión, guard de rutas.
- Recuperación de contraseña («¿Olvidaste tu contraseña?» queda inerte).
- Flujo real de invitación: código dinámico, email real, expiración.
- Validación de formularios (campos obligatorios, fortaleza de contraseña, checkbox).
- Logout real (solo cambia el `href`).
- Maquetación mobile dedicada.

## Data model

```ts
// app/lib/data.ts (extensiones)

export const loginDefaults = {
  email: "caro@opendaycare.com",
};

export const invitation = {
  code: "7K4P9",
  email: "lucia.fernandez@gmail.com",
  password: "contraseña",
  childName: "Mateo",
  roomLabel: "Sala Soles",   // se muestra como "Mateo · Sala Soles"
  initial: "M",
  avatarBg: "#A9D9E8",
  avatarFg: "#1F7A93",
};
```

## Implementation plan

1. Extender `app/lib/data.ts` con `loginDefaults` e `invitation`. Verificar: `npx tsc --noEmit` limpio.
2. Crear `app/login/page.tsx` con el layout a dos columnas y el panel de marca completo. Verificar: `/login` compila y muestra el panel izquierdo.
3. Completar el formulario de login (campos, «¿Olvidaste?» inerte, botón → `/`, link → `/activate-account`), sin la sección «INGRESO COMO». Verificar: `/login` replica el mockup (sin botones de rol).
4. Crear `app/activate-account/page.tsx`: chrome centrado, logo, títulos y card de invitación desde `invitation`. Verificar: `/activate-account` compila y muestra la card.
5. Completar el formulario de activación: campos precargados, checkbox `defaultChecked`, botón → `/`, link → `/login`. Verificar: visual contra el mockup.
6. Cambiar el logout en `app/components/Sidebar.tsx` a `href="/login"`. Verificar: `/` y `/kids` siguen idénticos y el logout navega al login.
7. Detalle de fidelidad: sombras, radios, tamaños, colores hex/px contra los HTML fuente y `references/screenshots/` (no hay screenshot propio de estas pantallas; comparar contra el `.dc.html`).
8. Verificación final: `npx tsc --noEmit`, `npx eslint app/`, revisión visual de ambas rutas y de `/` tras el cambio del sidebar.

## Acceptance criteria

- [x] `/login` renderiza las dos columnas: panel de marca con gradiente, logo, titular y «Guardería Sala Soles».
- [x] `/login` **no** contiene la sección «INGRESO COMO» ni los botones Personal / Familia.
- [x] El email del login viene precargado con `caro@opendaycare.com`; la contraseña está vacía con placeholder `••••••••`.
- [x] «¿Olvidaste tu contraseña?» no navega ni dispara ninguna acción.
- [x] El botón «Iniciar sesión» navega a `/`.
- [x] El link «Activá tu cuenta» navega a `/activate-account`.
- [x] `/activate-account` muestra la card de invitación con avatar «M» y «Mateo · Sala Soles».
- [x] Código precargado `7K4P9`, email `lucia.fernandez@gmail.com` y contraseña precargada en sus inputs.
- [x] El consentimiento de fotos es un `<input type="checkbox">` nativo y viene marcado.
- [x] «Activar mi cuenta» navega a `/`; «Iniciar sesión» navega a `/login`.
- [x] El logout del sidebar navega a `/login`.
- [x] `/` y `/kids` siguen renderizando correctamente tras el cambio del sidebar.
- [x] No hay `useState` ni lógica de validación en ninguna de las dos pantallas.
- [x] `npx tsc --noEmit` sin errores.
- [x] `npx eslint app/` sin errores.
- [x] Comparación visual con `login.dc.html` y `activar-cuenta.dc.html`: colores, radios, sombras y tipografías coinciden.

## Decisions

- **Yes:** rutas `/login` y `/activate-account` en inglés. **No:** `/activar-cuenta`. Convención del SPEC 02.
- **Yes:** «Iniciar sesión» navega a `/` (feed del SPEC 01). **No:** `href="#"`. Confirmado por el usuario; el mockup también navega al feed.
- **Yes:** campos precargados con `defaultValue` (uncontrolled). **No:** vacíos ni `useState`. Fidelidad al mockup y cero lógica, como los likes/buscadores de specs previos.
- **Yes:** checkbox nativo con `defaultChecked`. **No:** div con check dibujado. Accesible y se ve igual.
- **Yes:** «¿Olvidaste tu contraseña?» como span sin acción. **No:** pantalla de recuperación ni `href="#"`. No hay a dónde ir; queda registrado en out-of-scope.
- **Yes:** logout del sidebar → `/login`. **No:** mantener `href="#"`. Integración confirmada por el usuario.
- **Yes:** datos de invitación en `app/lib/data.ts`. **No:** hardcodeados en JSX. Consistente con SPEC 01/02.
- **Yes:** pantallas de auth sin sidebar. **No:** reutilizar `Sidebar.tsx`. El mockup es full-screen.
- **Yes:** excluir la sección «Ingreso como Personal o Familia». **No:** implementarla con estado simulado. Decisión explícita del usuario; si se necesita, va en otro spec.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| Login sin selector de rol siempre cae en el feed de personal | Aceptado y registrado en out-of-scope; la UI de rol se implementará junto a auth real. |
| Círculos decorativos absolutos del panel de marca desbordan en pantallas chicas | `overflow:hidden` en el panel, igual que el mockup. |
| Cambiar el logout del Sidebar afecta a `/` y `/kids` | Paso 6 incluye verificación visual de ambas rutas. |

## What is **not** in this spec

- Sección «Ingreso como Personal o Familia».
- Autenticación, sesión, guard de rutas, logout real.
- Recuperación de contraseña.
- Flujo real de invitación y validación de formularios.
- Maquetación mobile dedicada.
