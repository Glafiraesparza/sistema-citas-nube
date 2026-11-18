# 02. Supabase y PostgreSQL

## Objetivo

Registrar la compatibilidad del esquema Prisma con PostgreSQL, el estado local de las migraciones y las comprobaciones necesarias antes de conectar Supabase.

## Estado actual

**Realizado:** inspección de esquema/configuración/migraciones; `prisma migrate status` ejecutado contra la base local configurada.

**Pendiente:** configurar una conexión Supabase para runtime, decidir conexión de migraciones y verificar tablas/historial en el proyecto remoto.

La `DATABASE_URL` inspeccionada localmente se clasificó como PostgreSQL local, no Supabase. No se documenta su host, usuario, contraseña ni contenido.

## Configuración Prisma observada

- `backend/prisma/schema.prisma` declara proveedor `postgresql` y cinco modelos: `Usuario`, `Paciente`, `Medico`, `Horario` y `Cita`.
- `backend/prisma7.config.ts` carga `dotenv/config`, define el schema y el directorio de migraciones, y toma la URL de `process.env.DATABASE_URL`.
- `backend/src/lib/prisma.js` crea un singleton `PrismaClient` con `PrismaPg` y `connectionString: process.env.DATABASE_URL`.
- Prisma y `@prisma/client` están en versión 7.10; `@prisma/adapter-pg` y `pg` están declarados en dependencias de runtime.
- La URL de la aplicación y la URL de Prisma CLI son actualmente la misma. No existe `DIRECT_URL` configurada.

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
- **Session Pooler:** recomendación inicial para este servicio persistente de Node/Express cuando se necesita IPv4 y semántica de sesión convencional. Limitar el pool de cada instancia y el máximo de instancias de Cloud Run; el pooler de sesión no elimina el riesgo de consumir conexiones.
- **Transaction Pooler:** opción para mayor multiplexación en despliegues con escalado serverless. Tiene limitaciones de estado de sesión y prepared statements; probar específicamente con `PrismaPg`/`pg` antes de adoptarla. No usarla para ejecutar migraciones.
- **Migraciones:** preferir URL directa desde un runner con conectividad compatible; Session Pooler es alternativa si la directa no es accesible. Si la aplicación usa otra URL, modificar la configuración CLI Prisma 7 para leer una variable separada como `DIRECT_URL`. Esa separación todavía no está implementada.

El paquete `PrismaPg` crea `pg.Pool` sin opciones de pool explícitas; se aplican los valores por defecto de `pg` (habitualmente hasta 10 conexiones por proceso). Con Cloud Run, el total puede multiplicarse por instancia. El tamaño final debe establecerse junto con el límite de instancias y los límites del proyecto Supabase.

Supabase recomienda TLS. `sslmode=require` cifra la conexión; la verificación estricta del certificado requiere certificado raíz y `verify-full`. Confirmar cómo la cadena elegida configura TLS en `pg` y no desactivar la validación del certificado como solución permanente.

Referencias oficiales: [métodos de conexión PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres) y [guía Supabase Prisma](https://supabase.com/docs/guides/database/prisma).

## Comprobaciones seguras pendientes

1. En Supabase, copiar la conexión desde el panel **Connect**; no pegarla en documentación, tickets o capturas.
2. Clasificar una URL localmente sin imprimirla. Mostrar solo categorías (local/Supabase/otro), tipo de pooler y presencia de TLS; nunca mostrar host completo, credenciales ni query string.
3. Consultar tablas existentes mediante una operación de solo lectura en el esquema `public`, por ejemplo `information_schema.tables`, y comparar con las cinco tablas del modelo.
4. Una vez configurada la URL de Supabase, ejecutar `npx prisma migrate status`. Este comando abre conexión a la base y lee `_prisma_migrations`; no aplicar migraciones durante esta verificación.
5. Probar `/api/health/database` cuando Cloud Run tenga los secretos configurados. El endpoint ejecuta `SELECT 1`; respuesta 200 confirma conexión, 500 indica fallo.
6. Confirmar límites de conexiones, región, acceso IPv4/IPv6, SSL requerido y política de certificados en el proyecto Supabase.

## Evidencias por capturar

- [Captura pendiente: conexión seleccionada en el panel Supabase, con URL, host, usuario y contraseña ocultos.]
- [Captura pendiente: resultado de consulta de nombres de tablas en `public`.]
- [Captura pendiente: salida de `prisma migrate status` para Supabase, sin host ni URL visibles.]
- [Captura pendiente: respuesta del endpoint de salud de base de datos, sin valores de entorno.]

## Acciones planificadas

- Confirmar si el proyecto Supabase ya contiene datos/tablas antes de cualquier migración.
- Definir usuario de base de datos con privilegios mínimos apropiados para runtime y una credencial/rol controlado para migraciones.
- Configurar secretos en Cloud Run; no almacenar cadenas reales en `.env.example` ni en Git.
- Planificar cualquier aplicación futura de migraciones como operación aprobada, con respaldo y revisión previa.
