begin;

create extension if not exists pgtap with schema extensions;

select plan(37);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '88888888-8888-8888-8888-888888888888',
    'user-owner@example.com',
    '{"role":"staff","full_name":"User Test Owner"}'::jsonb
  );

insert into public.daycare (owner_id, name)
values (
  '88888888-8888-8888-8888-888888888888',
  'User RLS Test Daycare'
);

insert into auth.users (id, email, raw_user_meta_data)
select
  '99999999-9999-9999-9999-999999999999',
  'user-other@example.com',
  jsonb_build_object(
    'role', 'parent',
    'full_name', 'User Test Other',
    'daycare_id', id::text
  )
from public.daycare
where owner_id = '88888888-8888-8888-8888-888888888888'
  and name = 'User RLS Test Daycare';

insert into auth.users (id, email, raw_user_meta_data)
select
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'user-third@example.com',
  jsonb_build_object(
    'role', 'staff',
    'full_name', 'User Test Third',
    'daycare_id', id::text
  )
from public.daycare
where owner_id = '88888888-8888-8888-8888-888888888888'
  and name = 'User RLS Test Daycare';

select results_eq(
  $$select enumlabel
    from pg_enum
    where enumtypid = 'public.user_role'::regtype
    order by enumsortorder$$,
  array['staff', 'parent', 'admin'],
  'user_role contains exactly the expected values'
);

select results_eq(
  $$select enumlabel
    from pg_enum
    where enumtypid = 'public.user_status'::regtype
    order by enumsortorder$$,
  array['pending', 'active'],
  'user_status contains exactly the expected values'
);

select results_eq(
  $$select array_agg(column_name order by ordinal_position)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user'$$,
  array[
    'id', 'daycare_id', 'role', 'status', 'full_name', 'avatar_url',
    'notify_on_post', 'daily_summary_enabled', 'created_at', 'updated_at'
  ]::text[],
  'public.user has the expected columns'
);

