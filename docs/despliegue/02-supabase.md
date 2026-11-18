# 02. Supabase y PostgreSQL

## Objetivo

Registrar la compatibilidad del esquema Prisma con PostgreSQL, el estado local de las migraciones y las comprobaciones necesarias antes de conectar Supabase.

## Estado actual

**Realizado:** inspección de esquema/configuración/migraciones; `prisma migrate status` ejecutado contra la base local configurada; Prisma CLI ahora prefiere `DIRECT_URL`; el pool de aplicación admite `PG_POOL_MAX` con default 5.

**Pendiente:** cargar por separado las conexiones Session Pooler de Supabase en `DATABASE_URL` (runtime) y `DIRECT_URL` (CLI/migraciones), y verificar tablas/historial en el proyecto remoto.

La `DATABASE_URL` inspeccionada localmente se clasificó como PostgreSQL local, no Supabase. No se documenta su host, usuario, contraseña ni contenido.

## Configuración Prisma observada

- `backend/prisma/schema.prisma` declara proveedor `postgresql` y cinco modelos: `Usuario`, `Paciente`, `Medico`, `Horario` y `Cita`.
- `backend/prisma7.config.ts` carga `dotenv/config`, define el schema y el directorio de migraciones, y prefiere `DIRECT_URL` para comandos Prisma. Fuera de producción conserva el fallback a `DATABASE_URL` para desarrollo local; en producción no permite ese fallback.
- `backend/src/lib/prisma.js` crea un singleton `PrismaClient` con `PrismaPg`, usa `DATABASE_URL` para la aplicación y configura `pg.Pool.max` mediante `PG_POOL_MAX`.
- Prisma y `@prisma/client` están en versión 7.10; `@prisma/adapter-pg` y `pg` están declarados en dependencias de runtime.
- `DATABASE_URL` se mantiene como URL de runtime de la aplicación. `DIRECT_URL` es la URL que Prisma CLI prefiere para migraciones; ambas variables deben configurarse en producción.
- En desarrollo, cuando `DIRECT_URL` no está definida, Prisma CLI utiliza `DATABASE_URL` local. No se modificó `.env` real.

## Tablas y relaciones

- `Usuario`: correo único, nombre, hash de contraseña y rol.
- `Paciente`: relación uno a uno con usuario; teléfono y fecha de nacimiento opcionales.
- `Medico`: nombre y teléfono opcional.
- `Horario`: pertenece a un médico; día de semana y rango horario.
- `Cita`: pertenece a paciente y médico; fecha, hora, estado y motivo opcional.
- Pacientes, horarios y citas tienen relaciones con reglas `ON DELETE CASCADE` según el esquema/migración inicial.
- La migración posterior reemplaza la unicidad global médico-fecha-hora por un índice único parcial que excluye citas canceladas.

## Migraciones

Existen dos directorios versionados:

1. `20261001174526_initial`
2. `20261112141750_permitir_reutilizar_horarios_cancelados`

La configuración real de Prisma 7 fue compatible con `npx prisma migrate status`. El comando se conecta a la base indicada por `DATABASE_URL` y consulta el historial de migraciones; no aplica cambios. Resultado local: se encontraron dos migraciones y la base local estaba al día. **Este resultado no corresponde a Supabase.**

No se ejecutaron `migrate dev`, `migrate deploy`, `db push` ni `migrate reset`.

## Conexiones Supabase y recomendación

Supabase ofrece conexión directa, Session Pooler y Transaction Pooler. La elección depende de la red de salida de Cloud Run y del patrón de conexiones:

