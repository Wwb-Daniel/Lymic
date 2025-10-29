-- =====================================================
-- ACTUALIZAR CATEGORÍAS CON IMÁGENES
-- =====================================================
-- Agregar URLs de imágenes a las categorías de música
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Actualizar categorías existentes con imágenes de Unsplash
UPDATE categories SET icon = 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop' WHERE slug = 'pop';
UPDATE categories SET icon = 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop' WHERE slug = 'hip-hop';
UPDATE categories SET icon = 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop' WHERE slug = 'rock';
UPDATE categories SET icon = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' WHERE slug = 'electronica';
UPDATE categories SET icon = 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=400&h=400&fit=crop' WHERE slug = 'latina';
UPDATE categories SET icon = 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop' WHERE slug = 'rnb';
UPDATE categories SET icon = 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop' WHERE slug = 'jazz';
UPDATE categories SET icon = 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' WHERE slug = 'clasica';
UPDATE categories SET icon = 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=400&fit=crop' WHERE slug = 'country';
UPDATE categories SET icon = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' WHERE slug = 'indie';

-- Insertar o actualizar categorías con imágenes (usando UPSERT)
INSERT INTO categories (name, slug, description, color, icon) VALUES
  ('Ambient', 'ambient', 'Música ambiental y relajante', '#9333EA', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'),
  ('Bachata', 'bachata', 'Ritmos latinos y románticos', '#EC4899', 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=400&fit=crop'),
  ('Blues', 'blues', 'Blues clásico y moderno', '#3B82F6', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop'),
  ('Cumbia', 'cumbia', 'Cumbia y música tropical', '#F59E0B', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=400&fit=crop'),
  ('Disco', 'disco', 'Disco y funk de los 70s-80s', '#F97316', 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=400&fit=crop'),
  ('Dubstep', 'dubstep', 'Bass music y dubstep', '#8B5CF6', 'https://images.unsplash.com/photo-1571266028243-d220c6e2e8e2?w=400&h=400&fit=crop'),
  ('Flamenco', 'flamenco', 'Flamenco y música española', '#DC2626', 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=400&fit=crop'),
  ('Funk', 'funk', 'Funk y groove', '#EAB308', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop'),
  ('Gospel', 'gospel', 'Música gospel y espiritual', '#06B6D4', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'),
  ('House', 'house', 'House y música electrónica', '#10B981', 'https://images.unsplash.com/photo-1571266028243-d220c6e2e8e2?w=400&h=400&fit=crop'),
  ('K-Pop', 'k-pop', 'K-Pop y música coreana', '#EC4899', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=400&fit=crop'),
  ('Metal', 'metal', 'Heavy metal y rock pesado', '#1F2937', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop'),
  ('Merengue', 'merengue', 'Merengue y música caribeña', '#F59E0B', 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=400&fit=crop'),
  ('Punk', 'punk', 'Punk rock y hardcore', '#EF4444', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop'),
  ('Reggae', 'reggae', 'Reggae y música jamaicana', '#22C55E', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop'),
  ('Reggaeton', 'reggaeton', 'Reggaeton y urbano latino', '#F97316', 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=400&h=400&fit=crop'),
  ('Salsa', 'salsa', 'Salsa y música tropical', '#DC2626', 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=400&fit=crop'),
  ('Soul', 'soul', 'Soul y R&B clásico', '#7C3AED', 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop'),
  ('Techno', 'techno', 'Techno y música electrónica', '#6366F1', 'https://images.unsplash.com/photo-1571266028243-d220c6e2e8e2?w=400&h=400&fit=crop'),
  ('Tango', 'tango', 'Tango argentino', '#BE123C', 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=400&fit=crop'),
  ('Trap', 'trap', 'Trap y hip-hop moderno', '#0F172A', 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop'),
  ('Vallenato', 'vallenato', 'Vallenato colombiano', '#F59E0B', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop')
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  description = EXCLUDED.description;

-- Verificar las categorías actualizadas
SELECT name, slug, color, 
  CASE 
    WHEN icon IS NOT NULL AND icon != '' THEN '✓ Tiene imagen'
    ELSE '✗ Sin imagen'
  END as imagen_status
FROM categories
ORDER BY name;

-- Contar categorías con imágenes
SELECT 
  COUNT(*) as total_categorias,
  COUNT(CASE WHEN icon IS NOT NULL AND icon != '' THEN 1 END) as con_imagen,
  COUNT(CASE WHEN icon IS NULL OR icon = '' THEN 1 END) as sin_imagen
FROM categories;
