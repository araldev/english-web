# English Visual Web

Una plataforma para aprender inglés construida **desde cero, sin frameworks**.

> No es un proyecto de React. No es un tutorial de Next.js. Es entender cómo funciona realmente una web: HTTP, autenticación, sesiones, renderizado, arquitectura limpia, y todo lo que un framework te oculta.

---

## 📌 ¿Por qué este proyecto?

Porque quería **entender realmente** cómo funciona una aplicación web. No aprender un framework que en dos años está obsoleto. Entender las bases: cómo viaja un request, cómo se valida una sesión, cómo se estructura un backend para que no duela cambiarlo.

Decisiones deliberadas:

- **Cero frameworks en frontend**. HTML, CSS, JavaScript vanilla. Módulos ES, `fetch`, DOM API.
- **Arquitectura Hexagonal** en backend. El dominio no sabe que existe Express, Prisma ni Redis.
- **Autenticación desde cero**. Nada de NextAuth, Lucia ni magic. JWT dual, OAuth2, Redis, cookies `httpOnly`.
- **Sin SPA**. Navegación tradicional con páginas HTML reales. Sin router, sin Virtual DOM, sin complejidad innecesaria.

El objetivo final: tener un portfolio que demuestre que sé **arquitectura, seguridad, y toma de decisiones técnicas** — no solo "configurar un boilerplate".

---

## 🧠 Arquitectura Hexagonal (Ports & Adapters)

El backend sigue **Screaming Architecture** — la carpeta `src/` grita lo que hace:

```
src/
  auth/
    application/     → casos de uso (use-cases)
    domain/          → entidades, value objects, puertos (interfaces)
    infrastructure/  → adapters (Prisma, Redis, JWT, Express)
  user/
    application/
    domain/
    infrastructure/
  shared/
    application/
    domain/
    infrastructure/
```

### La regla que no se negocia

El **dominio no sabe que Express, Prisma o Redis existen**. Los puertos son interfaces TypeScript; los adapters las implementan. Si mañana cambio Prisma por Drizzle, o Turso por PostgreSQL, toco **solo** `infrastructure/`.

La flecha de dependencia apunta **hacia adentro**:
```
Express → Controller → UseCase ← puerto ← adapter (Prisma/Redis)
```

---

## 🔐 Autenticación desde cero

### Registro y Login

- Email + password con **bcrypt** para hashing
- Validación del lado del servidor (nunca confíes en el cliente)
- Sesión manejada con **JWT dual**:

| Token | Duración | Almacenamiento | Propósito |
|---|---|---|---|
| `access_token` | 15 minutos | Cookie `httpOnly` | Autenticar requests |
| `refresh_token` | 7 días | Cookie `httpOnly` + **Redis** | Renovar access_token |

### Google OAuth 2.0

- Flujo completo con `google-auth-library`
- Verificación de `id_token` del lado del servidor
- Registro automático si es primera vez
- Redirect configurable por entorno (`FRONTEND_URL`)

### Rotación de Refresh Tokens (anti-robos)

Cada vez que se usa un `refresh_token`:

1. Se busca en Redis por `userId`
2. Se verifica que coincida con el almacenado
3. Se elimina el viejo (operación atómica)
4. Se emite uno **nuevo**

Si roban un token y el usuario legítimo hace refresh, el token robado ya no sirve. Si el atacante lo usa primero, el usuario legítimo queda invalidado — y ahí entra un mecanismo de detección.

### Redis no es "caché"

Redis tiene dos responsabilidades concretas:

- Almacenar refresh tokens activos con lookup por `userId`
- Rotación atómica (GET + DEL + SET en un mismo paso)

Sin Redis (o similar), **no podés revocar sesiones**. Un JWT puro es inmortal hasta que expira. Con Redis podés hacer logout, revocar, y detectar robos.

### Cookies de seguridad

Cada cookie se configura individualmente:

```
access_token:  httpOnly, sameSite: strict, secure, path: /, maxAge: 15min
refresh_token: httpOnly, sameSite: strict, secure, path: /auth, maxAge: 7d
```

El `refresh_token` solo viaja en requests a `/auth/*` — minimizando exposición.

---

## 🗄️ Base de datos: Turso + Prisma

**Turso** es SQLite distribuida, con capacidad serverless y replicación global. **Prisma** orquesta el esquema con tipado fuerte.

El patrón **Repository** asegura que el dominio hable a través de una interfaz, no directo a Prisma. Cambiar de base de datos es cambiar un adapter.

---

## ⚡ El problema de la navegación sin SPA

El frontend son páginas HTML tradicionales (`index.html`, `lessons.html`, `exercises.html`, `user_profile.html`). No hay React, ni Vue, ni router. Cada navegación es un request HTTP real.

**Problema**: recarga completa → parpadeo blanco → pérdida de estado.

**Decisiones que tomé**:

| Problema | Solución |
|---|---|
| Parpadeo al cargar CSS | Hojas compartidas en `<head>` de todas las páginas, cacheadas por el navegador |
| Scripts duplicados | Carga con `defer type="module"` — el navegador los ejecuta una sola vez |
| Pérdida de sesión al navegar | `fetch('/auth/me')` al cargar cada página, cacheado en memoria |
| Transiciones lentas | HTML base liviano, assets cacheados, sin dependencias pesadas |

