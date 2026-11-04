# Guía de Publicación y Base de Datos Gratuita — SOMOS Jujuy

Esta guía explica por qué Google AI Studio solicita **"Confirm Google Cloud Project"** y cómo desplegar la plataforma **100% GRATIS** con base de datos **PostgreSQL / SQL**.

---

## 1. ¿Por qué aparece "Confirm Google Cloud Project" en AI Studio?

Cuando presionas el botón **"Publicar"** (Publish) dentro de Google AI Studio, la plataforma intenta desplegar automáticamente un contenedor en **Google Cloud Run**.

- Para ello, Google requiere que selecciones un **Proyecto de Google Cloud Platform (GCP)** vinculado a tu cuenta de Google.
- Aunque Google Cloud Run incluye una **cuota gratuita mensual de 2 millones de peticiones**, Google solicita asociar una cuenta de facturación a tu proyecto en [console.cloud.google.com](https://console.cloud.google.com).
- Si no deseas crear un proyecto en Google Cloud ni asociar una tarjeta, **puedes desplegar la página 100% GRATIS usando el repositorio de GitHub que ya tenemos configurado**.

---

## 2. Opción Recomendada: Despliegue 100% GRATIS en Render.com (Con PostgreSQL incluido)

El código ya está sincronizado con tu repositorio en GitHub:
👉 **[https://github.com/jujuycasaesquinalibertad/pagina-de-somos](https://github.com/jujuycasaesquinalibertad/pagina-de-somos)**

### Pasos rápidos (menos de 3 minutos):

1. **Ingresa a [Render.com](https://render.com/)** y haz clic en **Sign Up / Log In** con tu cuenta de **GitHub** (`jujuycasaesquinalibertad`).
2. Haz clic en el botón **"New +"** y selecciona **"Web Service"**.
3. Selecciona tu repositorio: `pagina-de-somos`.
4. Completa la configuración básica:
   - **Name**: `somos-jujuy`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free` ($0/mes)
5. Haz clic en **"Create Web Service"**.
6. ¡Listo! Render te dará una URL pública gratuita con HTTPS (por ejemplo `https://somos-jujuy.onrender.com`).

### Para agregar PostgreSQL gratis en Render:
1. En Render, haz clic en **"New +"** -> **"PostgreSQL"**.
2. Dale un nombre (ej. `somos-db`), selecciona el plan **Free**, y haz clic en **"Create Database"**.
3. Copia el **"Internal Database URL"** (o "External Database URL").
4. En tu Web Service `somos-jujuy`, ve a la pestaña **"Environment"** y agrega:
   - Clave: `DATABASE_URL`
   - Valor: *(pega la URL de PostgreSQL copiada)*
5. El servidor detectará automáticamente PostgreSQL, creará la tabla `afiliados` y la secuencia numérica única oficial (`SOMOS-JUJ-0101`, etc.).

---

## 3. Opción Alternativa: Vercel + Supabase / Neon (100% Gratis)

Si prefieres usar **Vercel** o **Neon**:
1. Crea una base de datos PostgreSQL gratuita en **[Neon.tech](https://neon.tech)** o **[Supabase.com](https://supabase.com)** (ambas son 100% gratuitas, sin tarjeta requerida).
2. Obtienes tu cadena de conexión `postgres://...`.
3. Despliegas en **Vercel** o **Render** vinculando tu GitHub `pagina-de-somos` y configurando la variable `DATABASE_URL`.

---

## 4. Si decides usar Google Cloud (Publish de AI Studio)

Si prefieres usar el botón "Publish" de AI Studio:
1. Entra a [console.cloud.google.com](https://console.cloud.google.com).
2. Crea un proyecto (por ejemplo `somos-jujuy-oficial`).
3. En AI Studio, cuando te pregunte *"Confirm Google Cloud Project"*, escribe o selecciona ese ID de proyecto.
4. AI Studio publicará la web en Cloud Run.

---

## 5. Arquitectura del Servidor actual (`server.ts`)

Tu aplicación está preparada para operar en **modo dual inteligente**:
- **Con PostgreSQL**: Si configuras `DATABASE_URL`, usa consultas SQL transaccionales y secuencias atómicas en PostgreSQL.
- **Sin PostgreSQL**: Si no configuras ninguna base de datos externa, usa el almacenamiento local persistente en `data/afiliaciones.json`, garantizando que la emisión de credenciales oficiales nunca se detenga.
