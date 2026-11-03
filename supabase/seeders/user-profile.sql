do $$
declare
  demo_user_id constant uuid := 'f87f1ab4-9a10-496a-b917-4ece602aeb33';
  demo_daycare_id uuid;
  daycare_matches integer;
begin
  if not exists (
    select 1
    from auth.users
    where id = demo_user_id
  ) then
    raise exception
      'Cannot seed public.user: Auth user % does not exist',
      demo_user_id;
  end if;

  select count(*)::integer
  into daycare_matches
  from public.daycare
  where name = 'Guardería Sala Soles';

  if daycare_matches = 0 then
    raise exception
      'Cannot seed public.user: daycare % does not exist',
      'Guardería Sala Soles';
  end if;

  if daycare_matches > 1 then
    raise exception
      'Cannot seed public.user: daycare name % is not unique',
      'Guardería Sala Soles';
  end if;

  select id
  into demo_daycare_id
  from public.daycare
  where name = 'Guardería Sala Soles';

  insert into public."user" (
    id,
    daycare_id,
    role,
    status,
    full_name
  )
  values (
    demo_user_id,
    demo_daycare_id,
    'staff',
    'active',
    'Staff de prueba'
  )
  on conflict (id) do update
  set daycare_id = excluded.daycare_id,
      role = excluded.role,
      status = excluded.status,
      full_name = excluded.full_name;
end;
$$;
