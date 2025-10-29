# 🎵 Lymic - Plataforma Musical Moderna

Una aplicación web de streaming de música con funcionalidades avanzadas, inspirada en Spotify y construida desde cero con Astro, React, Supabase y TailwindCSS.

**Creado por: Victor De Jesus**

## ✨ Características Principales

### 🎨 Diseño Moderno
- **Interfaz con gradientes transparentes** en todos los componentes
- **Animaciones fluidas** y transiciones suaves
- **Diseño responsivo** adaptado a todos los dispositivos
- **Tema oscuro** con efectos de glassmorphism

### 🔐 Sistema de Autenticación
- Registro e inicio de sesión con email
- Perfiles de usuario personalizables
- Gestión de sesiones con Supabase Auth
- Protección de rutas y contenido

### 🎵 Gestión de Música
- **Subida de canciones** con audio, portada y video canvas
- **Videos cortos estilo Spotify Canvas** que se reproducen en loop
- **30 categorías musicales** (Pop, Rock, Hip-Hop, Reggaeton, etc.)
- **Metadata completa**: título, artista, álbum, letra, duración

### 🔍 Búsqueda Avanzada
- **Búsqueda en tiempo real** con debounce
- **Filtrado por categorías**
- **Búsqueda full-text** en título, artista y álbum
- **Resultados ordenados** por relevancia y popularidad

### 📊 Sistema de Recomendaciones
- **Algoritmo inteligente** basado en:
  - Historial de reproducción del usuario
  - Categorías favoritas
  - Popularidad (vistas y likes)
- **Canciones trending** y recién agregadas
- **Vistas y likes** con contadores en tiempo real

### 🎼 Reproductor de Música
- Reproducción continua
- Control de volumen
- Barra de progreso
- Cola de reproducción

## 🛠️ Tecnologías Utilizadas

