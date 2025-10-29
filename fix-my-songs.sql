-- =====================================================
-- CORREGIR CATEGORÍAS DE TUS CANCIONES
-- =====================================================

-- Ver categorías disponibles
SELECT id, name, slug FROM categories WHERE slug IN ('funk', 'reggaeton', 'trap', 'hip-hop') ORDER BY name;

-- Corregir "MONTAGEM TOMADA" - Es Funk Brasileño, no Punk
UPDATE songs 
SET category_id = (SELECT id FROM categories WHERE slug = 'funk' LIMIT 1)
WHERE title = 'MONTAGEM TOMADA';

-- "DONATY x POLO JOA - EMPAQUETATE" ya está bien en Reggaeton
-- No necesita cambios

-- Verificar los cambios
SELECT 
  s.title,
  s.artist,
  c.name as categoria,
  c.slug
FROM songs s
LEFT JOIN categories c ON s.category_id = c.id
ORDER BY s.title;

-- Ver canciones por categoría
SELECT 
  c.name as categoria,
  COUNT(s.id) as total
FROM categories c
LEFT JOIN songs s ON s.category_id = c.id
GROUP BY c.name
HAVING COUNT(s.id) > 0
ORDER BY total DESC;
