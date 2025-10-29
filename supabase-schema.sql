-- =====================================================
-- SPOTIFY CLONE - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Este archivo contiene todo el esquema de base de datos
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA: profiles
-- Perfiles de usuario extendidos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    name_updated_at TIMESTAMP WITH TIME ZONE,
    avatar_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: categories
-- Categorías musicales (estilo Spotify)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#1DB954',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías de Spotify
INSERT INTO public.categories (name, slug, description, color) VALUES
    ('Pop', 'pop', 'Los éxitos más grandes del pop', '#FF6B6B'),
    ('Hip-Hop', 'hip-hop', 'Los mejores beats y rimas', '#4ECDC4'),
    ('Rock', 'rock', 'Clásicos y nuevos del rock', '#95E1D3'),
    ('Electrónica', 'electronica', 'Música electrónica y dance', '#F38181'),
    ('Latina', 'latina', 'Lo mejor de la música latina', '#FFA07A'),
    ('R&B', 'rnb', 'Rhythm and Blues', '#DDA15E'),
    ('Jazz', 'jazz', 'Jazz clásico y contemporáneo', '#BC6C25'),
    ('Clásica', 'clasica', 'Música clásica', '#8E7CC3'),
    ('Country', 'country', 'Country y folk', '#C08552'),
    ('Reggaeton', 'reggaeton', 'Los mejores ritmos urbanos', '#06FFA5'),
    ('Indie', 'indie', 'Música independiente', '#FFD23F'),
    ('Metal', 'metal', 'Heavy metal y subgéneros', '#2D3142'),
    ('Blues', 'blues', 'Blues tradicional y moderno', '#4F5D75'),
    ('Soul', 'soul', 'Soul y funk', '#EF8354'),
    ('Reggae', 'reggae', 'Reggae y ska', '#06D6A0'),
    ('Disco', 'disco', 'Clásicos disco', '#F72585'),
    ('Punk', 'punk', 'Punk rock', '#7209B7'),
    ('Folk', 'folk', 'Folk y acústico', '#3A0CA3'),
    ('Ambient', 'ambient', 'Música ambiental', '#4361EE'),
    ('Trap', 'trap', 'Trap y música urbana', '#4CC9F0'),
    ('House', 'house', 'House music', '#F72585'),
    ('Techno', 'techno', 'Techno y minimal', '#B5179E'),
    ('Dubstep', 'dubstep', 'Dubstep y bass music', '#7209B7'),
    ('K-Pop', 'kpop', 'Pop coreano', '#FF006E'),
    ('Salsa', 'salsa', 'Salsa y música tropical', '#FB5607'),
    ('Bachata', 'bachata', 'Bachata romántica', '#FF006E'),
    ('Merengue', 'merengue', 'Merengue y música caribeña', '#FFBE0B'),
    ('Cumbia', 'cumbia', 'Cumbia latina', '#8338EC'),
    ('Flamenco', 'flamenco', 'Flamenco español', '#FF006E'),
    ('Tango', 'tango', 'Tango argentino', '#C1121F')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- TABLA: playlists
-- Playlists/Álbumes creados por usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    color TEXT DEFAULT '#1DB954',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: songs
-- Canciones subidas por usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    duration INTEGER, -- duración en segundos
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    video_url TEXT, -- URL del video corto (estilo Spotify Canvas)
    lyrics TEXT,
    category_id UUID REFERENCES public.categories(id),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_songs_title ON public.songs USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_songs_artist ON public.songs USING gin(to_tsvector('spanish', artist));
CREATE INDEX IF NOT EXISTS idx_songs_album ON public.songs USING gin(to_tsvector('spanish', album));
CREATE INDEX IF NOT EXISTS idx_songs_category ON public.songs(category_id);
CREATE INDEX IF NOT EXISTS idx_songs_views ON public.songs(views DESC);
CREATE INDEX IF NOT EXISTS idx_songs_created ON public.songs(created_at DESC);

-- =====================================================
-- TABLA: playlist_songs
-- Relación muchos a muchos entre playlists y canciones
-- =====================================================
CREATE TABLE IF NOT EXISTS public.playlist_songs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, song_id)
);

CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON public.playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song ON public.playlist_songs(song_id);

-- =====================================================
-- TABLA: song_views
-- Registro de vistas para recomendaciones
-- =====================================================
CREATE TABLE IF NOT EXISTS public.song_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_song_views_song ON public.song_views(song_id);
CREATE INDEX IF NOT EXISTS idx_song_views_user ON public.song_views(user_id);
CREATE INDEX IF NOT EXISTS idx_song_views_date ON public.song_views(viewed_at DESC);

