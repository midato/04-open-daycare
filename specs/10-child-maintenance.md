# SPEC 10 — Mantenimiento de niños persistente en `/kids`

> **Status:** Approved
> **Depends on:** SPEC 04, SPEC 07, SPEC 08
> **Date:** 2026-11-05
> **Objective:** Conectar `/kids` con Supabase para administrar el alta de niños por daycare, crear sus 10 salas iniciales y mantener la tabla `child` vacía hasta que se registre el primer niño.

## Scope

**In:**

- Crear las tablas `public.room` y `public.child` mediante una migración versionada, siguiendo `opendaycare-database-schema.md`.
- Crear el enum `public.child_status` con los valores `active` y `archived`.
- Cargar idempotentemente las 10 salas actuales de `AddKidDialog` para cada daycare existente: `Soles`, `Lunas`, `Estrellas`, `Nubes`, `Arcoíris`, `Mariposas`, `Peces`, `Dinosaurios`, `Globos` y `Ballenas`.
- Mantener `public.child` sin registros iniciales; el seed no insertará niños.
- Reemplazar en `/kids` el array estático `kids` por datos consultados desde Supabase para el daycare del usuario autenticado.
- Mostrar un estado vacío cuando el daycare no tenga niños y conservar activo el botón «Agregar niño».
- Conservar los cinco campos y las validaciones actuales de `AddKidDialog`: nombre completo, fecha de nacimiento, sala, alergias y notas médicas.
- Persistir un nuevo niño mediante una Server Action autenticada.
- Permitir consultar salas y niños, y agregar niños, únicamente a usuarios `staff` y `admin` del mismo daycare.
- Guardar los nombres persistidos y las etiquetas de alergias en inglés cuando aplique; traducir únicamente en la UI.

**Out of scope (para specs futuros):**

- Editar niños.
- Archivar o eliminar niños.
- Búsqueda funcional y filtro por sala.
- Vinculación de padres, invitaciones, publicaciones o resumen diario.
- Migrar `/kids/[id]` a datos persistidos.
- Crear o administrar daycares, usuarios Auth o perfiles de otros usuarios.
- Insertar niños demo o conservar los ocho niños estáticos del SPEC 02 en la base de datos.
- Cambiar la lista de salas desde la interfaz.
- Aplicar cambios a una base de datos remota como parte de esta spec sin verificación explícita de la migración y el seed.

## Data model

La migración debe crear estas estructuras:

