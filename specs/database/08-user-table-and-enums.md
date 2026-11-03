# SPEC 08 — Tabla `user` y enumeraciones de usuarios

> **Status:** Implemented
> **Depends on:** SPEC 07
> **Date:** 2026-11-03
> **Objective:** Crear los enums y la tabla `public.user` vinculada a Supabase Auth y a `daycare`, con sincronización automática y un perfil staff de prueba existente.

## Scope

**In:**

- Crear los enums `public.user_role` (`staff`, `parent`, `admin`) y `public.user_status` (`pending`, `active`) mediante una migración versionada.
- Crear `public.user` con el mismo UUID de `auth.users`, un `daycare_id` nullable y los campos definidos en el esquema de referencia.
- Mantener la relación muchos usuarios hacia un daycare mediante `user.daycare_id -> daycare.id`.
- Crear un trigger `AFTER INSERT` sobre `auth.users` que genere el perfil desde `raw_user_meta_data`.
- Habilitar RLS y permitir a cada usuario autenticado únicamente consultar y actualizar su propia fila.
- Crear un seed SQL separado para el usuario Auth existente `f87f1ab4-9a10-496a-b917-4ece602aeb33`, asociado al daycare `Guardería Sala Soles`, con rol `staff`, estado `active` y nombre `Staff de prueba`.
- Crear pruebas SQL reproducibles para la estructura, enums, trigger, seed y aislamiento RLS, ejecutadas contra la base remota mediante MCP de Supabase.

**Out of scope (para specs futuros):**

- Crear usuarios nuevos en `auth.users` o gestionar contraseñas, emails y confirmación de cuentas.
- Modificar el modelo existente de propiedad `daycare.owner_id` o sus políticas RLS.
- Crear las tablas `room`, `child`, `parent_child`, `invitation` o cualquier otra tabla del esquema.
- Implementar administración de usuarios, cambio de roles, invitaciones u onboarding.
- Permitir que un usuario consulte o administre perfiles de otros usuarios del mismo daycare.
- Ejecutar la migración, el seed y las pruebas contra una base de datos local.

## Data model

```sql
create type public.user_role as enum ('staff', 'parent', 'admin');
create type public.user_status as enum ('pending', 'active');

create table public.user (
  id uuid primary key references auth.users (id) on delete cascade,
  daycare_id uuid references public.daycare (id) on delete set null,
  role public.user_role not null,
  status public.user_status not null default 'active',
  full_name text not null,
  avatar_url text,
  notify_on_post boolean not null default true,
  daily_summary_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_daycare_id_idx on public.user (daycare_id);
```

El trigger de `auth.users` leerá `daycare_id`, `role` y `full_name` desde `raw_user_meta_data`. `daycare_id` puede faltar o ser `null`; `role` y `full_name` deben estar presentes para crear el perfil. El perfil del usuario Auth existente se insertará desde el seed SQL, no desde la migración estructural.

## Implementation plan

1. Crear una migración versionada que defina `user_role`, `user_status` y `public.user`, incluyendo la FK a `auth.users` con `ON DELETE CASCADE`, la FK nullable a `daycare` con `ON DELETE SET NULL`, defaults, restricciones e índice de `daycare_id`.
2. Agregar a la migración la función `SECURITY DEFINER` y el trigger `AFTER INSERT` sobre `auth.users`. Configurar un `search_path` seguro y evitar que el trigger exponga privilegios adicionales a `PUBLIC`.
3. Agregar el trigger de `updated_at`, RLS, privilegios explícitos para `authenticated` y políticas separadas: SELECT y UPDATE únicamente cuando `id = auth.uid()`. No conceder INSERT ni DELETE a `authenticated`; la creación inicial ocurre por trigger.
4. Crear `supabase/seed.sql` para insertar de forma reproducible el perfil del UUID Auth existente, buscando la guardería por el nombre exacto `Guardería Sala Soles` y usando `ON CONFLICT (id) DO UPDATE` sin cambiar el UUID ni crear identidades Auth.
5. Crear `supabase/tests/user-rls.sql` con verificaciones de enums, columnas, defaults, perfil staff, trigger de alta Auth y permisos para el usuario propio, un usuario autenticado ajeno y una sesión anónima.
6. Aplicar la migración estructural a la base remota mediante el MCP de Supabase usando `apply_migration`, después de verificar que sus dependencias remotas existen y que la migración aún no está registrada.
7. Ejecutar el seed remoto mediante el MCP de Supabase usando una operación SQL controlada y ejecutar mediante MCP las consultas de verificación, confirmando que el perfil staff queda asociado a `Guardería Sala Soles`, que un daycare puede tener múltiples perfiles y que ningún usuario puede leer o actualizar la fila de otro.

## Acceptance criteria