-- =====================================================
-- TABLA: song_likes
-- Likes de canciones por usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS public.song_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(song_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_song_likes_song ON public.song_likes(song_id);
CREATE INDEX IF NOT EXISTS idx_song_likes_user ON public.song_likes(user_id);

-- =====================================================
-- TABLA: user_history
-- Historial de reproducción del usuario
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_played INTEGER DEFAULT 0 -- segundos reproducidos
);

CREATE INDEX IF NOT EXISTS idx_user_history_user ON public.user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_song ON public.user_history(song_id);
CREATE INDEX IF NOT EXISTS idx_user_history_date ON public.user_history(played_at DESC);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON public.songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para incrementar vistas
CREATE OR REPLACE FUNCTION increment_song_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.songs 
    SET views = views + 1 
    WHERE id = NEW.song_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_views_on_view AFTER INSERT ON public.song_views
    FOR EACH ROW EXECUTE FUNCTION increment_song_views();

-- Función para actualizar contador de likes
CREATE OR REPLACE FUNCTION update_song_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.songs 
        SET likes = likes + 1 
        WHERE id = NEW.song_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.songs 
        SET likes = likes - 1 
        WHERE id = OLD.song_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_likes_on_insert AFTER INSERT ON public.song_likes
    FOR EACH ROW EXECUTE FUNCTION update_song_likes_count();

CREATE TRIGGER update_likes_on_delete AFTER DELETE ON public.song_likes
    FOR EACH ROW EXECUTE FUNCTION update_song_likes_count();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de canciones con información completa
CREATE OR REPLACE VIEW songs_with_details AS
SELECT 
    s.id,
    s.title,
    s.artist,
    s.album,
    s.duration,
    s.audio_url,
    s.cover_url,
    s.video_url,
    s.lyrics,
    s.views,
    s.likes,
    s.created_at,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color,
    p.username as uploaded_by,
    p.avatar_url as uploader_avatar
FROM public.songs s
LEFT JOIN public.categories c ON s.category_id = c.id
LEFT JOIN public.profiles p ON s.user_id = p.id;

-- Vista de canciones más populares
CREATE OR REPLACE VIEW trending_songs AS
SELECT 
    s.*,
    c.name as category_name,
    COUNT(DISTINCT sv.id) as recent_views
FROM public.songs s
LEFT JOIN public.categories c ON s.category_id = c.id
LEFT JOIN public.song_views sv ON s.id = sv.song_id 
    AND sv.viewed_at > NOW() - INTERVAL '7 days'
GROUP BY s.id, c.name
ORDER BY recent_views DESC, s.views DESC
LIMIT 50;

-- Vista de recomendaciones basadas en historial
CREATE OR REPLACE VIEW user_recommendations AS
SELECT 
    uh.user_id,
    s.id as song_id,
    s.title,
    s.artist,
    s.cover_url,
    s.category_id,
    COUNT(*) as play_count,
    MAX(uh.played_at) as last_played
FROM public.user_history uh
JOIN public.songs s ON uh.song_id = s.id
GROUP BY uh.user_id, s.id, s.title, s.artist, s.cover_url, s.category_id
ORDER BY uh.user_id, play_count DESC;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Perfiles públicos visibles para todos" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para playlists
CREATE POLICY "Playlists públicas visibles para todos" ON public.playlists
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear playlists" ON public.playlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus playlists" ON public.playlists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus playlists" ON public.playlists
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para songs
CREATE POLICY "Canciones visibles para todos" ON public.songs
    FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden subir canciones" ON public.songs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus canciones" ON public.songs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus canciones" ON public.songs
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para playlist_songs
CREATE POLICY "Canciones de playlist visibles según playlist" ON public.playlist_songs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.playlists p 
            WHERE p.id = playlist_id 
            AND (p.is_public = true OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "Usuarios pueden agregar canciones a sus playlists" ON public.playlist_songs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.playlists p 
            WHERE p.id = playlist_id 
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios pueden eliminar canciones de sus playlists" ON public.playlist_songs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.playlists p 
            WHERE p.id = playlist_id 
            AND p.user_id = auth.uid()
        )
    );

-- Políticas para song_views
CREATE POLICY "Cualquiera puede registrar vistas" ON public.song_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios pueden ver su historial de vistas" ON public.song_views
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Políticas para song_likes
CREATE POLICY "Likes visibles para todos" ON public.song_likes
    FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden dar like" ON public.song_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden quitar su like" ON public.song_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_history
CREATE POLICY "Usuarios pueden ver su propio historial" ON public.user_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden agregar a su historial" ON public.user_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCIONES DE BÚSQUEDA
-- =====================================================

