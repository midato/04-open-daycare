grant update on table public."user" to authenticated;

create function public.prevent_user_privilege_changes()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if current_user = 'authenticated'
    and (
      new.id is distinct from old.id
      or new.daycare_id is distinct from old.daycare_id
      or new.role is distinct from old.role
      or new.status is distinct from old.status
      or new.created_at is distinct from old.created_at
    ) then
    raise exception 'authenticated users may only update profile fields'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_user_privilege_changes() from public;

create trigger user_prevent_privilege_changes
before update on public."user"
for each row
execute function public.prevent_user_privilege_changes();
