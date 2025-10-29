-- =====================================================
-- AGREGAR TABLAS PARA FAVORITOS E HISTORIAL
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Tabla de canciones favoritas
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, song_id)
);

-- 2. Tabla de historial de reproducción
CREATE TABLE IF NOT EXISTS public.play_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_song_id ON public.favorites(song_id);
CREATE INDEX IF NOT EXISTS idx_play_history_user_id ON public.play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_song_id ON public.play_history(song_id);
CREATE INDEX IF NOT EXISTS idx_play_history_played_at ON public.play_history(played_at DESC);

-- 4. Habilitar RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;

-- 5. Políticas para favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove favorites" ON public.favorites;

CREATE POLICY "Users can view own favorites"
ON public.favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
ON public.favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
ON public.favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. Políticas para play_history
DROP POLICY IF EXISTS "Users can view own history" ON public.play_history;
DROP POLICY IF EXISTS "Users can add to history" ON public.play_history;

CREATE POLICY "Users can view own history"
ON public.play_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to history"
ON public.play_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 7. Vista para obtener favoritos con detalles de canciones
CREATE OR REPLACE VIEW public.favorites_with_details AS
SELECT 
    f.id,
    f.user_id,
    f.song_id,
    f.created_at,
    s.title,
    s.artist,
    s.album,
    s.cover_url,
    s.duration,
    s.views,
    s.likes
FROM public.favorites f
JOIN public.songs s ON f.song_id = s.id;

-- 8. Vista para obtener historial con detalles
CREATE OR REPLACE VIEW public.history_with_details AS
SELECT 
    ph.id,
    ph.user_id,
    ph.song_id,
    ph.played_at,
    s.title,
    s.artist,
    s.album,
    s.cover_url,
    s.duration,
    s.views,
    s.likes
FROM public.play_history ph
JOIN public.songs s ON ph.song_id = s.id;

-- 9. Función para obtener estadísticas del usuario
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_favorites BIGINT,
    total_plays BIGINT,
    total_views BIGINT,
    total_likes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM favorites WHERE user_id = user_uuid) as total_favorites,
        (SELECT COUNT(*) FROM play_history WHERE user_id = user_uuid) as total_plays,
        COALESCE((SELECT SUM(s.views) FROM favorites f JOIN songs s ON f.song_id = s.id WHERE f.user_id = user_uuid), 0) as total_views,
        COALESCE((SELECT SUM(s.likes) FROM favorites f JOIN songs s ON f.song_id = s.id WHERE f.user_id = user_uuid), 0) as total_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Verificar que todo se creó correctamente
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('favorites', 'play_history');

SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('favorites_with_details', 'history_with_details');
