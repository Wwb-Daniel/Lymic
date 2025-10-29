# 🎵 Configuración de Supabase - Spotify Clone

## 📋 Pasos de Configuración

### 1. Ejecutar el Schema SQL

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega todo el contenido de `supabase-schema.sql`
5. Ejecuta el script (Run)

### 2. Configurar Storage Buckets

Ve a **Storage** en el panel de Supabase y crea los siguientes buckets:

#### 📸 Bucket: `song-covers`
```
Nombre: song-covers
Público: ✅ Sí
Tamaño máximo: 5 MB
MIME types permitidos: image/jpeg, image/png, image/webp, image/gif
```

**Políticas de Storage:**
```sql
-- Permitir lectura pública
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
USING (bucket_id = 'song-covers');

-- Permitir subida a usuarios autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'song-covers' AND auth.role() = 'authenticated');

-- Permitir actualización al dueño
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE
USING (bucket_id = 'song-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir eliminación al dueño
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE
USING (bucket_id = 'song-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### 🎵 Bucket: `song-audio`
```
Nombre: song-audio
Público: ✅ Sí
Tamaño máximo: 50 MB
MIME types permitidos: audio/mpeg, audio/wav, audio/ogg, audio/mp4, audio/aac
```

**Políticas de Storage:**
```sql
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
USING (bucket_id = 'song-audio');

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'song-audio' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE
USING (bucket_id = 'song-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE
USING (bucket_id = 'song-audio' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### 🎬 Bucket: `song-videos`
```
Nombre: song-videos
Público: ✅ Sí
Tamaño máximo: 100 MB
MIME types permitidos: video/mp4, video/webm, video/quicktime
```

**Políticas de Storage:**
```sql
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
USING (bucket_id = 'song-videos');

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'song-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE
USING (bucket_id = 'song-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE
USING (bucket_id = 'song-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### 👤 Bucket: `avatars`
```
Nombre: avatars
Público: ✅ Sí
Tamaño máximo: 2 MB
MIME types permitidos: image/jpeg, image/png, image/webp
```

**Políticas de Storage:**
```sql
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Configurar Autenticación

1. Ve a **Authentication** > **Providers**
2. Habilita **Email** (ya está habilitado por defecto)
3. Opcional: Habilita otros providers (Google, GitHub, etc.)

**Configuración de Email:**
- ✅ Enable Email provider
- ✅ Confirm email (recomendado para producción)
- ✅ Enable email confirmations

### 4. Obtener las Credenciales

1. Ve a **Settings** > **API**
2. Copia los siguientes valores:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (¡NO EXPONGAS ESTA CLAVE!)
```

### 5. Crear archivo .env

Crea un archivo `.env` en la raíz del proyecto con:

```env
PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

- **profiles** - Perfiles de usuario extendidos
- **categories** - 30 categorías musicales (Pop, Rock, Hip-Hop, etc.)
- **playlists** - Playlists/Álbumes creados por usuarios
- **songs** - Canciones con audio, portada y video opcional
- **playlist_songs** - Relación entre playlists y canciones
- **song_views** - Registro de vistas para analytics
- **song_likes** - Sistema de likes
- **user_history** - Historial de reproducción

### Características Implementadas

✅ **Autenticación completa** con perfiles automáticos
✅ **30 categorías musicales** estilo Spotify
✅ **Sistema de vistas** para tracking
✅ **Sistema de likes** con contadores automáticos
✅ **Historial de reproducción** por usuario
✅ **Búsqueda full-text** en español (título, artista, álbum)
✅ **Recomendaciones personalizadas** basadas en historial
✅ **Row Level Security (RLS)** para seguridad
✅ **Índices optimizados** para búsquedas rápidas
✅ **Triggers automáticos** para contadores
✅ **Vistas materializadas** para queries complejas

### Funciones Especiales

- `search_songs(query)` - Búsqueda avanzada con relevancia
- `get_recommended_songs(user_id, limit)` - Recomendaciones personalizadas
- `increment_song_views()` - Incrementa vistas automáticamente
- `update_song_likes_count()` - Actualiza contador de likes

## 🎨 Características del Sistema

### Videos Cortos (Canvas)
Las canciones pueden tener un `video_url` que se reproduce en loop sin sonido mientras suena la música (como Spotify Canvas).

### Sistema de Recomendaciones
El algoritmo considera:
- Categorías que el usuario ha escuchado
- Número de vistas de la canción
- Número de likes
- Historial de reproducción

### Búsqueda Inteligente
- Búsqueda full-text en español
- Ranking por relevancia
- Búsqueda en título, artista y álbum
- Resultados ordenados por popularidad

## 📊 Queries Útiles

### Obtener canciones trending
```sql
SELECT * FROM trending_songs LIMIT 10;
```

### Buscar canciones
```sql
SELECT * FROM search_songs('reggaeton');
```

### Obtener recomendaciones
```sql
SELECT * FROM get_recommended_songs('user-uuid-here', 20);
```

### Canciones más populares por categoría
```sql
SELECT s.*, c.name as category
FROM songs s
JOIN categories c ON s.category_id = c.id
WHERE c.slug = 'pop'
ORDER BY s.views DESC
LIMIT 10;
```

## 🔒 Seguridad

- ✅ Row Level Security habilitado en todas las tablas
- ✅ Usuarios solo pueden modificar su propio contenido
- ✅ Playlists privadas solo visibles para el dueño
- ✅ Storage con políticas de acceso por usuario
- ✅ Validación de tipos MIME en uploads

## 🚀 Próximos Pasos

1. ✅ Ejecutar `supabase-schema.sql`
2. ✅ Crear los 4 buckets de storage
3. ✅ Configurar las políticas de storage
4. ✅ Obtener credenciales y crear `.env`
5. ⏳ Instalar dependencias del cliente Supabase
6. ⏳ Implementar el frontend

---

**¿Listo para continuar?** Pásame tus credenciales de Supabase y continuaré con la implementación del frontend.