-- Función de búsqueda avanzada
CREATE OR REPLACE FUNCTION search_songs(search_query TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    artist TEXT,
    album TEXT,
    cover_url TEXT,
    audio_url TEXT,
    video_url TEXT,
    category_name TEXT,
    views INTEGER,
    likes INTEGER,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.artist,
        s.album,
        s.cover_url,
        s.audio_url,
        s.video_url,
        c.name as category_name,
        s.views,
        s.likes,
        (
            ts_rank(to_tsvector('spanish', s.title), plainto_tsquery('spanish', search_query)) * 3 +
            ts_rank(to_tsvector('spanish', s.artist), plainto_tsquery('spanish', search_query)) * 2 +
            ts_rank(to_tsvector('spanish', COALESCE(s.album, '')), plainto_tsquery('spanish', search_query))
        ) as relevance
    FROM public.songs s
    LEFT JOIN public.categories c ON s.category_id = c.id
    WHERE 
        to_tsvector('spanish', s.title) @@ plainto_tsquery('spanish', search_query)
        OR to_tsvector('spanish', s.artist) @@ plainto_tsquery('spanish', search_query)
        OR to_tsvector('spanish', COALESCE(s.album, '')) @@ plainto_tsquery('spanish', search_query)
        OR s.title ILIKE '%' || search_query || '%'
        OR s.artist ILIKE '%' || search_query || '%'
        OR s.album ILIKE '%' || search_query || '%'
    ORDER BY relevance DESC, s.views DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener canciones recomendadas para un usuario
CREATE OR REPLACE FUNCTION get_recommended_songs(user_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    title TEXT,
    artist TEXT,
    cover_url TEXT,
    audio_url TEXT,
    video_url TEXT,
    category_name TEXT,
    views INTEGER,
    score REAL
) AS $$
BEGIN
    RETURN QUERY
    WITH user_categories AS (
        -- Categorías que el usuario ha escuchado
        SELECT DISTINCT s.category_id, COUNT(*) as category_count
        FROM public.user_history uh
        JOIN public.songs s ON uh.song_id = s.id
        WHERE uh.user_id = user_uuid
        GROUP BY s.category_id
    ),
    user_listened AS (
        -- Canciones que ya escuchó
        SELECT DISTINCT song_id
        FROM public.user_history
        WHERE user_id = user_uuid
    )
    SELECT 
        s.id,
        s.title,
        s.artist,
        s.cover_url,
        s.audio_url,
        s.video_url,
        c.name as category_name,
        s.views,
        (
            CASE 
                WHEN uc.category_count IS NOT NULL 
                THEN (uc.category_count::REAL / 10) * 2
                ELSE 0 
            END +
            (s.views::REAL / 1000) +
            (s.likes::REAL / 100)
        ) as score
    FROM public.songs s
    LEFT JOIN public.categories c ON s.category_id = c.id
    LEFT JOIN user_categories uc ON s.category_id = uc.category_id
    WHERE s.id NOT IN (SELECT song_id FROM user_listened)
    ORDER BY score DESC, s.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CONFIGURACIÓN DE STORAGE
-- =====================================================
-- NOTA: Los buckets se deben crear desde la interfaz de Supabase
-- o mediante el cliente de JavaScript. Aquí están las configuraciones:
--
-- Bucket: song-covers
--   - Public: true
--   - File size limit: 5MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
--
-- Bucket: song-audio
--   - Public: true
--   - File size limit: 50MB
--   - Allowed MIME types: audio/mpeg, audio/wav, audio/ogg, audio/mp4
--
-- Bucket: song-videos
--   - Public: true
--   - File size limit: 100MB
--   - Allowed MIME types: video/mp4, video/webm, video/quicktime
--
-- Bucket: avatars
--   - Public: true
--   - File size limit: 2MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp
-- =====================================================

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL - COMENTAR SI NO SE DESEA)
-- =====================================================
-- Puedes descomentar esto para tener datos de prueba

/*
-- Insertar un usuario de prueba en profiles (después de crear el usuario en auth)
INSERT INTO public.profiles (id, username, full_name, bio) VALUES
    ('00000000-0000-0000-0000-000000000000', 'demo_user', 'Usuario Demo', 'Cuenta de demostración');

-- Insertar playlist de ejemplo
INSERT INTO public.playlists (user_id, title, description, color) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Mi Playlist', 'Mis canciones favoritas', '#1DB954');
*/

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================

-- Para verificar que todo se creó correctamente:
SELECT 'Schema creado exitosamente!' as status;
