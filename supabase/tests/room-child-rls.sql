begin;

create extension if not exists pgtap with schema extensions;

select plan(27);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'room-child-owner@example.com',
    '{"role":"staff","full_name":"Room Child Owner"}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'room-child-other@example.com',
    '{"role":"staff","full_name":"Room Child Other"}'::jsonb
  );

insert into public.daycare (owner_id, name)
values
  ('11111111-1111-1111-1111-111111111111', 'Room Child Test Daycare'),
  ('44444444-4444-4444-4444-444444444444', 'Room Child Other Daycare');

update public."user" as profile
set daycare_id = daycare.id
from public.daycare as daycare
where profile.id = '11111111-1111-1111-1111-111111111111'
  and daycare.name = 'Room Child Test Daycare';

update public."user" as profile
set daycare_id = daycare.id
from public.daycare as daycare
where profile.id = '44444444-4444-4444-4444-444444444444'
  and daycare.name = 'Room Child Other Daycare';

insert into auth.users (id, email, raw_user_meta_data)
select
  user_id,
  email,
  jsonb_build_object(
    'role', role_name,
    'full_name', full_name,
    'daycare_id', daycare.id::text
  )
from (
  values
    (
      '22222222-2222-2222-2222-222222222222'::uuid,
      'room-child-parent@example.com',
      'parent',
      'Room Child Parent'
    ),
    (
      '33333333-3333-3333-3333-333333333333'::uuid,
      'room-child-admin@example.com',
      'admin',
      'Room Child Admin'
    )
) as users(user_id, email, role_name, full_name)
cross join lateral (
  select id
  from public.daycare
  where name = 'Room Child Test Daycare'
) as daycare;

insert into public.room (daycare_id, name)
select daycare.id, room_name.name
from public.daycare as daycare
cross join (
  values
    ('Soles'),
    ('Lunas'),
    ('Estrellas'),
    ('Nubes'),
    ('Arcoíris'),
    ('Mariposas'),
    ('Peces'),
    ('Dinosaurios'),
    ('Globos'),
    ('Ballenas')
) as room_name(name)
where daycare.name in ('Room Child Test Daycare', 'Room Child Other Daycare')
on conflict (daycare_id, name) do nothing;

select results_eq(
  $$select enumlabel
    from pg_enum
    where enumtypid = 'public.child_status'::regtype
    order by enumsortorder$$,
  array['active', 'archived'],
  'child_status contains exactly the expected values'
);

select results_eq(
  $$select array_agg(column_name order by ordinal_position)
    from information_schema.columns
    where table_schema = 'public' and table_name = 'room'$$,
  array['id', 'daycare_id', 'name', 'created_at']::text[],
  'room has the expected columns'
);

select results_eq(
  $$select array_agg(column_name order by ordinal_position)
    from information_schema.columns
    where table_schema = 'public' and table_name = 'child'$$,
  array[
    'id', 'room_id', 'full_name', 'birth_date', 'enrolled_at',
    'medical_notes', 'allergy_tags', 'photo_consent', 'status',
    'created_at', 'updated_at'
  ]::text[],
  'child has the expected columns'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.room'::regclass
      and conname = 'room_daycare_name_key'
  ),
  'room names are unique within a daycare'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.room'::regclass),
  'RLS is enabled on room'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.child'::regclass),
  'RLS is enabled on child'
);

select ok(
  exists (select 1 from pg_indexes where indexname = 'room_daycare_id_idx'),
  'room daycare_id has an index'
);

select ok(
  exists (select 1 from pg_indexes where indexname = 'child_room_id_idx'),
  'child room_id has an index'
);

select is(
  (
    select count(*)::integer
    from public.room as room
    join public.daycare as daycare on daycare.id = room.daycare_id
    where daycare.name = 'Room Child Other Daycare'
  ),
  10,
  'the seed shape creates ten rooms for every daycare'
);

select ok(
  has_table_privilege('authenticated', 'public.room', 'SELECT'),
  'authenticated can select rooms'
);

select ok(
  has_table_privilege('authenticated', 'public.child', 'SELECT'),
  'authenticated can select children'
);

select ok(
  has_table_privilege('authenticated', 'public.child', 'INSERT'),
  'authenticated can insert children'
);

select ok(
  not has_table_privilege('authenticated', 'public.child', 'UPDATE'),
  'authenticated cannot update children'
);

select ok(
  not has_table_privilege('authenticated', 'public.child', 'DELETE'),
  'authenticated cannot delete children'
);

select ok(
  not has_table_privilege('anon', 'public.room', 'SELECT'),
  'anon cannot select rooms'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select is(
  (
    select count(*)::integer
    from public.room
  ),
  10,
  'staff sees all ten rooms in their daycare'
);

select is(
  (select count(*)::integer from public.child),
  0,
  'child starts empty before the first insert'
);

select results_eq(
  $$insert into public.child (room_id, full_name, birth_date)
    values (
      (select id from public.room where name = 'Soles'),
      'Test Child',
      '2022-01-15'
    )
    returning full_name$$,
  array['Test Child'],
  'staff can insert a child in their daycare'
);

select results_eq(
  $$select full_name from public.child$$,
  array['Test Child'],
  'staff can read children in their daycare'
);

set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

select results_eq(
  $$select full_name from public.child$$,
  array['Test Child'],
  'admin can read children in their daycare'
);

select results_eq(
  $$insert into public.child (room_id, full_name, birth_date)
    values (
      (select id from public.room where name = 'Lunas'),
      'Admin Child',
      '2021-05-20'
    )
    returning full_name$$,
  array['Admin Child'],
  'admin can insert a child in their daycare'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$select * from public.room$$,
  'parent cannot read rooms'
);

select throws_ok(
  $$insert into public.child (room_id, full_name, birth_date)
    values (
      (select id from public.room where name = 'Soles'),
      'Parent Child',
      '2020-03-10'
    )$$,
  '42501',
  null,
  'parent cannot insert a child'
);

set local request.jwt.claim.sub = '44444444-4444-4444-4444-444444444444';

select is_empty(
  $$select * from public.child$$,
  'staff from another daycare cannot read children'
);

select throws_ok(
  $$insert into public.child (room_id, full_name, birth_date)
    values (
      (select id from public.room where name = 'Soles'),
      'Other Daycare Child',
      '2020-04-12'
    )$$,
  '42501',
  null,
  'staff from another daycare cannot insert into this daycare'
);

set local role anon;

select throws_ok(
  $$select * from public.room$$,
  '42501',
  null,
  'anon cannot read rooms'
);

select throws_ok(
  $$insert into public.child (room_id, full_name, birth_date)
    values (gen_random_uuid(), 'Anonymous Child', '2020-06-01')$$,
  '42501',
  null,
  'anon cannot insert children'
);

select * from finish();

rollback;
