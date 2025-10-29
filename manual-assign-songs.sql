-- =====================================================
-- ASIGNAR CANCIONES MANUALMENTE A CATEGORÍAS
-- =====================================================
-- Usa este archivo si quieres asignar canciones específicas
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Primero, ver todas las canciones disponibles
SELECT id, title, artist, album FROM songs ORDER BY title;

-- Ver todas las categorías disponibles
SELECT id, name, slug FROM categories ORDER BY name;

-- =====================================================
-- EJEMPLOS DE ASIGNACIÓN MANUAL
-- =====================================================

-- Asignar una canción específica a Funk (reemplaza 'Título de la canción' con el título real)
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'funk' LIMIT 1)
WHERE title ILIKE '%título de tu canción funk%';

-- Asignar una canción específica a Reggaeton
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'reggaeton' LIMIT 1)
WHERE title ILIKE '%título de tu canción reggaeton%';

-- =====================================================
-- ASIGNACIÓN POR ID (más preciso)
-- =====================================================
-- Si conoces el ID exacto de la canción, usa esto:

-- Ejemplo: Asignar canción con ID específico a Funk
-- UPDATE songs 
-- SET category_id = (SELECT id FROM categories WHERE slug = 'funk' LIMIT 1)
-- WHERE id = 'aquí-va-el-id-de-la-canción';

-- =====================================================
-- ASIGNACIÓN MASIVA POR ARTISTA
-- =====================================================

-- Asignar todas las canciones de un artista a una categoría
-- UPDATE songs 
-- SET category_id = (SELECT id FROM categories WHERE slug = 'funk' LIMIT 1)
-- WHERE artist ILIKE '%nombre del artista%';

-- =====================================================
-- VERIFICAR ASIGNACIONES
-- =====================================================

-- Ver canciones con sus categorías
SELECT 
  s.title,
  s.artist,
  c.name as categoria,
  c.slug
FROM songs s
LEFT JOIN categories c ON s.category_id = c.id
ORDER BY s.title;

-- Ver canciones de una categoría específica
SELECT 
  s.title,
  s.artist
FROM songs s
JOIN categories c ON s.category_id = c.id
WHERE c.slug = 'funk'  -- Cambia 'funk' por la categoría que quieras ver
ORDER BY s.title;

-- Contar canciones por categoría
SELECT 
  c.name,
  COUNT(s.id) as total
FROM categories c
LEFT JOIN songs s ON s.category_id = c.id
GROUP BY c.name
ORDER BY total DESC;
