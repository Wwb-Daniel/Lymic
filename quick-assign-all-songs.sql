-- =====================================================
-- ASIGNACIÓN RÁPIDA DE TODAS LAS CANCIONES
-- =====================================================
-- Este script asigna TODAS las canciones a categorías
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- PASO 1: Ver todas tus canciones actuales
SELECT 
  id,
  title,
  artist,
  album,
  CASE 
    WHEN category_id IS NOT NULL THEN '✓ Asignada'
    ELSE '✗ Sin categoría'
  END as estado
FROM songs
ORDER BY title;

-- PASO 2: Ver cuántas canciones tienes sin categoría
SELECT 
  COUNT(*) as total_canciones,
  COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END) as con_categoria,
  COUNT(CASE WHEN category_id IS NULL THEN 1 END) as sin_categoria
FROM songs;

-- =====================================================
-- ASIGNACIÓN AUTOMÁTICA MEJORADA
-- =====================================================

-- Primero, resetear todas las categorías (OPCIONAL - solo si quieres empezar de cero)
-- UPDATE songs SET category_id = NULL;

-- Asignar por palabras clave en TÍTULO o ARTISTA
UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'funk' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%funk%' OR LOWER(artist) LIKE '%funk%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'reggaeton' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%reggaeton%' OR LOWER(artist) LIKE '%reggaeton%' OR LOWER(artist) LIKE '%bad bunny%' OR LOWER(artist) LIKE '%daddy yankee%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'hip-hop' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%rap%' OR LOWER(title) LIKE '%hip%hop%' OR LOWER(artist) LIKE '%rap%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'rock' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%rock%' OR LOWER(artist) LIKE '%rock%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'pop' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%pop%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'jazz' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%jazz%' OR LOWER(artist) LIKE '%jazz%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'electronica' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%electro%' OR LOWER(title) LIKE '%edm%' OR LOWER(title) LIKE '%house%' OR LOWER(title) LIKE '%techno%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'salsa' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%salsa%' OR LOWER(artist) LIKE '%salsa%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'bachata' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%bachata%' OR LOWER(artist) LIKE '%bachata%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'trap' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%trap%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'cumbia' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%cumbia%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'merengue' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%merengue%');

UPDATE songs SET category_id = (SELECT id FROM categories WHERE slug = 'vallenato' LIMIT 1)
WHERE category_id IS NULL AND (LOWER(title) LIKE '%vallenato%');

-- Asignar el resto a "Pop" por defecto
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'pop' LIMIT 1)
WHERE category_id IS NULL;

-- =====================================================
-- VERIFICAR RESULTADOS
-- =====================================================

-- Ver distribución de canciones por categoría
SELECT 
  c.name as categoria,
  COUNT(s.id) as total_canciones
FROM categories c
LEFT JOIN songs s ON s.category_id = c.id
GROUP BY c.id, c.name
ORDER BY total_canciones DESC, c.name;

-- Ver todas las canciones con sus categorías
SELECT 
  s.title,
  s.artist,
  c.name as categoria
FROM songs s
LEFT JOIN categories c ON s.category_id = c.id
ORDER BY c.name, s.title;

-- Ver canciones sin categoría (debería ser 0)
SELECT 
  title,
  artist
FROM songs
WHERE category_id IS NULL;
