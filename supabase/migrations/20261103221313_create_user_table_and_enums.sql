create type public.user_role as enum ('staff', 'parent', 'admin');

create type public.user_status as enum ('pending', 'active');

create table public."user" (
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

create index user_daycare_id_idx on public."user" (daycare_id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  user_role_text text;
  user_full_name text;
  user_daycare_id uuid;
begin
  user_role_text := nullif(btrim(new.raw_user_meta_data ->> 'role'), '');
  user_full_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');

  if user_role_text is null then
    raise exception 'raw_user_meta_data.role is required to create a user profile';
  end if;

  if user_full_name is null then
    raise exception 'raw_user_meta_data.full_name is required to create a user profile';
  end if;

  user_daycare_id := nullif(new.raw_user_meta_data ->> 'daycare_id', '')::uuid;

  insert into public."user" (
    id,
    daycare_id,
    role,
    full_name
  )
  values (
    new.id,
    user_daycare_id,
    user_role_text::public.user_role,
    user_full_name
  );

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create function public.update_user_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_set_updated_at
before update on public."user"
for each row
execute function public.update_user_updated_at();

alter table public."user" enable row level security;

revoke all on table public."user" from public;
revoke all on table public."user" from anon;
grant select on table public."user" to authenticated;
grant update (full_name, avatar_url, notify_on_post, daily_summary_enabled)
on table public."user" to authenticated;

revoke all on function public.update_user_updated_at() from public;

create policy user_select_own
on public."user"
for select
to authenticated
using ((select auth.uid()) = id);

create policy user_update_own
on public."user"
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