- **[Astro](https://astro.build/)** - Framework web moderno
- **[React](https://react.dev/)** - Componentes interactivos
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage (audio, imágenes, videos)
  - Row Level Security
- **[TailwindCSS](https://tailwindcss.com/)** - Estilos utility-first
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Wwb-Daniel/Lymic.git
cd Lymic
```

### 2. Instalar dependencias

```bash
npm install
# o
bun install
```

### 3. Configurar Supabase

#### a) Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se inicialice (2-3 minutos)

#### b) Ejecutar el schema SQL
1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Abre el archivo `supabase-schema.sql`
3. Copia todo el contenido y pégalo en el editor
4. Haz clic en **Run** para ejecutar

Esto creará:
- ✅ 8 tablas principales
- ✅ 30 categorías musicales
- ✅ Funciones de búsqueda y recomendaciones
- ✅ Triggers automáticos
- ✅ Row Level Security
- ✅ Índices optimizados

#### c) Configurar Storage Buckets

Sigue las instrucciones detalladas en `SUPABASE_SETUP.md` para crear:
- `song-covers` - Portadas de canciones (5MB)
- `song-audio` - Archivos de audio (50MB)
- `song-videos` - Videos canvas (100MB)
- `avatars` - Fotos de perfil (2MB)

#### d) Obtener credenciales

1. Ve a **Settings** > **API**
2. Copia:
   - `Project URL`
   - `anon/public key`

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PUBLIC_APP_URL=http://localhost:4321
```

### 5. Ejecutar el proyecto

```bash
npm run dev
# o
bun run dev
```

Visita `http://localhost:4321` en tu navegador.

## 📁 Estructura del Proyecto

```
Lymic/
├── src/
│   ├── components/          # Componentes React y Astro
│   │   ├── AuthModal.tsx    # Modal de login/registro
│   │   ├── UserMenu.tsx     # Menú de usuario
│   │   ├── UploadForm.tsx   # Formulario de subida
│   │   ├── SearchComponent.tsx  # Buscador
│   │   └── HomeContent.tsx  # Contenido principal
│   ├── layouts/
│   │   └── Layout.astro     # Layout principal
│   ├── pages/
│   │   ├── index.astro      # Página de inicio
│   │   ├── search.astro     # Página de búsqueda
│   │   └── upload.astro     # Página de subida
│   ├── lib/
│   │   ├── supabase.ts      # Cliente de Supabase
│   │   └── data.ts          # Tipos y datos
│   └── store/
│       ├── authStore.ts     # Estado de autenticación
│       └── playerStore.ts   # Estado del reproductor
├── supabase-schema.sql      # Schema completo de la BD
├── SUPABASE_SETUP.md        # Guía de configuración
└── .env.example             # Ejemplo de variables de entorno
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticación
- [x] Registro de usuarios
- [x] Inicio de sesión
- [x] Cierre de sesión
- [x] Perfiles automáticos
- [x] Menú de usuario

### ✅ Subida de Música
- [x] Formulario con gradiente transparente
- [x] Upload de audio (MP3, WAV, OGG)
- [x] Upload de portada (JPG, PNG, WEBP)
- [x] Upload de video canvas (MP4, WEBM)
- [x] Selección de categoría
- [x] Letra de la canción
- [x] Detección automática de duración

### ✅ Búsqueda
- [x] Búsqueda en tiempo real
- [x] Filtro por categorías
- [x] Resultados con vistas y likes
- [x] Grid de categorías
- [x] Búsqueda full-text optimizada

### ✅ Página Principal
- [x] Canciones trending
- [x] Canciones recientes
- [x] Categorías destacadas
- [x] Diseño con gradientes
- [x] Estado vacío elegante

### ✅ Base de Datos
- [x] 8 tablas relacionadas
- [x] 30 categorías musicales
- [x] Sistema de vistas
- [x] Sistema de likes
- [x] Historial de reproducción
- [x] Row Level Security
- [x] Funciones de búsqueda
- [x] Algoritmo de recomendaciones

## 🎨 Diseño y Estilo

Todos los componentes nuevos siguen el mismo estilo moderno:

- **Fondos con gradientes transparentes**: `from-purple-500/20 via-pink-500/20 to-blue-500/20`
- **Glassmorphism**: `backdrop-blur-md` con `bg-zinc-900/90`
- **Bordes sutiles**: `border border-white/10`
- **Sombras con color**: `shadow-lg shadow-green-500/25`
- **Transiciones suaves**: `transition-all duration-300`
- **Hover effects**: Escalado y cambios de opacidad

## 🔒 Seguridad

- ✅ Row Level Security en todas las tablas
- ✅ Usuarios solo pueden modificar su contenido
- ✅ Validación de tipos MIME en uploads
- ✅ Políticas de storage por usuario
- ✅ Protección contra SQL injection
- ✅ Variables de entorno seguras

## 📊 Base de Datos

### Tablas Principales

1. **profiles** - Perfiles de usuario
2. **categories** - 30 categorías musicales
3. **songs** - Canciones con metadata completa
4. **playlists** - Playlists de usuarios
5. **playlist_songs** - Relación playlist-canción
6. **song_views** - Registro de vistas
7. **song_likes** - Sistema de likes
8. **user_history** - Historial de reproducción

### Funciones SQL

- `search_songs(query)` - Búsqueda avanzada con relevancia
- `get_recommended_songs(user_id, limit)` - Recomendaciones personalizadas
- `increment_song_views()` - Incrementa vistas automáticamente
- `update_song_likes_count()` - Actualiza contador de likes

## 🚀 Próximos Pasos

Para continuar con el desarrollo:

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar Supabase setup**:
   - Sigue `SUPABASE_SETUP.md`
   - Ejecuta `supabase-schema.sql`
   - Crea los buckets de storage

3. **Configurar `.env`** con tus credenciales

4. **Iniciar desarrollo**:
   ```bash
   npm run dev
   ```

5. **Probar funcionalidades**:
   - Registrarse
   - Subir una canción
   - Buscar música
   - Explorar categorías

## 📝 Notas Importantes

- Los errores de TypeScript sobre `@supabase/supabase-js` y `lodash.debounce` se resolverán al instalar las dependencias
- Asegúrate de crear los 4 buckets de storage en Supabase
- Las políticas de storage son cruciales para el funcionamiento correcto
- El schema SQL debe ejecutarse completo para que todo funcione

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 👨‍💻 Autor

**Victor De Jesus**
- GitHub: [@Wwb-Daniel](https://github.com/Wwb-Daniel)
- Proyecto: Lymic - Plataforma de música inspirada en Spotify

---

**Hecho con ❤️ usando Astro, React y Supabase**
