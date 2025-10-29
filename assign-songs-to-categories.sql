-- =====================================================
-- ASIGNAR CANCIONES A CATEGORÍAS
-- =====================================================
-- Vincular canciones existentes con sus categorías
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Primero, verificar las categorías disponibles
SELECT id, name, slug FROM categories ORDER BY name;

-- Asignar canciones a categorías basándose en palabras clave en el título, artista o álbum
-- Puedes ajustar estas asignaciones según tus canciones

-- Funk
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'funk' LIMIT 1)
WHERE category_id IS NULL 
  AND (
    LOWER(title) LIKE '%funk%' OR 
    LOWER(artist) LIKE '%funk%' OR 
    LOWER(album) LIKE '%funk%'
  );

-- Reggaeton
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'reggaeton' LIMIT 1)
WHERE category_id IS NULL 
  AND (
    LOWER(title) LIKE '%reggaeton%' OR 
    LOWER(artist) LIKE '%reggaeton%' OR 
    LOWER(album) LIKE '%reggaeton%' OR
    LOWER(artist) LIKE '%bad bunny%' OR
    LOWER(artist) LIKE '%daddy yankee%' OR
    LOWER(artist) LIKE '%ozuna%' OR
    LOWER(artist) LIKE '%j balvin%'
  );

-- Hip-Hop / Rap
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'hip-hop' LIMIT 1)
WHERE category_id IS NULL 
  AND (
    LOWER(title) LIKE '%rap%' OR 
    LOWER(title) LIKE '%hip hop%' OR
    LOWER(title) LIKE '%hip-hop%' OR
    LOWER(artist) LIKE '%rap%'
  );

-- Pop
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'pop' LIMIT 1)
WHERE category_id IS NULL 
  AND (
    LOWER(title) LIKE '%pop%'
  );

-- Rock
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'rock' LIMIT 1)
WHERE category_id IS NULL 
  AND (
    LOWER(title) LIKE '%rock%' OR 
    LOWER(artist) LIKE '%rock%'
  );

-- Electrónica / EDM
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'electronica' LIMIT 1)
WHERE category_id IS NULL 
  AND (
    LOWER(title) LIKE '%electro%' OR 
    LOWER(title) LIKE '%edm%' OR
    LOWER(title) LIKE '%electronic%'
  );

-- Salsa
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'salsa' LIMIT 1)
WHERE category_id IS NULL 
  AND (
    LOWER(title) LIKE '%salsa%' OR 
    LOWER(artist) LIKE '%salsa%'
  );

-- Bachata
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'bachata' LIMIT 1)
WHERE category_id IS NULL 
  AND (
    LOWER(title) LIKE '%bachata%' OR 
    LOWER(artist) LIKE '%bachata%' OR
    LOWER(artist) LIKE '%romeo santos%' OR
    LOWER(artist) LIKE '%prince royce%'
  );

-- Jazz
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'jazz' LIMIT 1)
WHERE category_id IS NULL 
  AND (
    LOWER(title) LIKE '%jazz%' OR 
    LOWER(artist) LIKE '%jazz%'
  );

-- Trap
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'trap' LIMIT 1)
WHERE category_id IS NULL 
  AND (
    LOWER(title) LIKE '%trap%' OR 
    LOWER(artist) LIKE '%trap%'
  );

-- K-Pop
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'k-pop' LIMIT 1)
WHERE category_id IS NULL 
  AND (
    LOWER(title) LIKE '%k-pop%' OR 
    LOWER(title) LIKE '%kpop%' OR
    LOWER(artist) LIKE '%bts%' OR
    LOWER(artist) LIKE '%blackpink%' OR
    LOWER(artist) LIKE '%twice%'
  );

-- Asignar categoría por defecto (Pop) a canciones sin categoría
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'pop' LIMIT 1)
WHERE category_id IS NULL;

-- Verificar la distribución de canciones por categoría
SELECT 
  c.name as categoria,
  COUNT(s.id) as total_canciones
FROM categories c
LEFT JOIN songs s ON s.category_id = c.id
GROUP BY c.id, c.name
ORDER BY total_canciones DESC, c.name;

-- Ver canciones sin categoría (debería ser 0)
SELECT COUNT(*) as canciones_sin_categoria
FROM songs
WHERE category_id IS NULL;

-- Ver algunas canciones con sus categorías asignadas
SELECT 
  s.title,
  s.artist,
  c.name as categoria
FROM songs s
LEFT JOIN categories c ON s.category_id = c.id
ORDER BY c.name, s.title
LIMIT 50;
