# 🎟️ Rifa 2026

Página web premium para una rifa de 200 números. Construida con **Next.js 15**, **Supabase**, **Tailwind CSS** y **Framer Motion**.

---

## Stack

| Tecnología       | Uso                              |
|------------------|----------------------------------|
| Next.js 15       | Framework (App Router)           |
| TypeScript       | Tipado estático                  |
| Tailwind CSS v3  | Estilos                          |
| Framer Motion    | Animaciones                      |
| Supabase         | Base de datos (PostgreSQL)       |
| Telegram Bot API | Notificaciones al organizador    |
| Vercel           | Hosting + Cron jobs              |

---

## Características

- ✅ Grid de 200 números con estados en tiempo real
- ✅ Reserva temporal de 10 minutos (anti race-condition con función atómica en PostgreSQL)
- ✅ Pagos por transferencia o efectivo (confirmación manual)
- ✅ Notificaciones instantáneas por Telegram
- ✅ Panel admin protegido con contraseña
- ✅ Cleanup automático de reservas expiradas cada 5 minutos (Vercel Cron)
- ✅ Diseño mobile-first premium
- ✅ SEO + Open Graph

---

## Instalación

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/Gutixd/rifa-viaje-web
cd rifa-viaje-web
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el archivo:
   ```
   supabase/migrations/001_initial.sql
   ```
3. Esto creará todas las tablas, índices, triggers y la función atómica `create_reservation`.

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local` y rellena:

```bash
cp .env.example .env.local
```

Variables requeridas:

```env
# Supabase (en Settings > API de tu proyecto)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Admin
ADMIN_PASSWORD=elige-una-contraseña-segura
ADMIN_SESSION_SECRET=string-aleatorio-de-al-menos-32-chars

# Telegram
TELEGRAM_BOT_TOKEN=123456789:AAxxxx
TELEGRAM_CHAT_ID=-100xxxxxxxxxx

# URL de tu sitio
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app

# Cron (Vercel genera uno automáticamente o puedes definirlo)
CRON_SECRET=otro-string-aleatorio
```

#### Cómo obtener el Telegram Bot Token y Chat ID

1. Busca `@BotFather` en Telegram → crea un bot → guarda el token
2. Busca `@userinfobot` en Telegram para obtener tu Chat ID personal
3. O añade el bot a un grupo y usa `/getUpdates` para obtener el group Chat ID

### 4. Personalizar la rifa

Edita **`src/config/raffle.ts`** para:
- Cambiar nombre y descripción
- Agregar los premios reales
- Poner los datos de transferencia bancaria
- Actualizar contacto y redes sociales

### 5. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)  
Panel admin: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Desplegar en Vercel

### Opción A — Deploy automático (recomendado)

1. Sube el proyecto a GitHub
2. Importa el repo en [vercel.com](https://vercel.com)
3. Agrega todas las variables de entorno en **Settings > Environment Variables**
4. Vercel detecta Next.js automáticamente → despliega

### Opción B — Vercel CLI

```bash
npm install -g vercel
vercel
```

### Cron job (limpieza automática)

El archivo `vercel.json` configura un cron cada 5 minutos que llama `/api/cleanup` para liberar reservas expiradas. Esto requiere plan Pro de Vercel. En plan gratuito, la limpieza ocurre igual cada vez que alguien carga la página de números.

---

## Flujo de la rifa

```
Usuario selecciona números
       ↓
Completa formulario + elige pago
       ↓
POST /api/reserve (función atómica en PostgreSQL)
       ↓
Números marcados como "reserved" (10 min)
       ↓
Notificación Telegram al organizador
       ↓
Organizador revisa /admin
       ↓
Confirmar → números pasan a "sold"
Rechazar → números vuelven a "available"
       ↓
Si no se confirma en 10 min → limpieza automática → "available"
```

---

## Panel Admin

Accede en `/admin` con la contraseña configurada en `ADMIN_PASSWORD`.

**Funciones:**
- 📊 Dashboard con estadísticas en tiempo real
- ✅ Confirmar pagos con un clic
- ❌ Rechazar y liberar números
- 🔍 Filtrar por estado (pendiente, transferencia, efectivo, confirmado, etc.)
- 📱 Ver datos completos del comprador
- 🔄 Auto-refresh cada 60 segundos

---

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── api/
│   │   ├── numbers/          # GET números con estados
│   │   ├── reserve/          # POST crear reserva
│   │   ├── cleanup/          # GET/POST limpiar expiradas
│   │   └── admin/
│   │       ├── login/        # POST login admin
│   │       ├── logout/       # POST logout
│   │       ├── reservations/ # GET lista de reservas
│   │       ├── confirm/      # POST confirmar pago
│   │       └── reject/       # POST rechazar pago
│   └── admin/
│       ├── page.tsx          # Dashboard admin
│       └── login/page.tsx    # Login admin
├── components/
│   ├── raffle/               # Componentes del sitio público
│   └── admin/                # Componentes del panel admin
├── config/
│   └── raffle.ts             # ⭐ CONFIGURACIÓN PRINCIPAL
├── lib/
│   ├── supabase/             # Clientes Supabase
│   ├── telegram.ts           # Notificaciones
│   ├── cleanup.ts            # Limpieza de reservas
│   └── utils.ts              # Utilidades
└── types/
    └── index.ts              # Tipos TypeScript
```

---

## Seguridad

- Función atómica PostgreSQL con `FOR UPDATE` evita que dos usuarios reserven el mismo número simultáneamente
- Panel admin protegido por cookie httpOnly + middleware Next.js
- Service Role Key de Supabase nunca se expone al cliente
- Validación de inputs en todas las API routes
- Variables de entorno para todos los secretos

---

## Licencia

Proyecto privado — uso exclusivo del organizador.
