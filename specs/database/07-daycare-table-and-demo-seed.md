# SPEC 07 — Tabla `daycare` y seed de guarderías demo

> **Status:** Implemented
> **Depends on:** Ninguna
> **Date:** 2026-11-02
> **Objective:** Crear la tabla `daycare` con propiedad explícita, RLS de mínimo privilegio y un seed separado para cinco guarderías demo con usuarios propietarios configurables.

## Scope

**In:**

- Crear `public.daycare` mediante una migración versionada.
- Incluir únicamente `id`, `owner_id`, `name`, `created_at` y `updated_at`.
- Referenciar `owner_id` a `auth.users(id)` con `ON DELETE NO ACTION`.
- Habilitar RLS desde la creación de la tabla.
- Crear políticas explícitas para SELECT, INSERT, UPDATE y DELETE.
- Conceder a `authenticated` únicamente los privilegios SQL necesarios para esas cuatro operaciones.
- Denegar el acceso a `anon` y al resto de roles mediante privilegios SQL y políticas RLS.
- Crear el índice necesario para evaluar las políticas por `owner_id`.
- Actualizar `updated_at` automáticamente mediante un trigger en cada UPDATE.
- Crear pruebas SQL reproducibles de accesos permitidos y denegados.
- Crear un seed separado que use Supabase Admin API para crear cinco usuarios demo y después inserte cinco guarderías asociadas a sus UUID.
- Permitir configurar los emails y las credenciales del seed mediante variables de entorno, sin guardar secretos en el repositorio.
- Preparar estas cinco guarderías demo:
  - `Guardería Sala Soles`.
  - `Guardería Luna`.
  - `Guardería Arcoíris`.
  - `Guardería Semillitas`.
  - `Guardería Estrellitas`.
- Documentar como mejoras futuras los campos que podrían requerirse, sin agregarlos a la tabla.

**Out of scope (para specs futuros):**

- Crear las tablas `user`, `room`, `child` o cualquier otra tabla del esquema.
- Agregar relaciones de staff, padres, salas o niños.
- Crear un flujo de onboarding o una interfaz para administrar guarderías.
- Ejecutar automáticamente el seed al aplicar migraciones.
- Guardar contraseñas, tokens o claves administrativas en archivos versionados.
- Agregar campos especulativos como dirección, teléfono, zona horaria, logo, estado o configuración operativa.
- Aplicar la migración o el seed a una base de datos remota durante la implementación de esta spec.

## Data model

```sql
create table public.daycare (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete no action,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index daycare_owner_id_idx on public.daycare (owner_id);
```

El seed administra estas identidades y relaciones fuera de la migración estructural:

```ts
type DemoDaycare = {
  name:
    | "Guardería Sala Soles"
    | "Guardería Luna"
    | "Guardería Arcoíris"
    | "Guardería Semillitas"
    | "Guardería Estrellitas";
  ownerId: string;
};
```

Los emails de los cinco propietarios demo son configurables al ejecutar el seed. Las contraseñas se reciben exclusivamente mediante variables de entorno o el mecanismo seguro equivalente de ejecución.

## Implementation plan

1. Crear la estructura inicial `supabase/migrations/` y definir una migración versionada para `public.daycare`, con sus restricciones `NOT NULL`, defaults, clave foránea e índice sobre `owner_id`. Verificar que la migración sea idempotente solo dentro del flujo normal de migraciones y que no incluya datos demo.
2. Agregar a la migración la función y el trigger que establecen `updated_at = now()` antes de cada UPDATE. Verificar que un UPDATE no pueda dejar un timestamp obsoleto.
3. Agregar a la migración RLS, los privilegios SQL mínimos y las políticas explícitas: SELECT y DELETE solo para el propietario actual; INSERT solo cuando `owner_id` coincide con `auth.uid()`; UPDATE con la misma condición en `USING` y `WITH CHECK`. Verificar que ningún usuario anónimo tenga acceso.
4. Crear `supabase/tests/daycare-rls.sql` con fixtures documentados para tres identidades: propietario, usuario autenticado ajeno y usuario no autenticado. Cubrir SELECT, INSERT, UPDATE y DELETE permitidos y denegados, además del intento de reasignar `owner_id` durante UPDATE.
5. Crear un seed separado para Supabase Admin API que reciba cinco emails y credenciales configurables, cree o reutilice de forma segura los usuarios demo, obtenga sus UUID y realice un upsert controlado de las cinco guarderías. El seed debe ser explícito, repetible y no ejecutarse como parte de la migración.
6. Documentar en la propia spec y junto al seed que los registros demo requieren una ejecución administrativa consciente y que no deben usarse credenciales reales en desarrollo compartido.
7. Verificar la migración y las pruebas en el entorno local disponible, ejecutar los chequeos SQL de seguridad y confirmar que el seed crea exactamente cinco guarderías con propietarios distintos.

## Acceptance criteria

