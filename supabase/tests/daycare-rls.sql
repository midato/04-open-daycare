begin;

create extension if not exists pgtap with schema extensions;

select plan(22);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'daycare-owner@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'daycare-other@example.com');

select ok(
  has_table_privilege('authenticated', 'public.daycare', 'SELECT'),
  'authenticated has SELECT privilege'
);

select ok(
  has_table_privilege('authenticated', 'public.daycare', 'INSERT'),
  'authenticated has INSERT privilege'
);

select ok(
  has_table_privilege('authenticated', 'public.daycare', 'UPDATE'),
  'authenticated has UPDATE privilege'
);

select ok(
  has_table_privilege('authenticated', 'public.daycare', 'DELETE'),
  'authenticated has DELETE privilege'
);

select ok(
  not has_table_privilege('authenticated', 'public.daycare', 'TRUNCATE'),
  'authenticated has no TRUNCATE privilege'
);

select ok(
  not has_table_privilege('anon', 'public.daycare', 'SELECT'),
  'anon has no SELECT privilege'
);

set local role anon;

select throws_ok(
  $$select * from public.daycare$$,
  '42501',
  null,
  'anon cannot read daycare rows'
);

select throws_ok(
  $$insert into public.daycare (owner_id, name)
    values ('11111111-1111-1111-1111-111111111111', 'Anonymous Daycare')$$,
  '42501',
  null,
  'anon cannot insert daycare rows'
);

select throws_ok(
  $$update public.daycare set name = 'Anonymous Update'$$,
  '42501',
  null,
  'anon cannot update daycare rows'
);

select throws_ok(
  $$delete from public.daycare$$,
  '42501',
  null,
  'anon cannot delete daycare rows'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$insert into public.daycare (owner_id, name)
    values (
      '11111111-1111-1111-1111-111111111111',
      'Owner Daycare'
    )
    returning name$$,
  array['Owner Daycare'],
  'owner can insert a daycare row'
);

select results_eq(
  $$select name from public.daycare
    where owner_id = '11111111-1111-1111-1111-111111111111'$$,
  array['Owner Daycare'],
  'owner can read their own daycare row'
);

select results_eq(
  $$update public.daycare
    set name = 'Updated Daycare'
    where owner_id = '11111111-1111-1111-1111-111111111111'
    returning name$$,
  array['Updated Daycare'],
  'owner can update their own daycare row'
);

select results_eq(
  $$select updated_at >= now() - interval '10 seconds' as trigger_updated_at
    from public.daycare
    where owner_id = '11111111-1111-1111-1111-111111111111'$$,
  array[true],
  'updated_at is refreshed by the trigger'
);

select throws_ok(
  $$update public.daycare
    set owner_id = '22222222-2222-2222-2222-222222222222'
    where owner_id = '11111111-1111-1111-1111-111111111111'$$,
  '42501',
  null,
  'owner cannot transfer a daycare row to another owner'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select is_empty(
  $$select * from public.daycare$$,
  'another authenticated user cannot read the owners daycare row'
);

select throws_ok(
  $$insert into public.daycare (owner_id, name)
    values (
      '11111111-1111-1111-1111-111111111111',
      'Impersonated Daycare'
    )$$,
  '42501',
  null,
  'another authenticated user cannot insert for the owner'
);

select results_eq(
  $$insert into public.daycare (owner_id, name)
    values (
      '22222222-2222-2222-2222-222222222222',
      'Other Daycare'
    )
    returning name$$,
  array['Other Daycare'],
  'another authenticated user can insert their own daycare row'
);

select is_empty(
  $$update public.daycare
    set name = 'Unauthorized Update'
    where owner_id = '11111111-1111-1111-1111-111111111111'
    returning name$$,
  'another authenticated user cannot update the owners daycare row'
);

select is_empty(
  $$delete from public.daycare
    where owner_id = '11111111-1111-1111-1111-111111111111'
    returning name$$,
  'another authenticated user cannot delete the owners daycare row'
);

set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$select name from public.daycare
    where owner_id = '11111111-1111-1111-1111-111111111111'$$,
  array['Updated Daycare'],
  'the denied update left the owners daycare row intact'
);

select results_eq(
  $$delete from public.daycare
    where owner_id = '11111111-1111-1111-1111-111111111111'
    returning name$$,
  array['Updated Daycare'],
  'owner can delete their own daycare row'
);

select * from finish();

rollback;
