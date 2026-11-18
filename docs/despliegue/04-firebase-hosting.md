# 04. Firebase Hosting

## Objetivo

Registrar la futura publicación del frontend React + Vite como aplicación de página única (SPA) en Firebase Hosting.

## Estado

**Realizado:** diagnóstico del frontend; se comprobó que las llamadas actuales usan direcciones `localhost:3000`.

**Pendiente:** no hay `firebase.json` ni `.firebaserc`; no se configuró Firebase Hosting ni se publicó el frontend. `npm run build` sí pasó en validaciones locales anteriores, pero no se compiló con una URL de API de producción.

## Cambios necesarios antes de publicar

1. Centralizar la URL base de la API mediante una variable pública de build, por ejemplo `VITE_API_URL`, y reemplazar las URLs `localhost` en el cliente frontend.
2. Usar únicamente la URL pública final de Cloud Run en el build de producción. Las variables `VITE_*` se incorporan al bundle y no deben contener contraseñas, tokens privados ni cadenas de base de datos.
3. Crear `firebase.json` con `hosting.public` apuntando a `dist`, exclusiones de archivos de desarrollo y una regla SPA que reescriba rutas al `index.html`.
4. Seleccionar el proyecto Firebase y crear la configuración de Hosting (`.firebaserc` si se decide versionar el alias del proyecto).
5. Compilar desde `frontend/` con `npm run build`; revisar el contenido de `dist` y probar `npm run preview` antes del deploy.
6. Publicar únicamente Hosting con Firebase CLI después de confirmar que Cloud Run es accesible y CORS permite el origen del sitio.
7. Configurar el origen Firebase final como `FRONTEND_URL` en Cloud Run y repetir la prueba CORS.

El `vercel.json` existente contiene configuración específica de Vercel y no configura Firebase Hosting. Su eliminación o conservación como alternativa requiere una decisión aparte.

## Verificaciones posteriores planificadas

- Cargar la página inicial y navegar por rutas internas; confirmar el fallback SPA al recargar.
- Iniciar sesión y comprobar llamadas a Cloud Run desde el navegador.
- Revisar la consola de red: API con dominio Cloud Run, ausencia de `localhost`, errores CORS o secretos expuestos.
- Probar flujos principales de Citas, Médicos, Pacientes y Horarios en el entorno autorizado.

## Evidencias por capturar

- [Captura pendiente: configuración de Firebase Hosting con `dist` y rewrite SPA.]
- [Captura pendiente: salida de `npm run build`.]
- [Captura pendiente: página publicada y dominio asignado por Firebase; no hay URL pública actualmente.]
- [Captura pendiente: solicitud del navegador a Cloud Run y respuesta CORS, sin tokens visibles.]

## Pendiente

No se ha seleccionado proyecto Firebase ni dominio. No existe URL pública que documentar. El despliegue debe esperar a que el backend de Cloud Run y la URL de API estén disponibles y verificados.
