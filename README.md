# Top3

Top3 es una aplicación web desarrollada con Node.js, Express, EJS y SQLite. Permite a los usuarios registrarse, iniciar sesión, crear temas con su “top 3” y responder a publicaciones de otros usuarios. Además, incorpora medidas de seguridad como autenticación segura, control de acceso por rol, protección CSRF, validación de entrada, consultas parametrizadas, cabeceras HTTP seguras y una política básica de privacidad.

## Descripción del proyecto

El objetivo de Top3 es ofrecer un foro temático sencillo en el que cada publicación consiste en un ranking de tres elementos y cada respuesta aporta otro ranking sobre el mismo tema. La aplicación ha sido desarrollada como proyecto final de la asignatura **Diseño y Desarrollo Web Seguro**, con especial atención a la integración de medidas reales de seguridad en una aplicación funcional.

## Tecnologías utilizadas

- Node.js
- Express
- EJS
- SQLite
- Docker
- Docker Compose
- Helmet
- bcrypt
- express-session
- Zod

## Requisitos previos

### Opción recomendada: ejecución con Docker

Para ejecutar el proyecto de la forma prevista, es necesario tener instalado:

- Docker
- Docker Compose

### Opción alternativa: ejecución local sin Docker

Si se desea ejecutar el proyecto sin contenedores, hace falta:

- Node.js 20 o superior
- npm

## Estructura básica del proyecto

```text
Top3/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── .env.example
└── src/
    ├── app.js
    ├── db.js
    ├── init-db.js
    ├── validators.js
    ├── middleware/
    ├── routes/
    ├── views/
    ├── public/
    └── data/
```

## Instalación y puesta en marcha

### Opción 1: ejecución con Docker Compose

1. Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd Top3
```

2. Crear el archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
copy .env.example .env
```

3. Editar el archivo `.env` con los valores necesarios.

4. Construir y levantar la aplicación:

```bash
docker compose up --build
```

5. Abrir en el navegador:

```text
http://localhost:3000
```

La aplicación queda expuesta en el puerto `3000` y la base de datos se persiste en `./src/data` mediante el volumen configurado en `docker-compose.yml`.

### Detener la aplicación

```bash
docker compose down
```

## Variables de entorno

El proyecto necesita un archivo `.env` en la raíz. Se incluye un archivo `.env.example` como plantilla.

Ejemplo:

```env
PORT=3000
SESSION_SECRET=your-session-secret-here
NODE_ENV=development

ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-admin-password
```

### Explicación de variables

- `PORT`: puerto en el que se ejecuta la aplicación.
- `SESSION_SECRET`: clave secreta usada para firmar las sesiones.
- `NODE_ENV`: entorno de ejecución (`development` o `production`).
- `ADMIN_USERNAME`: nombre de usuario de la cuenta administradora inicial.
- `ADMIN_EMAIL`: correo de la cuenta administradora inicial.
- `ADMIN_PASSWORD`: contraseña de la cuenta administradora inicial.

## Inicialización de la base de datos

La base de datos se inicializa mediante el script:

```bash
npm run init-db
```

Este script crea las tablas necesarias y genera la cuenta administradora inicial a partir de las variables de entorno definidas en `.env`.

## Ejecución en desarrollo

Si se desea ejecutar el proyecto sin Docker:

1. Instalar dependencias:

```bash
npm install
```

2. Crear el archivo `.env` a partir de `.env.example`.

3. Inicializar la base de datos:

```bash
npm run init-db
```

4. Ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
```

5. Abrir en el navegador:

```text
http://localhost:3000
```

## Ejecución en producción

En este proyecto, la forma principal de ejecución en producción o entrega es mediante Docker Compose:

```bash
docker compose up --build -d
```

Si se desea ejecutar sin Docker en un entorno equivalente:

```bash
npm install
npm run init-db
npm start
```

## Credenciales de prueba

La aplicación crea automáticamente una cuenta administradora inicial a partir de las variables definidas en `.env`.

Por tanto, las credenciales de prueba son:

- **Email:** admin@top3.local
- **Contraseña:** AdminTop3!2026

Estas credenciales permiten iniciar sesión y acceder también al panel de administración.

## Scripts disponibles

```bash
npm start
npm run dev
npm run init-db
```

