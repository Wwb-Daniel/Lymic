# 🚀 Instrucciones Rápidas - Configuración Inmediata

## ⚡ Pasos para Poner en Marcha

### 1️⃣ Instalar Dependencias (2 minutos)

```bash
npm install
```

Esto instalará:
- `@supabase/supabase-js` - Cliente de Supabase
- `lodash.debounce` - Para el buscador
- Todas las demás dependencias

### 2️⃣ Configurar Supabase (5 minutos)

#### A. Ejecutar SQL
1. Abre [tu proyecto en Supabase](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Copia TODO el contenido de `supabase-schema.sql`
4. Pégalo y haz clic en **RUN**

✅ Esto crea automáticamente:
- 8 tablas
- 30 categorías musicales
- Funciones de búsqueda
- Sistema de recomendaciones
- Triggers y políticas de seguridad

#### B. Crear Buckets de Storage
1. Ve a **Storage** en Supabase
2. Crea estos 4 buckets (todos públicos):

| Bucket | Público | Tamaño Max | Tipos |
|--------|---------|------------|-------|
| `song-covers` | ✅ | 5 MB | image/* |
| `song-audio` | ✅ | 50 MB | audio/* |
| `song-videos` | ✅ | 100 MB | video/* |
| `avatars` | ✅ | 2 MB | image/* |

#### C. Configurar Políticas de Storage
Para cada bucket, ve a **Policies** y ejecuta:

```sql
-- Lectura pública
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
USING (bucket_id = 'NOMBRE_DEL_BUCKET');

-- Subida para usuarios autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'NOMBRE_DEL_BUCKET' AND auth.role() = 'authenticated');

-- Actualización para el dueño
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE
USING (bucket_id = 'NOMBRE_DEL_BUCKET' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Eliminación para el dueño
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE
USING (bucket_id = 'NOMBRE_DEL_BUCKET' AND auth.uid()::text = (storage.foldername(name))[1]);
```

Reemplaza `NOMBRE_DEL_BUCKET` con: `song-covers`, `song-audio`, `song-videos`, `avatars`

### 3️⃣ Obtener Credenciales (1 minuto)

1. En Supabase, ve a **Settings** > **API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`

### 4️⃣ Crear archivo .env (30 segundos)

Crea `.env` en la raíz del proyecto:

```env
PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PUBLIC_APP_URL=http://localhost:4321
```

### 5️⃣ Iniciar el Proyecto (10 segundos)

```bash
npm run dev
```

Abre: http://localhost:4321

---

## ✨ ¡Listo! Ahora puedes:

1. **Registrarte** - Crea una cuenta nueva
2. **Subir música** - Ve a `/upload` o haz clic en "Subir Música"
3. **Buscar** - Ve a `/search` o usa el menú
4. **Explorar** - Navega por categorías y canciones

---

## 🎯 Funcionalidades Clave

### 📤 Subir Música
- Sube audio (MP3, WAV, OGG)
- Agrega portada (opcional)
- Agrega video canvas estilo Spotify (opcional)
- Selecciona categoría de 30 opciones
- Escribe la letra (opcional)

### 🔍 Buscador
- Búsqueda en tiempo real
- Filtra por 30 categorías
- Resultados con vistas y likes
- Ordenado por relevancia

### 🏠 Página Principal
- Canciones trending (más vistas)
- Canciones recientes
- Categorías para explorar
- Diseño con gradientes modernos

### 👤 Perfil
- Avatar personalizable
- Nombre de usuario
- Biografía
- Historial de música subida

---

## 🎨 Estilo Visual

Todo el proyecto usa el mismo diseño moderno:

- **Gradientes transparentes** en fondos
- **Glassmorphism** (vidrio esmerilado)
- **Bordes sutiles** blancos con opacidad
- **Sombras de color** en botones
- **Animaciones suaves** en hover

Ejemplo de clases Tailwind usadas:
```html
<div class="bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-2xl">
  <!-- Contenido con fondo gradiente transparente -->
</div>
```

---

## 🐛 Solución de Problemas

### Error: "Cannot find module @supabase/supabase-js"
```bash
npm install
```

### Error: "Missing environment variables"
- Verifica que `.env` existe
- Verifica que las variables empiezan con `PUBLIC_`
- Reinicia el servidor de desarrollo

### No aparecen canciones
- Verifica que ejecutaste `supabase-schema.sql`
- Sube tu primera canción en `/upload`

### Error al subir archivos
- Verifica que creaste los 4 buckets
- Verifica que los buckets son públicos
- Verifica que agregaste las políticas de storage

### Las categorías no aparecen
- El schema SQL las crea automáticamente
- Verifica que ejecutaste TODO el archivo SQL

---

## 📊 Datos de Prueba

El sistema viene sin datos de ejemplo. Para probarlo:

1. **Regístrate** con un email
2. **Sube 2-3 canciones** con diferentes categorías
3. **Busca** las canciones que subiste
4. **Explora** las categorías

---

## 🔐 Seguridad Implementada

✅ Row Level Security en todas las tablas
✅ Solo puedes modificar tu propio contenido
✅ Storage protegido por usuario
✅ Validación de tipos de archivo
✅ Autenticación con Supabase Auth

---

## 📱 Responsive Design

La aplicación funciona en:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1920px+)

---

## 🎵 Características Especiales

### Video Canvas (Estilo Spotify)
- Sube videos cortos (MP4, WEBM)
- Se reproducen en loop sin sonido
- Aparecen mientras suena la música
- Máximo 100MB

### Sistema de Vistas
- Se cuentan automáticamente
- Se muestran en todas las canciones
- Afectan el algoritmo de recomendaciones

### Sistema de Likes
- Los usuarios pueden dar like
- Contador en tiempo real
- Afecta trending y recomendaciones

### Algoritmo de Recomendaciones
Basado en:
1. Categorías que escuchas
2. Historial de reproducción
3. Popularidad (vistas + likes)
4. Canciones recientes

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Limpiar cache
rm -rf node_modules .astro
npm install
```

---

## 📞 ¿Necesitas Ayuda?

1. Revisa `README.md` para documentación completa
2. Revisa `SUPABASE_SETUP.md` para detalles de Supabase
3. Revisa `supabase-schema.sql` para ver la estructura de BD

---

**¡Disfruta construyendo tu plataforma musical! 🎵**
