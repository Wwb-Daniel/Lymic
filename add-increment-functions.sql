-- =====================================================
-- FUNCIONES PARA INCREMENTAR/DECREMENTAR VIEWS Y LIKES
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Función para incrementar vistas
CREATE OR REPLACE FUNCTION increment_views(song_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE songs
    SET views = COALESCE(views, 0) + 1
    WHERE id = song_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Función para incrementar likes
CREATE OR REPLACE FUNCTION increment_likes(song_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE songs
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = song_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Función para decrementar likes
CREATE OR REPLACE FUNCTION decrement_likes(song_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE songs
    SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
    WHERE id = song_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar que las funciones se crearon
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('increment_views', 'increment_likes', 'decrement_likes');
