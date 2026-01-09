# Guía de Despliegue Simplificada (Hostinger / cPanel)

Este paquete utiliza una estrategia "Monolítica": el Backend (Node.js) se encarga de servir también el Frontend. **Esto simplifica enormemente la subida y evita problemas de CORS y puertos.**

## Contenido del Paquete

1.  `sigemed-app/`: Carpeta principal que contiene todo (Backend + Frontend integrado).
2.  `clean_database.sql`: Script para limpieza inicial.

---

## Paso 1: Subir Archivos

1.  Vaya al **Administrador de Archivos** de Hostinger.
2.  Navegue a la carpeta donde desea instalar la aplicación (ej. `public_html` si es el sitio principal, o cree una subcarpeta `api` si usará un subdominio).
    *   *Nota: Si usa Hostinger Cloud/Shared, usualmente debe usar la herramienta "Setup Node.js App" primero para crear la carpeta.*
3.  Suba y descomprima el contenido de `sigemed-app` en esa carpeta.

## Paso 2: Configurar Base de Datos

1.  Abra el archivo `.env` dentro de la carpeta subida.
2.  Modifique las siguientes líneas con la información real de su base de datos Hostinger:
    ```env
    DB_HOST=localhost       <-- Usualmente 'localhost' si la APP y BD están en el mismo hosting
    DB_USER=u626910173_admin_sigemed
    DB_PASSWORD=SuPasswordReal
    DB_NAME=u626910173_sigemed_db
    ```

## Paso 3: Activar Node.js (Panel Gráfico)

Este paso es necesario porque Node.js necesita estar "encendido" para funcionar (a diferencia de PHP).

1.  En su Panel de Hosting (hPanel o cPanel), busque la sección **"Advanced"** o **"Avanzado"** y haga clic en **"Setup Node.js App"** (o "Aplicaciones Node.js").
2.  Haga clic en **"Create New App"** (Crear Nueva App).
3.  Llene el formulario con estos datos:
    *   **Node.js Version**: Seleccione **18** o superior (recomendado 20).
    *   **Application Mode**: Seleccione **Production**.
    *   **Application Root**: Escriba la carpeta donde subió los archivos (ej. `public_html` si lo puso en la raíz, o `sigemed-app` si subió la carpeta entera).
    *   **Application URL**: Seleccione su dominio (ej. `sigemed.com`).
    *   **Application Startup File**: Escriba `server.js` (¡Muy Importante!).
4.  Haga clic en el botón **"CREATE"**.
5.  **Instalar Librerías**:
    *   Una vez creada la app, la página se recargará.
    *   Busque un botón que dice **"Run NPM Install"** (Detectará el archivo `package.json`).
    *   Haga clic y espere a que termine (puede tardar unos segundos).
6.  Finalmente, haga clic en el botón **"RESTART"**.

**¿Cómo saber si funcionó?**
Entre a su sitio web (`sigemed.com`). Debería ver la pantalla de inicio de sesión de SiGEMed.

## Paso 4: ¡Listo!

Acceda a su dominio (o subdominio).
*   La página web cargará automáticamente.
*   La API funcionará internamente sin que usted tenga que configurar puertos manuales.

---
**Nota para Base de Datos Remota:**
Si su base de datos NO está en el mismo servidor que la aplicación Node.js, cambie `DB_HOST=localhost` por la IP de su base de datos (`217.21.76.201`).
