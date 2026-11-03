create table public.daycare (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete no action,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daycare_owner_name_key unique (owner_id, name)
);

create index daycare_owner_id_idx on public.daycare (owner_id);

create function public.update_daycare_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger daycare_set_updated_at
before update on public.daycare
for each row
execute function public.update_daycare_updated_at();

alter table public.daycare enable row level security;

revoke all on table public.daycare from public;
revoke all on table public.daycare from anon;
grant select, insert, update, delete on table public.daycare to authenticated;

revoke all on function public.update_daycare_updated_at() from public;

create policy daycare_select_own
on public.daycare
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy daycare_insert_own
on public.daycare
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy daycare_update_own
on public.daycare
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy daycare_delete_own
on public.daycare
for delete
to authenticated
using ((select auth.uid()) = owner_id);