- [x] Existe una migración versionada en `supabase/migrations/` que crea `public.daycare`.
- [x] La tabla contiene únicamente `id`, `owner_id`, `name`, `created_at` y `updated_at`.
- [x] `id` es UUID, clave primaria y tiene default `gen_random_uuid()`.
- [x] `owner_id` es obligatorio y referencia `auth.users(id)` con `ON DELETE NO ACTION`.
- [x] `name` es obligatorio y de tipo `text`.
- [x] `created_at` y `updated_at` son obligatorios, de tipo `timestamptz` y tienen default `now()`.
- [x] Existe un trigger que actualiza automáticamente `updated_at` en cada UPDATE.
- [x] RLS está habilitado en `public.daycare` desde la migración.
- [x] `authenticated` tiene únicamente SELECT, INSERT, UPDATE y DELETE sobre `public.daycare`.
- [x] `anon` y `PUBLIC` no tienen privilegios de tabla que permitan acceder a `public.daycare`.
- [x] Un usuario autenticado puede consultar únicamente filas cuyo `owner_id` coincide con `auth.uid()`.
- [x] Un usuario autenticado puede insertar únicamente filas con `owner_id = auth.uid()`.
- [x] Un usuario autenticado puede actualizar únicamente sus filas y no puede transferirlas a otro propietario.
- [x] Un usuario autenticado puede eliminar únicamente sus filas.
- [x] Un usuario autenticado que no es propietario no puede leer, insertar para otro propietario, actualizar ni eliminar filas ajenas.
- [x] Un usuario no autenticado no puede leer, insertar, actualizar ni eliminar filas.
- [x] Existe un índice sobre `owner_id` para optimizar las políticas de propiedad.
- [x] `supabase/tests/daycare-rls.sql` verifica casos permitidos y denegados para las cuatro operaciones.
- [x] Las pruebas verifican explícitamente que UPDATE requiere una política SELECT funcional y que no permite cambiar `owner_id`.
- [x] Existe un seed separado de la migración que crea cinco usuarios demo mediante Supabase Admin API.
- [x] Los emails y credenciales del seed provienen de configuración externa y no están versionados.
- [x] El seed crea exactamente estas cinco guarderías: `Guardería Sala Soles`, `Guardería Luna`, `Guardería Arcoíris`, `Guardería Semillitas` y `Guardería Estrellitas`.
- [x] Cada guardería demo queda asociada al UUID del usuario demo correspondiente.
- [x] El seed no se ejecuta automáticamente al aplicar migraciones.
- [x] No se agregan columnas futuras a `public.daycare`.
- [x] La spec documenta como mejoras futuras posibles campos de contacto, ubicación, zona horaria, identidad visual y configuración operativa, sin implementarlos.
- [x] No se aplican cambios a una base de datos remota como parte de esta implementación.

## Decisions

- **Sí:** `owner_id` explícito referenciado a `auth.users`. **No:** inferir propiedad desde claims editables o desde una futura tabla `public.user`; la tabla necesita un modelo de propiedad verificable desde su creación.
- **Sí:** `owner_id` es `NOT NULL`. **No:** guarderías sin propietario, porque impedirían una política de mínimo privilegio.
- **Sí:** `ON DELETE NO ACTION`. **No:** `CASCADE`, para evitar que borrar una identidad elimine datos de dominio accidentalmente.
- **Sí:** CRUD completo para el propietario autenticado. **No:** acceso de lectura global ni operaciones para usuarios autenticados ajenos.
- **Sí:** políticas separadas y explícitas para SELECT, INSERT, UPDATE y DELETE. **No:** depender únicamente de `TO authenticated`, porque eso no expresa propiedad.
- **Sí:** `USING` y `WITH CHECK` en UPDATE. **No:** permitir que el propietario reasigne la fila a otro usuario.
- **Sí:** privilegios SQL y RLS simultáneos. **No:** tratar RLS como sustituto de los privilegios de tabla.
- **Sí:** seed separado. **No:** insertar datos demo dentro de la migración, porque los usuarios de `auth.users` no deben crearse mediante DDL de la tabla.
- **Sí:** cinco propietarios demo con emails configurables. **No:** credenciales fijas en el repositorio.
- **Sí:** incluir `Guardería Sala Soles`, el nombre de referencia del esquema. **No:** limitar el seed a un solo registro, porque se solicitó preparar cinco guarderías.
- **Sí:** trigger para `updated_at`. **No:** confiar en que cada cliente envíe correctamente el timestamp.
- **Sí:** índice sobre `owner_id`. **No:** agregar índices para campos que todavía no participan en políticas o consultas definidas.

## Risks

| Riesgo                                                                        | Mitigación                                                                                                                                                        |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Un UPDATE puede reasignar la propiedad si falta `WITH CHECK`.                 | Exigir `USING` y `WITH CHECK` con `auth.uid()` en la política de UPDATE y probarlo explícitamente.                                                                |
| El seed administrativo puede exponer una clave privilegiada.                  | Leerla solo desde variables de entorno, no imprimirla ni versionarla, y ejecutar el seed únicamente de forma consciente.                                          |
| El seed puede duplicar usuarios o guarderías al repetirse.                    | Usar una estrategia explícita de reutilización de usuarios y un upsert controlado por propietario/nombre, validando que el resultado final tenga cinco registros. |
| `auth.users` no puede poblarse de forma segura con INSERT SQL ordinario.      | Crear las identidades mediante Supabase Admin API y usar la migración únicamente para la estructura de dominio.                                                   |
| Eliminar un propietario puede bloquear una operación administrativa legítima. | Mantener `NO ACTION` para proteger los datos y definir la transferencia o archivado en una spec futura.                                                           |

## What is **not** in this spec

- Tablas relacionadas con usuarios de dominio, salas, niños, publicaciones o invitaciones.
- Interfaz o API de administración de guarderías.
- Creación automática de usuarios demo durante una migración.
- Credenciales o tokens almacenados en el repositorio.
- Aplicación de la migración a una base de datos remota.
- Campos de contacto, ubicación, zona horaria, logo, estado o configuración operativa.
- Transferencia de propiedad o borrado lógico de guarderías.

Cada uno de esos temas, si se requiere, debe definirse en una spec propia.