```sql
create type public.child_status as enum ('active', 'archived');

create table public.room (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycare (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint room_daycare_name_key unique (daycare_id, name)
);

create table public.child (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.room (id) on delete restrict,
  full_name text not null,
  birth_date date not null,
  enrolled_at date not null default current_date,
  medical_notes text,
  allergy_tags text[] not null default '{}',
  photo_consent boolean not null default true,
  status public.child_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Reglas de acceso:

- `room` y `child` tendrán RLS habilitado.
- La pertenencia se resolverá mediante `public.user.daycare_id = public.room.daycare_id` y `auth.uid()`.
- Solo perfiles `staff` y `admin` podrán leer salas y niños.
- Solo perfiles `staff` y `admin` podrán insertar en `child`.
- La inserción debe comprobar que `room_id` pertenece al daycare del usuario autenticado.
- `authenticated` no recibirá UPDATE ni DELETE sobre `child` en esta spec.
- `anon` y `public` no tendrán privilegios sobre estas tablas.

El formulario actual se transforma al registro persistido de esta manera:

```ts
type AddChildInput = {
  fullName: string;
  birthDate: string; // dd/mm/aaaa en la UI, date en PostgreSQL
  roomId: string;
  allergyTags: string[]; // valores normalizados en inglés
  medicalNotes: string | null;
};
```

Las etiquetas visuales y los campos derivados de la vista —edad, inicial, colores y formato de fechas— se calculan en la capa de aplicación. `child` no almacenará datos duplicados de presentación.

## Implementation plan

1. Crear la migración versionada de `child_status`, `room` y `child`, incluyendo claves foráneas, restricciones, unicidad `(daycare_id, name)`, índices para `daycare_id` y `room_id`, y el trigger de `updated_at` para `child`. Verificar que la migración no inserte niños.
2. Agregar a la migración los privilegios SQL mínimos y las políticas RLS para lectura por daycare y alta exclusiva de `staff`/`admin`. Verificar los casos de usuario ajeno, `parent` y sesión anónima.
3. Crear `supabase/seeders/rooms.sql` con una inserción idempotente que cruce los daycares existentes con las 10 salas confirmadas. Verificar que una segunda ejecución no duplique registros y que no cree filas en `child`.
4. Crear las consultas de servidor para obtener el daycare autenticado, las salas y los niños activos usando `utils/supabase/server.ts`. Verificar que no se usen clientes HTTP alternativos ni datos estáticos para `/kids`.
5. Actualizar `app/kids/page.tsx` para consultar los niños del daycare y mostrar el estado vacío con contador `0`, copy en español mexicano y el botón «Agregar niño». Verificar que un daycare sin niños renderice sin errores.
6. Actualizar `app/components/AddKidDialog.tsx` para cargar las salas persistidas y enviar el `room_id`, manteniendo los cinco campos, el formato de fecha y las validaciones existentes.
7. Reemplazar `app/kids/actions.ts` por una Server Action que valide de nuevo los datos, resuelva el usuario autenticado, compruebe el rol `staff`/`admin`, valide la pertenencia de la sala e inserte el registro en `child`. Verificar que un envío manipulado no pueda insertar en otro daycare.
8. Adaptar el mapeo de datos de `/kids` a `KidCard` sin reintroducir los ocho niños fake del SPEC 02. Verificar que después de guardar aparezca una tarjeta nueva y que el contador se actualice mediante `router.refresh()`.
9. Crear `supabase/tests/room-child-rls.sql` con pruebas reproducibles de estructura, seed, aislamiento por daycare, permisos de staff/admin, rechazo de parent/anónimo y rechazo de `room_id` ajeno.
10. Ejecutar `npx tsc --noEmit`, `npx eslint app/` y la verificación visual de `/kids` con cero niños y con un niño recién agregado.

## Acceptance criteria

- [x] Existe una migración versionada que crea `public.room`, `public.child` y `public.child_status`.
- [x] `room` contiene `id`, `daycare_id`, `name` y `created_at`, con unicidad por daycare y nombre.
- [x] `child` contiene los campos definidos en el esquema de referencia y `status` inicia en `active`.
- [x] La migración no inserta registros en `child`.
- [x] El seed crea exactamente las 10 salas confirmadas por cada daycare existente.
- [x] El seed puede ejecutarse dos veces sin duplicar salas.
- [x] Después del seed, `child` permanece vacía.
- [x] RLS está habilitado en `room` y `child`.
- [x] Un usuario `staff` puede consultar las salas y niños de su daycare.
- [x] Un usuario `admin` puede consultar las salas y niños de su daycare.
- [x] Un usuario `parent` no puede consultar ni insertar niños.
- [x] Un usuario autenticado no puede consultar ni insertar datos de otro daycare.
- [x] Un usuario anónimo no puede consultar ni modificar estas tablas.
- [x] `/kids` consulta Supabase y no usa el array estático de ocho niños como fuente de datos.
- [x] `/kids` muestra un estado vacío con contador `0` cuando no existen niños.
- [x] El botón «Agregar niño» permanece disponible en el estado vacío.
- [x] El combo SALA muestra únicamente salas pertenecientes al daycare autenticado.
- [x] El formulario conserva sus cinco campos y las validaciones actuales de nombre, fecha y sala.
- [x] Un alta válida persiste un registro en `child` con `room_id`, `full_name`, `birth_date`, `enrolled_at` y `status = 'active'`.
- [x] Las alergias y notas opcionales se guardan correctamente sin impedir el alta cuando están vacías.
- [x] Tras guardar, la nueva tarjeta aparece en `/kids` y el contador refleja el total persistido.
- [x] `npx tsc --noEmit` termina sin errores.
- [x] `npx eslint app/` termina sin errores.
- [x] Las pruebas SQL cubren permisos permitidos y denegados.

## Decisions

- **Sí:** usar `public.room` en singular, como define el esquema de referencia. **No:** crear una tabla `rooms` distinta.
- **Sí:** crear las 10 salas mediante un seed idempotente. **No:** crearlas cada vez que se abre `/kids`.
- **Sí:** cargar las salas para cada daycare existente. **No:** asociarlas a un daycare fijo en la interfaz.
- **Sí:** resolver el daycare desde el perfil `public.user` autenticado. **No:** aceptar `daycare_id` desde el navegador.
- **Sí:** limitar el mantenimiento a altas. **No:** incluir edición, archivado o eliminación en esta spec.
- **Sí:** dejar `child` vacía inicialmente. **No:** migrar los ocho niños estáticos del SPEC 02.
- **Sí:** conservar el formulario y las reglas del SPEC 04. **No:** rediseñar el diálogo ni agregar campos nuevos.
- **Sí:** usar `room_id` como relación persistida. **No:** guardar únicamente el nombre visible de la sala en `child`.
- **Sí:** filtrar por rol `staff`/`admin` mediante RLS y validación de Server Action. **No:** confiar solo en la protección de la interfaz.
- **Sí:** mantener los clientes oficiales existentes de Supabase. **No:** crear conexiones directas o clientes HTTP alternativos.

## Risks

| Riesgo                                                          | Mitigación                                                                                                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| El perfil autenticado no tiene `daycare_id`.                    | La consulta y la Server Action devolverán un error controlado y no permitirán operar sin daycare.                                          |
| Un `room_id` manipulado apunta a otra guardería.                | La política RLS y la validación de la Server Action comprobarán pertenencia al daycare autenticado.                                        |
| El seed se ejecuta varias veces.                                | Restricción única `(daycare_id, name)` y `ON CONFLICT DO NOTHING`.                                                                         |
| Las rutas existentes esperan el array estático `kids`.          | Esta spec limita el cambio funcional a `/kids`; `/kids/[id]` se revisará en una spec posterior.                                            |
| Las etiquetas de alergia llegan en español desde el formulario. | Normalizar los valores permitidos antes de insertarlos y mantener la traducción en UI.                                                     |
| El usuario autenticado no puede leer perfiles ajenos por RLS.   | Las políticas de `room` y `child` usarán una comprobación controlada de pertenencia al daycare, sin exponer la tabla completa de usuarios. |

## What is **not** in this spec

- Edición, archivado o eliminación de niños.
- Migración de `/kids/[id]` a Supabase.
- Búsqueda o filtro funcional.
- Padres, invitaciones y publicaciones.
- Niños demo.
- Administración de salas desde la UI.
- Creación de usuarios o daycares.