No todo tiene que ser SPA. A veces la solución más honesta y enseñable es aceptar la navegación tradicional y optimizar lo que realmente duele.

---

## 🃏 Cards 3D con dos caras

CSS puro, cero JavaScript de animación:

```css
.card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.card.flipped .card-inner {
  transform: rotateY(180deg);
}
```

Cada card tiene `.card-front` y `.card-back` con `backface-visibility: hidden`. JavaScript solo agrega/remueve la clase `.flipped`. La GPU maneja el resto.

---

## 🎮 El juego: expandible por JSON

El motor del juego está separado del contenido. **Cada nivel es un archivo JSON**:

```json
{
  "level": 1,
  "instructions": "Elige la palabra correcta",
  "words": [
    { "word": "house", "translation": "casa", "hint": "un lugar para vivir" }
  ]
}
```

Agregar un nivel nuevo es:

1. Crear un archivo `.json` nuevo en la carpeta de niveles
2. Listo. No tocas HTML, CSS, ni el motor del juego.

El frontend lo lee con `fetch()`, lo parsea, y construye la UI automáticamente. Esto hace que el proyecto sea expandible por cualquier persona que sepa escribir JSON — sin necesidad de tocar código.

---

## 🧱 Problemas con los que me encontré

| Problema | Solución |
|---|---|
| CORS en desarrollo (frontend `:5500`, backend `:1234`) | Middleware CORS con lista blanca de orígenes, configurable por entorno |
| Google OAuth redirect en localhost vs producción | `FRONTEND_URL` dinámica según `NODE_ENV` o variable de entorno |
| Refresh token rotation con race conditions | Operaciones atómicas en Redis (GET + DEL en un solo paso) |
| Rutas relativas en GitHub Pages con subpath (`/english-web/`) | Todos los assets usan paths relativos (`./src/CSS/...`) |
| TypeScript módulos en monorepo | Configuración de `type: module` y path aliases en `tsconfig.json` |
| Conexión de Prisma a Turso | Provider `turso` en schema, URL de conexión con autenticación por token |
| Dos workflows de GitHub Pages compitiendo | Consolidadas en un solo workflow |

---

## 🚀 Deploy

### GitHub Pages

```yaml
# .github/workflows/deploy-gh-pages.yml
# Push a main → deploy automático a https://araldev.github.io/english-web/
```

### Desarrollo local

```bash
# Backend
cd apps/backend
cp .env.example .env   # configurar variables
docker start redis-local
npx prisma generate
npx tsx watch entry_point/api/servers/redisServer

# Frontend (servidor estático)
# Usar Live Server, python -m http.server, npx serve, etc.
```

---

## 🏗️ Lo que aprendí (y no sale en el código)

1. **Arquitectura > Framework**. Una buena estructura sobrevive a cualquier cambio de tecnología. Un framework no arregla mal diseño.
2. **JWT no es "estado en el cliente"**. Es un token que hay que validar, rotar y poder revocar. Sin Redis no podés cerrar sesión de verdad.
3. **CSS 3D no es "animación"**. Es perspectiva, `transform-style: preserve-3d`, `backface-visibility` y entender cómo el GPU renderiza capas.
4. **No necesitás SPA para buena UX**. Caché de assets, `defer` en scripts, y validación de sesión asíncrona dan una experiencia perfectamente aceptable.
5. **JSON como formato de contenido** separa datos de presentación de forma limpia. Cero acoplamiento entre contenido y código.

---

## 👀 Para recruiters

Este proyecto demuestra que sé:

- **Arquitectura limpia** (Hexagonal, Screaming Architecture) en un proyecto real con TypeScript
- **Autenticación y seguridad** desde cero — JWT dual, OAuth2, Redis, rotación de tokens, cookies seguras
- **Bases de datos** — Turso (SQLite distribuida), Prisma, Redis como almacenamiento de sesiones
- **Frontend vanilla** sin frameworks — CSS avanzado (3D transforms, animaciones), módulos ES, fetch, DOM API
- **DevOps** — GitHub Actions, deploy a GitHub Pages, Docker
- **Toma de decisiones técnicas** con tradeoffs explícitos — SPA vs MPA, frameworks vs vanilla, arquitectura hexagonal vs controladores planos

No es un tutorial. Es un proyecto real donde cada decisión está justificada.

---

## 📸 Screenshots

### 🎮 Juego
![screenshot-web-game](https://github.com/user-attachments/assets/19e69bab-6edc-4841-8463-45be9d84fc7d)

### 📚 Lecciones
![screenshot-web-home](https://github.com/user-attachments/assets/25186e2f-6660-4788-a1db-35d0c397af4f)

### 📚 Lecciones
![screenshot-web-lessons](https://github.com/user-attachments/assets/b29bfbfc-89e5-4173-b1d4-3be04143f9bf)

### 🏠 Home
![screenshot-web-lessons2](https://github.com/user-attachments/assets/267ce255-5df6-4597-a86f-42289917dbb9)

---

## 📄 Licencia

MIT
