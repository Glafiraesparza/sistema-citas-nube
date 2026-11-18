# 03. Google Cloud Run

## Objetivo

Registrar la futura publicación del backend contenedorizado en Cloud Run.

## Estado

**Realizado:** imagen Docker construida y ejecutada localmente; puerto y endpoint de salud comprobados.

**Pendiente:** proyecto, región, Artifact Registry, secretos, límites, publicación y pruebas en el servicio remoto. No se ejecutó `gcloud run deploy` ni se publicó imagen.

## Prerrequisitos por confirmar

- Proyecto de Google Cloud seleccionado y facturación habilitada.
- APIs de Cloud Run, Cloud Build y Artifact Registry habilitadas; permisos IAM revisados.
- Región elegida y compatible con la región Supabase para reducir latencia.
- Método de salida de red hacia Supabase y acceso IPv4/IPv6 comprobados.
- Secretos `DATABASE_URL` y `JWT_SECRET` almacenados en Secret Manager. `FRONTEND_URL` se añadirá al conocer el origen Firebase final.
- Pool PostgreSQL y máximo de instancias definidos para no exceder conexiones Supabase.

## Preparación local ya realizada

- `backend/Dockerfile` usa Node 22, multi-stage, genera Prisma Client, instala solo dependencias runtime en la etapa final y ejecuta como usuario `node`.
- Express escucha en `0.0.0.0` y utiliza `process.env.PORT` (fallback local 3000).
- Docker local completó el build en el segundo intento. El primero fue cancelado durante `npm ci` y se resolvió con reintento.
- La imagen se ejecutó localmente sin `DATABASE_URL` ni `JWT_SECRET`; `/api/health` respondió 200. Esto validó arranque y health HTTP, no acceso a PostgreSQL.

## Procedimiento planificado

Los comandos siguientes son plantillas; sustituir los marcadores por valores del proyecto sin escribir secretos en la línea de comandos o el historial de shell.

1. Desde `backend/`, autenticar `gcloud` en el proyecto autorizado y crear/seleccionar un repositorio Docker en Artifact Registry.
2. Construir y enviar la imagen con Cloud Build:

   ```sh
   gcloud builds submit \
     --tag "REGION-docker.pkg.dev/PROJECT_ID/ARTIFACT_REPOSITORY/sistema-citas-api:TAG" \
     .
   ```

3. Crear secretos en Secret Manager mediante un canal aprobado. No incluir valores en este documento.
4. Desplegar la imagen configurando `NODE_ENV=production`, `FRONTEND_URL` y referencias a los secretos `DATABASE_URL` y `JWT_SECRET`; dejar que Cloud Run inyecte `PORT`.
5. Definir límites/concurrencia e instancias según la capacidad Supabase y el tamaño real del pool `pg`.
6. Decidir exposición HTTP: el frontend necesita alcanzar la API de login; los permisos de negocio continúan protegidos por JWT. CORS no sustituye autenticación ni autorización.
7. Probar `/api/health`, luego `/api/health/database`, y revisar logs sin imprimir configuración sensible.
8. Confirmar una conexión de extremo a extremo desde Cloud Run antes de publicar el frontend.

Las migraciones deben ejecutarse como paso controlado separado con la conexión adecuada, nunca automáticamente en el arranque de cada instancia.

## Evidencias por capturar

- [Captura pendiente: imagen/tag en Artifact Registry, sin secretos.]
- [Captura pendiente: configuración del servicio y región, ocultando referencias sensibles.]
- [Captura pendiente: referencias a Secret Manager con nombres/versiones visibles solo si la política lo permite; nunca valores.]
- [Captura pendiente: respuesta de `/api/health` y `/api/health/database`.]
- [Captura pendiente: URL asignada por Cloud Run, una vez exista; no hay URL pública actualmente.]

## Pendiente

No se conocen proyecto, región, nombre de servicio, URL pública, límites efectivos ni estado de red. Registrar esos datos solo después de que la publicación haya sido autorizada y realizada.
