import { createClient } from "@supabase/supabase-js";

const daycareNames = [
  "Guardería Sala Soles",
  "Guardería Luna",
  "Guardería Arcoíris",
  "Guardería Semillitas",
  "Guardería Estrellitas",
];

const requiredEnvironmentVariables = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  ...daycareNames.flatMap((_, index) => [
    `DAYCARE_SEED_EMAIL_${index + 1}`,
    `DAYCARE_SEED_PASSWORD_${index + 1}`,
  ]),
];

const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
  (name) => !process.env[name],
);

if (missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Faltan variables de entorno requeridas: ${missingEnvironmentVariables.join(", ")}`,
  );
}

const emails = daycareNames.map(
  (_, index) => process.env[`DAYCARE_SEED_EMAIL_${index + 1}`],
);

if (new Set(emails).size !== emails.length) {
  throw new Error("Los cinco emails demo deben ser distintos.");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const { data: usersPage, error: listUsersError } =
  await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

if (listUsersError) {
  throw new Error(`No se pudieron listar los usuarios demo: ${listUsersError.message}`);
}

const usersByEmail = new Map(
  usersPage.users.map((user) => [user.email?.toLowerCase(), user]),
);

for (const [index, name] of daycareNames.entries()) {
  const email = emails[index];
  const password = process.env[`DAYCARE_SEED_PASSWORD_${index + 1}`];
  let user = usersByEmail.get(email.toLowerCase());

  if (!user) {
    const { data: createdUser, error: createUserError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createUserError || !createdUser.user) {
      throw new Error(
        `No se pudo crear el usuario ${email}: ${createUserError?.message ?? "respuesta vacía"}`,
      );
    }

    user = createdUser.user;
  }

  const { error: upsertError } = await supabase
    .from("daycare")
    .upsert(
      {
        owner_id: user.id,
        name,
      },
      { onConflict: "owner_id,name" },
    );

  if (upsertError) {
    throw new Error(
      `No se pudo insertar ${name} para ${email}: ${upsertError.message}`,
    );
  }

  console.log(`Guardería preparada: ${name}`);
}

console.log("Seed de daycare completado: 5 guarderías preparadas.");