- **Directa:** adecuada para migraciones y clientes persistentes si existe conectividad IPv6 o está habilitado el complemento IPv4. La conexión directa puede no ser alcanzable desde una red solo IPv4.
- **Session Pooler:** decisión para el primer despliegue, tanto para la aplicación como para Prisma CLI/migraciones. Usar sus cadenas en variables separadas (`DATABASE_URL` y `DIRECT_URL`). El pooler de sesión conserva semántica de sesión y suele ser accesible por IPv4; confirmar su endpoint/usuario exacto desde el panel Supabase.
- **Transaction Pooler:** opción para mayor multiplexación en despliegues con escalado serverless. Tiene limitaciones de estado de sesión y prepared statements; probar específicamente con `PrismaPg`/`pg` antes de adoptarla. No usarla para ejecutar migraciones.
- **Migraciones:** en este proyecto se usará Session Pooler, según la decisión del primer despliegue. La configuración Prisma 7 ya prioriza `DIRECT_URL`; en producción queda pendiente cargar su valor seguro. La URL de migraciones puede usar el mismo modo Session Pooler que runtime, aunque se mantiene separada para poder cambiarla independientemente.

El pool `pg` tiene un máximo configurable por `PG_POOL_MAX`, con valor predeterminado conservador de 5 conexiones por instancia. Con Cloud Run, el total posible sigue multiplicándose por instancias; calcularlo como `PG_POOL_MAX × máximo de instancias` y ajustarlo a los límites del proyecto Supabase.

Supabase recomienda TLS. El adaptador pasa la cadena de conexión a `pg`, y `pg-connection-string` interpreta `sslmode`; las pruebas con URLs ficticias confirmaron que `disable` desactiva SSL y `require`/`verify-full` habilitan una configuración SSL. En la versión instalada, el parser emite una advertencia: hoy trata `require` como alias de `verify-full`, con cambio de semántica previsto para `pg-connection-string` 3 / `pg` 9. Para evitar depender del alias, usar explícitamente `sslmode=verify-full` en las URLs Supabase y verificar el certificado raíz/CA recomendado por Supabase. No se añadió TLS obligatorio al código para no afectar la conexión local; la URL de producción debe exigirlo.

Referencias oficiales: [métodos de conexión PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres) y [guía Supabase Prisma](https://supabase.com/docs/guides/database/prisma).

## Comprobaciones seguras pendientes

1. En Supabase, copiar la conexión desde el panel **Connect**; no pegarla en documentación, tickets o capturas.
2. Clasificar `DATABASE_URL` y `DIRECT_URL` localmente sin imprimirlas. Mostrar solo categorías (local/Supabase/otro), tipo de pooler y presencia/modo TLS; nunca mostrar host completo, credenciales ni query string.
3. Consultar tablas existentes mediante una operación de solo lectura en el esquema `public`, por ejemplo `information_schema.tables`, y comparar con las cinco tablas del modelo.
4. Una vez configurada `DIRECT_URL` de Supabase, ejecutar `npx prisma migrate status`. Este comando abre conexión a la base y lee `_prisma_migrations`; no aplica migraciones. En producción, si falta `DIRECT_URL`, Prisma CLI ya no recurre a `DATABASE_URL`.
5. Probar `/api/health/database` cuando Cloud Run tenga los secretos configurados. El endpoint ejecuta `SELECT 1`; respuesta 200 confirma conexión, 500 indica fallo.
6. Confirmar límites de conexiones, región, acceso IPv4/IPv6, SSL requerido y política de certificados en el proyecto Supabase.

## Evidencias por capturar

- [Captura pendiente: conexión seleccionada en el panel Supabase, con URL, host, usuario y contraseña ocultos.]
- [Captura pendiente: resultado de consulta de nombres de tablas en `public`.]
- [Captura pendiente: salida de `prisma migrate status` para Supabase, sin host ni URL visibles.]
- [Captura pendiente: respuesta del endpoint de salud de base de datos, sin valores de entorno.]

## Acciones planificadas

- Confirmar si el proyecto Supabase ya contiene datos/tablas antes de cualquier migración.
- Definir credenciales/roles y privilegios mínimos apropiados para runtime y migraciones; no registrar valores en archivos versionados.
- Ajustar `PG_POOL_MAX` y el máximo de instancias de Cloud Run según límites reales de Supabase.
- Configurar secretos en Cloud Run; no almacenar cadenas reales en `.env.example` ni en Git.
- Planificar cualquier aplicación futura de migraciones como operación aprobada, con respaldo y revisión previa.
