# SPEC 09 — Autenticación y protección de rutas

> **Status:** Implemented
> **Depends on:** SPEC 03
> **Date:** 2026-11-03
> **Objective:** Implementar el inicio y cierre de sesión reales con Supabase y proteger las rutas privadas de la aplicación mediante sesiones SSR.

## Scope

**In:**

- Convertir el formulario visual de `/login` en un formulario real con email y contraseña usando `supabase.auth.signInWithPassword`.
- Mantener `/activate-account` como pantalla visual pública sin registro real.
- Mostrar estados de carga y errores inline en español durante el inicio de sesión.
- Redirigir a `/` después de un inicio de sesión exitoso.
- Implementar el cierre de sesión real desde el botón del sidebar mediante `supabase.auth.signOut`.
- Mantener y actualizar las cookies de sesión mediante los clientes existentes de `@supabase/ssr`.
- Proteger `/`, `/kids` y `/kids/[id]` desde `proxy.ts`.
- Redirigir a `/login` a las personas sin sesión que intenten acceder a una ruta privada.
- Redirigir a `/` a las personas autenticadas que visiten `/login` o `/activate-account`.
- Usar el proyecto Supabase configurado en el entorno, sin clientes HTTP alternativos ni credenciales nuevas en el repositorio.
- Verificar el flujo contra Supabase usando una cuenta existente proporcionada para desarrollo.

**Out of scope (para specs futuros):**

- Registro de usuarios con `signUp`.
- Activación real de cuenta mediante invitación.
- Confirmación de correo electrónico.
- Recuperación o cambio de contraseña.
- Autenticación social, magic links, passkeys o MFA.
- Autorización por rol (`staff`, `parent`, `admin`) más allá de exigir una sesión válida.
- Sustituir los datos visuales estáticos de `app/lib/data.ts` por datos del perfil autenticado.
- Cambios de esquema, migraciones, triggers o políticas RLS.
- Cuenta de prueba, contraseña o credenciales almacenadas en el repositorio.
- Maquetación mobile dedicada.

## Data model

Esta feature no introduce nuevas estructuras de datos. Reutiliza la sesión administrada por Supabase Auth y los clientes existentes:

```ts
// utils/supabase/client.ts
const supabase = createClient();

await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signOut();
```

```ts
// utils/supabase/middleware.ts
const { data } = await supabase.auth.getClaims();
const claims = data?.claims;
```

El formulario de login mantiene únicamente estado efímero de cliente:

```ts
type LoginState = {
  email: string;
  password: string;
  isSubmitting: boolean;
  error: string | null;
};
```

El email inicia vacío para no presentar los datos del mockup como credenciales reales. La ruta de activación conserva sus datos visuales actuales y no crea usuarios.

## Implementation plan

1. Crear el componente cliente del formulario de login, reutilizando los estilos actuales de `app/login/page.tsx`. Verificar: `/login` conserva el diseño y permite editar email y contraseña.
2. Implementar `signInWithPassword` con validación mínima de campos vacíos, estado de carga y mensajes inline en español. Verificar: campos vacíos y credenciales inválidas no navegan y muestran el error correspondiente.
3. Conectar el formulario válido a la navegación hacia `/` después de crear la sesión. Verificar: una cuenta existente de Supabase llega al feed y conserva la sesión al recargar.
4. Actualizar `utils/supabase/middleware.ts` para obtener/refrescar la sesión y aplicar reglas para rutas privadas y públicas. Verificar: una petición sin sesión a `/`, `/kids` o `/kids/[id]` redirige a `/login`, y una sesión válida puede acceder.
5. Mantener `proxy.ts` como punto único de entrada de Next.js y conservar el matcher para refresco de cookies en las rutas de la aplicación. Verificar: los assets estáticos no pasan por la lógica de autenticación.
6. Crear un componente cliente de logout y reemplazar el enlace visual del sidebar por el botón real, conservando sus dimensiones y estilos. Verificar: al hacer clic se invalida la sesión y se navega a `/login`.
7. Agregar la redirección de usuarios autenticados desde `/login` y `/activate-account` hacia `/`, evitando bucles de navegación. Verificar: ambas rutas públicas siguen siendo accesibles sin sesión.
8. Revisar con la documentación actual de Supabase SSR y Next.js Proxy, y ejecutar la verificación final: `npx tsc --noEmit`, `npx eslint app/` y flujo E2E con una cuenta existente de Supabase.

## Acceptance criteria

