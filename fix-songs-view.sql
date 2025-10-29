-- =====================================================
-- CREAR/ACTUALIZAR VISTA songs_with_details
-- =====================================================
-- Esta vista es necesaria para que funcione la búsqueda
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Eliminar la vista si existe
DROP VIEW IF EXISTS songs_with_details;

-- Crear la vista con todos los detalles necesarios
CREATE VIEW songs_with_details AS
SELECT 
  s.id,
  s.title,
  s.artist,
  s.album,
  s.cover_url,
  s.audio_url,
  s.duration,
  s.views,
  s.likes,
  s.category_id,
  s.created_at,
  s.updated_at,
  c.name as category_name,
  c.color as category_color,
  c.slug as category_slug
FROM songs s
LEFT JOIN categories c ON s.category_id = c.id;

-- Verificar que la vista se creó correctamente
SELECT * FROM songs_with_details ORDER BY title;

-- Verificar canciones por categoría en la vista
SELECT 
  category_name,
  COUNT(*) as total
FROM songs_with_details
WHERE category_name IS NOT NULL
GROUP BY category_name
ORDER BY total DESC;

-- Ver canciones de Funk específicamente
SELECT 
  title,
  artist,
  category_name,
  category_slug
FROM songs_with_details
WHERE category_slug = 'funk';

-- Ver canciones de Reggaeton específicamente
SELECT 
  title,
  artist,
  category_name,
  category_slug
FROM songs_with_details
WHERE category_slug = 'reggaeton';

-- Verificar que las canciones tienen category_id asignado
SELECT 
  s.title,
  s.artist,
  s.category_id,
  c.name as categoria
FROM songs s
LEFT JOIN categories c ON s.category_id = c.id
ORDER BY s.title;
