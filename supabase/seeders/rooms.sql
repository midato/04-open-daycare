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
on conflict (daycare_id, name) do nothing;
