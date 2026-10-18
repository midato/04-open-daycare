---
description: Verifica y marca los criterios de aceptación de un spec usando el agente spec-verifier (MiMo-V2.6-Flash Free).
agent: spec-verifier
---

Verifica los criterios de aceptación del spec indicado y marca sus checks, siguiendo el flujo completo definido en `.opencode/agent/spec-verifier.md`.

Spec indicado: `$ARGUMENTS`

## Instrucciones

1. Si `$ARGUMENTS` está vacío: lista los archivos de `specs/` y pide al usuario que elija uno. Detente hasta recibir la respuesta.
2. Localiza el spec en `specs/` (acepta número, slug o nombre completo).
3. Ejecuta el flujo completo de verificación del agente spec-verifier sobre ese spec:
   - Leer el spec y extraer la sección `Acceptance criteria` (o `Criterios de aceptación`).
   - Verificar cada criterio con evidencia: comandos (`npx tsc --noEmit`, `npx eslint app/` — nunca `npm run lint` completo por el gotcha de `references/pantallas/support.js`), inspección de archivos (`ruta:línea`), **Context7** para las recomendaciones actuales de Next.js, **Playwright MCP** para el HTML servido y screenshots (guardados en `.playwright-mcp/`), y **comparación visual con tu modelo de visión** contra `references/screenshots/` y el mockup `references/pantallas/*.dc.html` (fuente de verdad).
   - Si el dev server ya corre en el puerto, úsalo; solo mata el servidor si tú lo iniciaste.
   - Corrige lo que falle y re-verifica hasta pasar (respeta las `Decisions` del spec).
   - Marcar los checks en el spec: `- [x]` con evidencia; `- [ ]` solo con motivo claro.
   - No cambiar la línea `**Status:**` del spec.
4. Termina con el reporte en tabla (criterio → estado → evidencia), las correcciones aplicadas y los pendientes; si todo pasó, recuerda que pasar `Status:` a `Implemented` es decisión del humano. No hagas commit.
