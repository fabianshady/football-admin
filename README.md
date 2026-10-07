# ITJAGUARS FC · Administración

Aplicación en español para gestionar jugadores, temporadas, partidos, convocatorias, goles, aportaciones y datos del club. Este repositorio (`football-admin`, carpeta local `app_futbol`) administra el mismo proyecto Supabase que el [sitio público `football`](https://github.com/fabianshady/football).

## Requisitos y arranque

- **Node.js 22** y npm, como en CI y Docker.
- Proyecto Supabase con el contrato compartido y una cuenta Auth autorizada como administradora.

```sh
npm ci
cp .env.example .env.local
# Completar las variables de .env.local
npm run dev
```

Abrir http://localhost:3000. Si el sitio público ya usa ese puerto, ejecutar `npm run dev -- --port 3002` y abrir http://localhost:3002/login.

### Variables de entorno

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase compartido. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Clave publicable del mismo proyecto. |

Obtenerlas en la configuración API de Supabase. La plantilla contiene valores vacíos; completar `.env.local`, que está excluido de Git. Los clientes navegador/servidor/proxy usan exactamente estos nombres. **No se necesita `service_role`**: todas las operaciones utilizan la sesión del usuario y RLS.

Las variables `NEXT_PUBLIC_` quedan incorporadas al bundle durante la build. Configurarlas antes de `npm run build` o de construir la imagen; para cambiar de proyecto hay que recompilar.

## Acceso y rutas

El acceso es mediante email y contraseña en `/login`. La cuenta debe existir en Supabase Auth y estar autorizada en la membresía privada de administradores. Crear una cuenta Auth por sí solo no concede acceso. Un responsable de la base de datos gestiona esa membresía mediante un procedimiento privilegiado; la aplicación nunca lee directamente `private.admin_users`.

`requireAdmin()` verifica `getUser()` y el resultado de `is_admin()`. El proxy, layout, login, callback y acciones de dominio comprueban el rol. Una sesión sin autorización no puede entrar al panel ni escribir mediante las RPCs. Si se utiliza `/auth/callback`, configurar su URL local/Preview/producción en las URLs de redirección permitidas de Supabase Auth.

| Ruta | Gestión |
| --- | --- |
| `/` | Resumen del panel. |
| `/admin/players` | Jugadores, posiciones, dorsales y estado activo. |
| `/admin/seasons` | Temporadas y selección activa. |
| `/admin/matches` | Partidos, horarios, marcador, convocatoria y uniforme. |
| `/admin/goals` | Registro de goles. |
| `/admin/payments` | Eventos y estado de aportaciones. |
| `/admin/club` | Contacto, datos públicos de transferencia y horarios de equipos. |

## Arquitectura

- Next.js 16.1.6 App Router, React 19 y TypeScript.
- `src/app/(auth)`: login; `src/app/(dashboard)`: páginas protegidas.
- `src/app/actions`: acciones de servidor con autorización y validación.
- `src/lib/supabase/{client,server,proxy}.ts`: clientes tipados con `Database`, sesiones SSR y cookies.
- `src/lib/admin.ts`: comprobación central del administrador.
- `src/lib/validation.ts`: validación de formularios y contrato de las RPCs.
- `src/lib/dateUtils.ts`: conversiones entre calendario de Tijuana e instantes UTC.
- `src/lib/database.types.ts`: tipos generados del esquema compartido.
- `src/components`: formularios, diálogos, controles de pagos y navegación.
- `src/app/styles/tokens.css` y `src/app/globals.css`: tokens y Tailwind CSS 4.

La identidad visual comparte navy `#1B2A4A`, dorado y modos claro/oscuro/sistema con el sitio público. Los helpers de tema y tokens viven en cada repositorio para permitir despliegues independientes. La preferencia usa `itj-theme`; el script inicial aplica el tema antes del primer render.

## Contrato de base de datos

La fuente de migraciones es `../football/supabase/migrations/`. **`20261007024919_club_contract.sql`** (`club_contract`) fue aplicada el **7 de octubre de 2026, 02:49:19 UTC**. El arranque y las builds no ejecutan migraciones; no se utiliza Prisma.

- `team` y `kickoff_slot`: equipos, día local permitido y horarios autorizados.
- `club_settings`: singleton `id=1` para contacto y transferencia públicos.
- `Match.teamId` y `schedule_override`: equipo y excepción explícita de calendario.
- IDs de entidades de tipo texto, generados en la base de datos.
- `is_admin()`: autorización del usuario actual sin exponer la membresía privada.
- `save_match(p_match jsonb, p_player_ids text[]) → text`: guarda partido y reemplaza convocatoria en una transacción. La edición omite marcadores para conservarlos.
- `create_event_with_payments(p_name text, p_cost numeric, p_date timestamptz, p_season_id text) → text`: crea el evento y las aportaciones de jugadores activos atómicamente.

Las RPCs son invoker, requieren administrador y respetan RLS. Los pagos y estados de jugador detectan actualizaciones obsoletas y muestran el conflicto al usuario.

El cierre financiero **`20261007190054 / financial_public_projection_lockdown`** ya fue aplicado por la tarea coordinadora mediante la herramienta de migraciones, antes del despliegue de `dev`. El privilegio `SELECT` de `anon` es **false** para `Event` y `Payment`; `v_player_debt` sigue accesible y devolvió **14 filas en la comprobación posterior** (snapshot dinámico, no un conteo garantizado). El sitio público nuevo usa esa proyección; **el sitio legacy de `main` pierde sus consultas financieras directas con el cierre**. Ver [estado de migración](docs/db/MIGRATION_HANDOFF.md); no repetir el SQL aplicado.

La protección de contraseñas filtradas sigue pendiente: requiere **Pro o superior**. MCP no dispone de herramienta para ajustes Auth y el CLI no tiene token/sesión de Management API (`supabase projects list` falló). El propietario debe activar **Leaked password protection** en Dashboard → Authentication → Email → Password security. [Requisitos e instrucciones de Supabase](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

### Calendario

Los partidos se guardan en UTC; los formularios usan **America/Tijuana** con horario de verano. El equipo determina el día permitido y el catálogo determina las horas. Una excepción debe marcarse explícitamente; los triggers de base de datos son la última validación.

Fechas sin hora se convierten a mediodía de Tijuana. Horas inexistentes durante el cambio de verano se rechazan. Al editar sin cambiar el calendario se conserva el instante UTC exacto, incluso segundos y la elección de hora repetida de otoño. El marcador siempre representa **Nosotros / Rival**, independientemente de la sede.

## Comprobaciones

```sh
npm run check
npm run build
```

| Comando | Función |
| --- | --- |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript sin escribir metadatos incrementales. |
| `npm test` | Tests de Node mediante `tsx`, en `tests/*.test.ts`. |
| `npm run check` | Lint, tipos y tests. |
| `npm run build` | Compilación de producción standalone. |
| `npm run start` | Servir una compilación local. |

Los tests cubren conversiones Tijuana/UTC y DST, fechas inválidas, restricciones del calendario, payloads de partido, convocatoria y validación numérica. Las comprobaciones de build usan configuración ficticia en CI y no demuestran autorización o escritura real en Supabase. La [adaptación administrativa](docs/ADMIN_ADAPTATION.md) detalla los contratos y la verificación funcional pendiente.

## Desarrollo y despliegue

1. Trabajar en `dev`, ejecutar `npm run check` y `npm run build`.
2. Publicar `dev` y revisar el Preview/de pruebas configurado en el proveedor.
3. Probar login autorizado y rechazo anónimo/no administrador; crear/editar partido, marcador, convocatoria, goles, jugadores, temporadas, pagos y configuración. Revisar fechas, móvil/escritorio, diálogos y ambos temas.
4. Validar también el sitio público compartido. Después, revisar e integrar **manualmente** `dev` → `main` en ambos repositorios.

`check.yml` ejecuta checks y build con Node 22 en PRs y pushes a `main`/`dev`. `publish-image.yml` publica únicamente en push a `main`: imagen GHCR `app_futbol_admin`, `linux/arm64`, etiquetas `latest` y SHA completo; omite cambios solo documentales/configuración de GitHub indicados en el workflow. La integración Git del proveedor configura los Previews; el workflow no despliega un Preview ni aplica SQL. La publicación Docker y las comprobaciones son jobs independientes.

## Docker

Imagen multietapa con Node 22, salida standalone y ejecución sin root en el puerto **3000**. Exportar las dos variables públicas en el shell antes de construir:

```sh
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY \
  -t itjaguars-admin .
docker run --rm -p 3002:3000 --env-file .env.local itjaguars-admin
```

La imagen publicada en GHCR recibe los argumentos desde los secrets de GitHub `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`. Los `.env*` locales no entran en el contexto Docker.

## Documentación relacionada

- [Contratos de administración y verificación](docs/ADMIN_ADAPTATION.md).
- [Estado de la migración compartida](docs/db/MIGRATION_HANDOFF.md).
- [SQL, permisos, verificación y rollback](https://github.com/fabianshady/football/blob/dev/docs/db/MIGRATION_NOTES.md) (local: `../football/docs/db/MIGRATION_NOTES.md`).
- [Sistema visual público compartido](https://github.com/fabianshady/football/blob/dev/docs/design/DESIGN.md) (local: `../football/docs/design/DESIGN.md`).

Repositorio privado mantenido por [fabianshady](https://github.com/fabianshady), sin licencia declarada.
