# ✅ Checklist de Configuración

Sigue estos pasos en orden para poner en marcha tu Spotify Clone:

## 📦 Paso 1: Instalación
```bash
npm install
```
- [ ] Ejecutado sin errores
- [ ] Se instalaron todas las dependencias
- [ ] Aparece la carpeta `node_modules`

---

## 🗄️ Paso 2: Configurar Supabase

### 2.1 Crear Proyecto
- [ ] Cuenta creada en [supabase.com](https://supabase.com)
- [ ] Proyecto nuevo creado
- [ ] Proyecto inicializado (espera 2-3 minutos)

### 2.2 Ejecutar SQL
- [ ] Abierto SQL Editor en Supabase
- [ ] Copiado TODO el contenido de `supabase-schema.sql`
- [ ] Ejecutado con éxito (botón RUN)
- [ ] Mensaje de éxito: "Schema creado exitosamente!"

### 2.3 Verificar Tablas
Ve a **Table Editor** y verifica que existen:
- [ ] `profiles`
- [ ] `categories` (con 30 registros)
- [ ] `songs`
- [ ] `playlists`
- [ ] `playlist_songs`
- [ ] `song_views`
- [ ] `song_likes`
- [ ] `user_history`

### 2.4 Crear Buckets de Storage
Ve a **Storage** y crea estos buckets (todos públicos):
- [ ] `song-covers` (5MB, image/*)
- [ ] `song-audio` (50MB, audio/*)
- [ ] `song-videos` (100MB, video/*)
- [ ] `avatars` (2MB, image/*)

### 2.5 Configurar Políticas de Storage
Para CADA bucket, ejecuta las 4 políticas en **SQL Editor**:
- [ ] Políticas para `song-covers`
- [ ] Políticas para `song-audio`
- [ ] Políticas para `song-videos`
- [ ] Políticas para `avatars`

(Ver `SUPABASE_SETUP.md` para el SQL exacto)

---

## 🔑 Paso 3: Variables de Entorno

### 3.1 Obtener Credenciales
- [ ] Abierto Settings > API en Supabase
- [ ] Copiado Project URL
- [ ] Copiado anon public key

### 3.2 Crear .env
- [ ] Creado archivo `.env` en la raíz
- [ ] Agregado `PUBLIC_SUPABASE_URL`
- [ ] Agregado `PUBLIC_SUPABASE_ANON_KEY`
- [ ] Agregado `PUBLIC_APP_URL=http://localhost:4321`

Ejemplo:
```env
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
PUBLIC_APP_URL=http://localhost:4321
```

---

## 🚀 Paso 4: Iniciar Proyecto

```bash
npm run dev
```

- [ ] Servidor iniciado sin errores
- [ ] Abierto http://localhost:4321
- [ ] La página carga correctamente
- [ ] No hay errores en la consola del navegador

---

## 🧪 Paso 5: Probar Funcionalidades

### 5.1 Autenticación
- [ ] Click en "Iniciar Sesión"
- [ ] Cambiar a "Regístrate"
- [ ] Crear cuenta con email y contraseña
- [ ] Registro exitoso
- [ ] Aparece tu usuario en el menú

### 5.2 Subir Música
- [ ] Click en "Subir Música" (menú lateral o `/upload`)
- [ ] Completar formulario:
  - [ ] Título de la canción
  - [ ] Nombre del artista
  - [ ] Álbum (opcional)
  - [ ] Categoría
  - [ ] Archivo de audio
  - [ ] Portada (opcional)
  - [ ] Video canvas (opcional)
- [ ] Click en "Publicar Música"
- [ ] Mensaje de éxito
- [ ] Archivos subidos a Supabase Storage

### 5.3 Buscar
- [ ] Ir a `/search`
- [ ] Ver categorías en la parte inferior
- [ ] Escribir en el buscador
- [ ] Ver resultados en tiempo real
- [ ] Click en una categoría
- [ ] Ver canciones filtradas

### 5.4 Página Principal
- [ ] Ir a `/` (inicio)
- [ ] Ver sección "Tendencias" (si hay canciones)
- [ ] Ver sección "Recién Agregadas"
- [ ] Ver categorías para explorar
- [ ] Hover sobre tarjetas (efecto visual)

---

## 🎨 Paso 6: Verificar Diseño

Todos los componentes deben tener:
- [ ] Fondos con gradientes transparentes
- [ ] Efecto glassmorphism (vidrio esmerilado)
- [ ] Bordes sutiles blancos
- [ ] Animaciones suaves en hover
- [ ] Sombras de color en botones

---

## 🔒 Paso 7: Verificar Seguridad

### En Supabase Dashboard:
- [ ] Row Level Security habilitado en todas las tablas
- [ ] Políticas de storage configuradas
- [ ] `.env` en `.gitignore`

### En la App:
- [ ] Solo usuarios autenticados pueden subir música
- [ ] Solo el dueño puede editar/eliminar su contenido
- [ ] Archivos organizados por usuario en storage

---

## 📊 Paso 8: Verificar Base de Datos

Ve a **Table Editor** en Supabase:

### Después de Registrarte:
- [ ] Nuevo registro en `profiles` con tu ID

### Después de Subir una Canción:
- [ ] Nuevo registro en `songs`
- [ ] Archivos en Storage buckets
- [ ] `views` empieza en 0
- [ ] `likes` empieza en 0

### Después de Buscar:
- [ ] Resultados correctos
- [ ] Filtrado por categoría funciona

---

## 🎯 Checklist de Funcionalidades

### ✅ Completadas
- [x] Sistema de autenticación
- [x] Registro de usuarios
- [x] Login/Logout
- [x] Perfiles automáticos
- [x] Subida de música
- [x] Upload de audio
- [x] Upload de portada
- [x] Upload de video canvas
- [x] 30 categorías musicales
- [x] Buscador en tiempo real
- [x] Filtro por categorías
- [x] Página principal con trending
- [x] Sistema de vistas
- [x] Sistema de likes
- [x] Diseño moderno con gradientes
- [x] Responsive design
- [x] Row Level Security
- [x] Storage configurado

### 🔄 Pendientes (Opcionales)
- [ ] Integrar con reproductor existente
- [ ] Sistema de comentarios
- [ ] Playlists funcionales
- [ ] Seguir artistas
- [ ] Notificaciones
- [ ] Dashboard de analytics

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Missing environment variables"
- Verifica que `.env` existe
- Verifica que las variables empiezan con `PUBLIC_`
- Reinicia el servidor

### No aparecen canciones
- Sube tu primera canción en `/upload`
- Verifica que el SQL se ejecutó correctamente

### Error al subir archivos
- Verifica que los 4 buckets existen
- Verifica que son públicos
- Verifica que las políticas están configuradas

### Las categorías no aparecen
- Verifica que ejecutaste TODO el `supabase-schema.sql`
- Ve a Table Editor > categories (debe haber 30 registros)

---

## 📈 Progreso

Marca tu progreso:

- [ ] Instalación completa
- [ ] Supabase configurado
- [ ] Variables de entorno configuradas
- [ ] Proyecto iniciado
- [ ] Funcionalidades probadas
- [ ] Diseño verificado
- [ ] Seguridad verificada
- [ ] Base de datos verificada

---

## 🎉 ¡Completado!

Cuando todos los checkboxes estén marcados, tu Spotify Clone estará 100% funcional.

**¡Disfruta tu plataforma musical! 🎵**

---

## 📞 Ayuda Rápida

- **Instalación**: `INSTRUCCIONES_RAPIDAS.md`
- **Supabase**: `SUPABASE_SETUP.md`
- **Documentación**: `README.md`
- **Resumen**: `RESUMEN_PROYECTO.md`