- [x] `/login` muestra el email vacío y la contraseña vacía con su placeholder visual.
- [x] El formulario de login contiene únicamente email y contraseña como credenciales.
- [x] Enviar el formulario con campos vacíos muestra errores inline en español y no realiza una petición de autenticación.
- [x] Mientras `signInWithPassword` está pendiente, el botón se deshabilita y comunica visualmente el estado de carga.
- [x] Credenciales inválidas mantienen al usuario en `/login` y muestran un error inline sin exponer detalles sensibles.
- [x] Credenciales válidas de una cuenta existente crean una sesión de Supabase y redirigen a `/`.
- [x] La sesión permanece disponible después de recargar `/`.
- [x] Una persona sin sesión que visita `/` es redirigida a `/login`.
- [x] Una persona sin sesión que visita `/kids` es redirigida a `/login`.
- [x] Una persona sin sesión que visita `/kids/[id]` es redirigida a `/login`.
- [x] Una persona autenticada puede acceder a `/`, `/kids` y `/kids/[id]`.
- [x] Una persona sin sesión puede acceder a `/login` y `/activate-account`.
- [x] Una persona autenticada que visita `/login` es redirigida a `/`.
- [x] Una persona autenticada que visita `/activate-account` es redirigida a `/`.
- [x] El logout ejecuta `supabase.auth.signOut`, elimina la sesión y redirige a `/login`.
- [x] Después del logout, volver a visitar una ruta privada vuelve a redirigir a `/login`.
- [x] `/activate-account` no crea usuarios ni ejecuta `signUp`.
- [x] No se agregan credenciales, tokens de servicio ni contraseñas al repositorio.
- [x] `npx tsc --noEmit` termina sin errores.
- [x] `npx eslint app/` termina sin errores.
- [x] La comparación visual confirma que login, activación y sidebar conservan el diseño existente, salvo los estados definidos en esta spec.

## Decisions

- **Yes:** usar `signInWithPassword` de Supabase para el login. **No:** simular credenciales en el cliente o usar una API propia.
- **Yes:** usar los clientes existentes de `utils/supabase/client.ts`, `utils/supabase/server.ts` y `utils/supabase/middleware.ts`. **No:** crear conexiones HTTP o clientes Supabase alternativos.
- **Yes:** mantener `/activate-account` pública y estática por ahora. **No:** convertirla en `signUp` ni validar invitaciones en esta spec.
- **Yes:** dejar el email vacío. **No:** conservar `caro@opendaycare.com` como valor por defecto, porque pertenece al mockup y podría confundirse con una cuenta real.
- **Yes:** mostrar errores inline y estado de carga. **No:** usar alertas del navegador ni exponer mensajes técnicos de Supabase directamente.
- **Yes:** proteger `/`, `/kids` y `/kids/[id]` desde el Proxy. **No:** confiar únicamente en ocultar enlaces o en validaciones del cliente.
- **Yes:** redirigir usuarios autenticados desde las pantallas públicas a `/`. **No:** permitir que vuelvan a ver formularios de acceso innecesariamente.
- **Yes:** cerrar sesión con `supabase.auth.signOut`. **No:** limitar el logout a cambiar el `href` hacia `/login`.
- **Yes:** exigir únicamente una sesión válida. **No:** añadir autorización por rol en esta feature.
- **Yes:** probar con un usuario existente de Supabase. **No:** crear una cuenta de prueba ni almacenar credenciales en el código.
- **Yes:** no modificar la base de datos. **No:** cambiar el trigger que exige `role` y `full_name`, porque el registro queda fuera del alcance.

## Risks

| Riesgo                                                                        | Mitigación                                                                                                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| El token se refresca pero las cookies actualizadas no llegan al navegador     | Ejecutar `getClaims()` temprano en el Proxy y conservar el patrón `setAll` de `@supabase/ssr`.               |
| El redirect de rutas públicas y privadas genera un bucle                      | Evaluar explícitamente el pathname y separar rutas públicas de privadas antes de redirigir.                  |
| Los mensajes de Supabase cambian según idioma o proveedor                     | Mapear errores conocidos a mensajes de usuario en español y usar un mensaje genérico para el resto.          |
| El sidebar es Server Component y el logout necesita interacción del navegador | Extraer únicamente el botón de logout a un Client Component, sin convertir todo el sidebar en cliente.       |
| Una cuenta válida no tiene perfil correspondiente en `public.user`            | Mantener esta spec limitada a Auth; el perfil y la autorización por rol se resolverán en una spec posterior. |
| El proyecto remoto tiene avisos de seguridad preexistentes                    | No mezclar su corrección con esta feature; documentarlos y tratarlos en una spec de hardening separada.      |

## What is **not** in this spec

- Registro de usuarios.
- Activación real de cuenta e invitaciones.
- Confirmación de correo.
- Recuperación o cambio de contraseña.
- Autorización por roles.
- Lectura del perfil autenticado desde `public.user`.
- Migraciones o cambios de base de datos.
- Creación de usuarios o credenciales de prueba.
- Maquetación mobile dedicada.

Cada uno de esos temas, si aterriza, va en su propio spec.
