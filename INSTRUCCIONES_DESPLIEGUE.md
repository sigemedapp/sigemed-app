# Guía de Despliegue en Hostinger (Solo Frontend)

Esta guía es para desplegar la página web en Hostinger, conectada al Backend en Render.

## Contenido del Paquete

1.  `dist/`: Carpeta con los archivos de la página web (optimizados y listos).
2.  `INSTRUCCIONES_DESPLIEGUE.md`: Este archivo.

---

## Paso Único: Subir Archivos a Hostinger

1.  Vaya al **Administrador de Archivos** de Hostinger.
2.  Entre a la carpeta **`public_html`**.
3.  **Borre** cualquier archivo que haya ahí actualmente (index.php, default.php, etc.) para evitar conflictos.
4.  Suba **el contenido** de la carpeta `dist` que está en este ZIP.
    *   *Nota: No suba la carpeta `dist` en sí, sino los archivos que están DENTRO de ella (`index.html`, carpeta `assets`, etc.).*
5.  Los archivos deberían quedar directamente en `public_html/index.html`, `public_html/assets/...`.

## ¡Listo!

Acceda a su dominio (ej. `sigemed.com`).
*   La página cargará inmediatamente.
*   Se conectará automáticamente a su servidor en Render (`https://sigemed-backend.onrender.com`).

---
**Nota Importante:**
Como el Backend está en Render (servicio gratuito/básico), es posible que la primera vez que intente iniciar sesión tarde unos 30-60 segundos en responder ("Despertando" al servidor). Esto es normal en el plan gratuito de Render.