select is(
  (
    select pg_get_expr(adbin, adrelid)
    from pg_attribute
    join pg_attrdef on pg_attrdef.adrelid = pg_attribute.attrelid
      and pg_attrdef.adnum = pg_attribute.attnum
    where attrelid = 'public.user'::regclass
      and attname = 'status'
  ),
  '''active''::public.user_status',
  'status defaults to active'
);

select is(
  (
    select pg_get_expr(adbin, adrelid)
    from pg_attribute
    join pg_attrdef on pg_attrdef.adrelid = pg_attribute.attrelid
      and pg_attrdef.adnum = pg_attribute.attnum
    where attrelid = 'public.user'::regclass
      and attname = 'notify_on_post'
  ),
  'true',
  'notify_on_post defaults to true'
);

select is(
  (
    select pg_get_expr(adbin, adrelid)
    from pg_attribute
    join pg_attrdef on pg_attrdef.adrelid = pg_attribute.attrelid
      and pg_attrdef.adnum = pg_attribute.attnum
    where attrelid = 'public.user'::regclass
      and attname = 'daily_summary_enabled'
  ),
  'true',
  'daily_summary_enabled defaults to true'
);

select is(
  (
    select pg_get_expr(adbin, adrelid)
    from pg_attribute
    join pg_attrdef on pg_attrdef.adrelid = pg_attribute.attrelid
      and pg_attrdef.adnum = pg_attribute.attnum
    where attrelid = 'public.user'::regclass
      and attname = 'created_at'
  ),
  'now()',
  'created_at defaults to now()'
);

select is(
  (
    select pg_get_expr(adbin, adrelid)
    from pg_attribute
    join pg_attrdef on pg_attrdef.adrelid = pg_attribute.attrelid
      and pg_attrdef.adnum = pg_attribute.attnum
    where attrelid = 'public.user'::regclass
      and attname = 'updated_at'
  ),
  'now()',
  'updated_at defaults to now()'
);

select is(
  (select data_type from information_schema.columns
   where table_schema = 'public' and table_name = 'user' and column_name = 'id'),
  'uuid',
  'id is uuid'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user'::regclass
      and contype = 'p'
      and conkey = array[
        (select attnum from pg_attribute
         where attrelid = 'public.user'::regclass and attname = 'id')
      ]::smallint[]
  ),
  'id is the primary key'
);

select ok(
  (select is_nullable = 'YES' from information_schema.columns
   where table_schema = 'public' and table_name = 'user' and column_name = 'daycare_id'),
  'daycare_id is nullable'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user'::regclass
      and contype = 'f'
      and confrelid = 'auth.users'::regclass
      and confdeltype = 'c'
  ),
  'id references auth.users with cascade delete'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user'::regclass
      and contype = 'f'
      and confrelid = 'public.daycare'::regclass
      and confdeltype = 'n'
  ),
  'daycare_id references daycare with set null delete'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'user'
      and indexname = 'user_daycare_id_idx'
  ),
  'daycare_id has an index'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.user'::regclass),
  'RLS is enabled on public.user'
);

select ok(
  has_table_privilege('authenticated', 'public.user', 'SELECT'),
  'authenticated has SELECT privilege'
);

select ok(
  has_table_privilege('authenticated', 'public.user', 'UPDATE'),
  'authenticated has UPDATE privilege'
);

select ok(
  not has_table_privilege('authenticated', 'public.user', 'INSERT'),
  'authenticated has no INSERT privilege'
);

select ok(
  not has_table_privilege('authenticated', 'public.user', 'DELETE'),
  'authenticated has no DELETE privilege'
);

select ok(
  not has_column_privilege('authenticated', 'public.user', 'role', 'UPDATE'),
  'authenticated cannot update role'
);

select ok(
  not has_column_privilege('authenticated', 'public.user', 'status', 'UPDATE'),
  'authenticated cannot update status'
);

select ok(
  not has_column_privilege('authenticated', 'public.user', 'daycare_id', 'UPDATE'),
  'authenticated cannot update daycare_id'
);

select ok(
  not has_column_privilege('authenticated', 'public.user', 'id', 'UPDATE'),
  'authenticated cannot update id'
);

select ok(
  not has_column_privilege('authenticated', 'public.user', 'updated_at', 'UPDATE'),
  'authenticated cannot update updated_at'
);

select ok(
  not has_table_privilege('anon', 'public.user', 'SELECT'),
  'anon has no SELECT privilege'
);

select results_eq(
  $$select role::text, status::text, full_name, daycare_id = (
      select id from public.daycare where name = 'Guardería Sala Soles'
    ) as is_expected_daycare
    from public."user"
    where id = 'f87f1ab4-9a10-496a-b917-4ece602aeb33'$$,
  $$values ('staff', 'active', 'Staff de prueba', true)$$,
  'seeded staff profile has the expected identity and daycare'
);

select results_eq(
  $$select full_name
    from public."user"
    where id = '88888888-8888-8888-8888-888888888888'$$,
  array['User Test Owner'],
  'valid auth metadata creates a profile without daycare_id'
);

select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data)
    values (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'user-missing-role@example.com',
      '{"full_name":"Missing Role"}'::jsonb
    )$$,
  'P0001',
  'raw_user_meta_data.role is required to create a user profile',
  'trigger rejects metadata without role'
);

select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data)
    values (
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      'user-missing-name@example.com',
      '{"role":"staff"}'::jsonb
    )$$,
  'P0001',
  'raw_user_meta_data.full_name is required to create a user profile',
  'trigger rejects metadata without full_name'
);

select is(
  (
    select count(*)::integer
    from public."user"
    where daycare_id = (
      select id from public.daycare
      where owner_id = '88888888-8888-8888-8888-888888888888'
        and name = 'User RLS Test Daycare'
    )
  ),
  2,
  'multiple user profiles can reference one daycare'
);

update public."user"
set updated_at = '2000-01-01 00:00:00+00'
where id = '88888888-8888-8888-8888-888888888888';

set local role authenticated;
set local request.jwt.claim.sub = '88888888-8888-8888-8888-888888888888';

select results_eq(
  $$select full_name from public."user"$$,
  array['User Test Owner'],
  'authenticated user can read only their own profile'
);

select results_eq(
  $$update public."user"
    set full_name = 'Updated User Owner'
    where id = '88888888-8888-8888-8888-888888888888'
    returning full_name$$,
  array['Updated User Owner'],
  'authenticated user can update their own profile fields'
);

select ok(
  (select updated_at > '2000-01-01 00:00:00+00'
   from public."user"
   where id = '88888888-8888-8888-8888-888888888888'),
  'updated_at is refreshed automatically'
);

select throws_ok(
  $$update public."user"
    set role = 'admin'
    where id = '88888888-8888-8888-8888-888888888888'$$,
  '42501',
  null,
  'authenticated user cannot update role'
);

set local request.jwt.claim.sub = '99999999-9999-9999-9999-999999999999';

select is_empty(
  $$select * from public."user"
    where id = '88888888-8888-8888-8888-888888888888'$$,
  'another authenticated user cannot read the owner profile'
);

select is_empty(
  $$update public."user"
    set full_name = 'Unauthorized Update'
    where id = '88888888-8888-8888-8888-888888888888'
    returning id$$,
  'another authenticated user cannot update the owner profile'
);

set local role anon;

select throws_ok(
  $$select * from public."user"$$,
  '42501',
  null,
  'anon cannot read user profiles'
);

select * from finish();

rollback;
