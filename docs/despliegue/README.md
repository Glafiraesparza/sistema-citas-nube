# Despliegue en la nube

## Arquitectura objetivo

| Componente | Tecnología | Responsabilidad | Estado |
|---|---|---|---|
| Interfaz web | React + Vite, Firebase Hosting | Compilar y servir la aplicación como SPA | Pendiente |
| API | Node.js + Express, Docker, Google Cloud Run | Exponer autenticación y operaciones de agenda | Preparación local completada; publicación pendiente |
| Base de datos | PostgreSQL en Supabase | Persistencia de usuarios, médicos, pacientes, horarios y citas | Conexión de producción pendiente |
| ORM | Prisma 7.10 + `@prisma/adapter-pg` | Acceso a PostgreSQL y gestión versionada del esquema | Cliente generado y configuración local comprobada |

## Objetivo

Documentar las actividades, resultados y decisiones del despliegue. Los estados de esta carpeta distinguen entre trabajo realizado localmente y actividades que requieren acceso a Supabase, Google Cloud o Firebase.

## Estado general comprobado

- El backend dispone de Dockerfile multi-stage con Node 22, generación de Prisma Client durante la construcción y usuario no privilegiado en runtime.
- La imagen se construyó y ejecutó localmente. `/api/health` respondió correctamente.
- Express usa el puerto `PORT`, escucha en `0.0.0.0` y permite configurar CORS mediante `FRONTEND_URL`.
- Prisma 7.10 generó el cliente correctamente. El estado de dos migraciones se consultó contra la base local, no contra Supabase.
- No se ha conectado ni desplegado el backend en Supabase o Cloud Run.
- No se ha compilado ni publicado el frontend en Firebase Hosting para esta arquitectura.
- El frontend todavía contiene direcciones API de `localhost`; debe configurarse para consumir la URL futura de Cloud Run.

## Documentos

1. [Preparación del backend](01-preparacion-backend.md)
2. [Supabase y PostgreSQL](02-supabase.md)
3. [Google Cloud Run](03-cloud-run.md)
4. [Firebase Hosting](04-firebase-hosting.md)

## Convenciones de estado

- **Realizado:** verificado en el repositorio o mediante una prueba local documentada.
- **Pendiente:** aún requiere comprobación o acceso a un servicio externo.
- **Planificado:** acción propuesta para completar el despliegue; no debe interpretarse como ejecutada.

No incluir contraseñas, tokens, secretos, archivos `.env` ni cadenas de conexión en esta documentación. Las capturas futuras deben ocultar valores sensibles.
