# Seeds administrativos

## Seed de guarderías demo

`seed-daycare.mjs` crea o reutiliza cinco usuarios demo mediante Supabase Admin API y prepara estas guarderías:

- Guardería Sala Soles
- Guardería Luna
- Guardería Arcoíris
- Guardería Semillitas
- Guardería Estrellitas

El seed es explícito. No se ejecuta al aplicar migraciones.

### Configuración

El seeder lee las variables desde `process.env`. El archivo `.env.daycare.local` debe estar en la **raíz del proyecto**, al mismo nivel que `package.json`. El comando del proyecto carga automáticamente ese archivo, si existe, mediante Node.js `--env-file-if-exists`:

```bash
npm run seed:daycare
```

La plantilla `.env.daycare.local.example` también está en la **raíz del proyecto**. La forma recomendada es copiarla y editar únicamente el archivo local:

```bash
cp .env.daycare.local.example .env.daycare.local
```

Después reemplaza todos los valores `<...>` en `.env.daycare.local`. Ese archivo está ignorado por Git y no debe compartirse.

La carpeta `scripts/` contiene el código del seeder y su documentación, pero no contiene archivos de configuración ni secretos. Si guardas las variables en otra ruta, debes cargar el archivo explícitamente con Node.js, por ejemplo: `node --env-file=ruta/al/archivo scripts/seed-daycare.mjs`.

También puedes registrar las variables temporalmente con `export` en la misma terminal donde ejecutarás el comando:

```bash
export SUPABASE_URL="https://<project-ref>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<secret-service-role-key>"
export DAYCARE_SEED_EMAIL_1="<email-1>"
export DAYCARE_SEED_PASSWORD_1="<password-1>"
# Repite DAYCARE_SEED_EMAIL_N y DAYCARE_SEED_PASSWORD_N hasta N=5.
npm run seed:daycare
```

Si una variable existe tanto en el `export` como en `.env.daycare.local`, Node.js da prioridad al valor exportado. Las variables solo estarán disponibles en ese proceso y sus procesos hijos.

Las variables requeridas son:

```text
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<secret-service-role-key>
DAYCARE_SEED_EMAIL_1=<email-1>
DAYCARE_SEED_PASSWORD_1=<password-1>
DAYCARE_SEED_EMAIL_2=<email-2>
DAYCARE_SEED_PASSWORD_2=<password-2>
DAYCARE_SEED_EMAIL_3=<email-3>
DAYCARE_SEED_PASSWORD_3=<password-3>
DAYCARE_SEED_EMAIL_4=<email-4>
DAYCARE_SEED_PASSWORD_4=<password-4>
DAYCARE_SEED_EMAIL_5=<email-5>
DAYCARE_SEED_PASSWORD_5=<password-5>
```

La clave `SUPABASE_SERVICE_ROLE_KEY` tiene privilegios administrativos. No la uses en el navegador, no la pegues en tickets o logs y no la guardes en archivos versionados.

El script no elimina usuarios ni guarderías existentes. Las cinco relaciones se escriben mediante upsert sobre `(owner_id, name)`, por lo que se puede repetir de forma controlada.

Las contraseñas deben generarse y distribuirse mediante el mecanismo seguro del entorno. El script no las imprime.