- [x] Existe una migración versionada que crea `public.user_role` con exactamente `staff`, `parent` y `admin`.
- [x] Existe una migración versionada que crea `public.user_status` con exactamente `pending` y `active`.
- [x] `public.user` contiene `id`, `daycare_id`, `role`, `status`, `full_name`, `avatar_url`, `notify_on_post`, `daily_summary_enabled`, `created_at` y `updated_at`.
- [x] `public.user.id` es UUID, clave primaria y FK a `auth.users(id)` con `ON DELETE CASCADE`.
- [x] `daycare_id` es nullable y FK a `public.daycare(id)` con `ON DELETE SET NULL`.
- [x] `role` y `full_name` son obligatorios.
- [x] `status` tiene default `active`.
- [x] `notify_on_post` y `daily_summary_enabled` son obligatorios y tienen default `true`.
- [x] `created_at` y `updated_at` son `timestamptz` obligatorios con default `now()`.
- [x] Existe un índice sobre `public.user(daycare_id)`.
- [x] Un INSERT en `auth.users` con metadata válida crea automáticamente su fila correspondiente en `public.user`.
- [x] El trigger permite metadata sin `daycare_id`, pero rechaza la creación de un perfil sin `role` o `full_name`.
- [x] `updated_at` se actualiza automáticamente cuando cambia el perfil.
- [x] RLS está habilitado en `public.user`.
- [x] `authenticated` solo tiene privilegios SELECT y UPDATE sobre `public.user`; no tiene INSERT ni DELETE.
- [x] Un usuario autenticado puede leer únicamente la fila cuyo `id` coincide con `auth.uid()`.
- [x] Un usuario autenticado puede actualizar únicamente su propia fila y no puede cambiar su `id` ni actualizar la fila de otro usuario.
- [x] Un usuario anónimo no puede leer ni modificar `public.user`.
- [x] El seed SQL inserta o actualiza el perfil `f87f1ab4-9a10-496a-b917-4ece602aeb33` con `role = staff`, `status = active`, `full_name = 'Staff de prueba'` y el daycare `Guardería Sala Soles`.
- [x] El seed no crea usuarios Auth, no contiene contraseñas ni credenciales y puede ejecutarse más de una vez sin duplicar el perfil.
- [x] Las pruebas SQL verifican que varios usuarios pueden referenciar el mismo daycare.
- [x] No se modifica `daycare.owner_id` ni se agregan enums no utilizados por `public.user`.
- [x] La migración, el seed y las verificaciones se ejecutan contra la base remota mediante MCP de Supabase.
- [x] No se requiere que Docker ni el stack local de Supabase estén ejecutándose para completar esta spec.

## Decisions

- **Sí:** `daycare_id` nullable. **No:** exigir una guardería para todo perfil, porque se confirmó que puede existir un usuario aún no asignado.
- **Sí:** `role` y `full_name` obligatorios. **No:** perfiles incompletos que no puedan autorizarse o identificarse.
- **Sí:** `ON DELETE CASCADE` hacia `auth.users`. **No:** conservar perfiles huérfanos después de eliminar su identidad de autenticación.
- **Sí:** `ON DELETE SET NULL` hacia `daycare`. **No:** bloquear la eliminación del daycare por perfiles asociados; la reasignación o archivado se definirá después.
- **Sí:** trigger `SECURITY DEFINER` para crear perfiles. **No:** conceder INSERT directo a usuarios autenticados.
- **Sí:** SELECT y UPDATE propios. **No:** CRUD completo ni lectura de compañeros del daycare, para mantener mínimo privilegio.
- **Sí:** seed SQL del usuario Auth existente. **No:** crear una identidad nueva mediante Admin API, porque el usuario ya existe.
- **Sí:** reutilizar `Guardería Sala Soles`. **No:** crear otro daycare de prueba, porque la relación con el daycare existente debe demostrarse.
- **Sí:** guardar enums y nombres persistidos en inglés. **No:** guardar etiquetas traducidas de UI en PostgreSQL.
- **Sí:** ejecutar la migración estructural con `apply_migration` del MCP de Supabase y las verificaciones/seed con SQL MCP. **No:** aplicar cambios permanentes mediante el stack local.

## Risks

| Riesgo                                                              | Mitigación                                                                                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Un trigger inseguro puede permitir escalación de privilegios.       | Usar `SECURITY DEFINER`, `search_path` fijo, revocar ejecución pública y probar inserciones con distintos roles.                                 |
| El UUID Auth de prueba puede no existir en una base remota limpia.  | El seed debe fallar con un mensaje explícito y no crear una identidad sustituta.                                                                 |
| Un usuario puede intentar modificar su rol o `daycare_id`.          | Probar UPDATE propio y definir en la implementación una política que limite los campos mutables a perfil y preferencias.                         |
| `public.user` puede confundirse con `auth.users`.                   | Mantener la FK al mismo UUID, no duplicar email/password y documentar la separación de responsabilidades.                                        |
| Una migración remota aplicada no se puede deshacer automáticamente. | Verificar previamente dependencias, versión de migración, objetos existentes y resultado de cada operación; no ejecutar DDL remoto fuera de MCP. |

## What is **not** in this spec

- Creación o administración de identidades en Supabase Auth.
- Administración de perfiles ajenos o de todos los usuarios de un daycare.
- Modificación de la propiedad `daycare.owner_id`.
- Tablas de niños, padres, salas, publicaciones o invitaciones.
- Cambio de roles, invitaciones, onboarding o recuperación de contraseña.
- Ejecución contra una base de datos local o dependencia de Docker para completar la implementación.

Cada uno de esos temas, si se requiere, debe definirse en una spec propia.
