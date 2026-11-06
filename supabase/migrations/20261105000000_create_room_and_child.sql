create type public.child_status as enum ('active', 'archived');

create table public.room (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycare (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint room_daycare_name_key unique (daycare_id, name)
);

create index room_daycare_id_idx on public.room (daycare_id);

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

create index child_room_id_idx on public.child (room_id);

create function public.update_child_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger child_set_updated_at
before update on public.child
for each row
execute function public.update_child_updated_at();

revoke all on function public.update_child_updated_at() from public;

alter table public.room enable row level security;
alter table public.child enable row level security;

revoke all on table public.room from public, anon, authenticated;
revoke all on table public.child from public, anon, authenticated;

grant select on table public.room to authenticated;
grant select, insert on table public.child to authenticated;

create policy room_select_same_daycare_staff
on public.room
for select
to authenticated
using (
  exists (
    select 1
    from public."user" as profile
    where profile.id = (select auth.uid())
      and profile.daycare_id = room.daycare_id
      and profile.role in ('staff', 'admin')
  )
);

create policy child_select_same_daycare_staff
on public.child
for select
to authenticated
using (
  exists (
    select 1
    from public.room as room
    join public."user" as profile
      on profile.daycare_id = room.daycare_id
    where room.id = child.room_id
      and profile.id = (select auth.uid())
      and profile.role in ('staff', 'admin')
  )
);

create policy child_insert_same_daycare_staff
on public.child
for insert
to authenticated
with check (
  exists (
    select 1
    from public.room as room
    join public."user" as profile
      on profile.daycare_id = room.daycare_id
    where room.id = child.room_id
      and profile.id = (select auth.uid())
      and profile.role in ('staff', 'admin')
  )
);
