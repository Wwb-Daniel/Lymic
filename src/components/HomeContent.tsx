import { useState, useEffect } from 'react';
import { supabase, type SongWithDetails, type Category } from '@/lib/supabase';
import { usePlayerStore } from '@/store/playerStore';
import { Flame, Sparkles, Music2, TrendingUp } from '@/components/icons';

export default function HomeContent() {
  const [trendingSongs, setTrendingSongs] = useState<SongWithDetails[]>([]);
  const [recentSongs, setRecentSongs] = useState<SongWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      // Cargar canciones más populares
      const { data: trending } = await supabase
        .from('songs_with_details')
        .select('*')
        .order('views', { ascending: false })
        .limit(12);

      // Cargar canciones recientes
      const { data: recent } = await supabase
        .from('songs_with_details')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);

      // Cargar categorías destacadas
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('name')
        .limit(8);

      if (trending) setTrendingSongs(trending);
      if (recent) setRecentSongs(recent);
      if (cats) setCategories(cats);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-12">
      {/* Header con saludo */}
      <div>
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white via-green-400 to-blue-500 bg-clip-text text-transparent">
          {getGreeting()}
        </h1>
        <p className="text-gray-400 text-lg">Descubre nueva música increíble</p>
      </div>

      {/* Canciones Trending */}
      {trendingSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Flame className="w-8 h-8 text-orange-500" />
              Tendencias
            </h2>
            <a href="/search" className="text-gray-400 hover:text-white text-sm font-semibold transition-colors">
              Ver todas
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} allSongs={trendingSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Canciones Recientes */}
      {recentSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              Recién Agregadas
            </h2>
            <a href="/search" className="text-gray-400 hover:text-white text-sm font-semibold transition-colors">
              Ver todas
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recentSongs.map((song) => (
              <SongCard key={song.id} song={song} allSongs={recentSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Categorías */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Music2 className="w-8 h-8 text-green-500" />
              Explorar Géneros
            </h2>
            <a href="/search" className="text-gray-400 hover:text-white text-sm font-semibold transition-colors">
              Ver todos
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/search?category=${cat.id}`}
                className="relative aspect-square rounded-xl overflow-hidden group transition-transform hover:scale-105"
              >
                {/* Imagen de fondo */}
                {cat.icon ? (
                  <img 
                    src={cat.icon} 
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="absolute inset-0 w-full h-full"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
                
                {/* Overlay oscuro */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/40 to-black/70"></div>
                
                {/* Nombre de la categoría */}
                <div className="relative h-full p-6 flex items-end">
                  <h3 className="text-white font-bold text-2xl drop-shadow-lg">{cat.name}</h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Estado vacío */}
      {trendingSongs.length === 0 && recentSongs.length === 0 && (
        <div className="text-center py-20">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
            <svg className="relative w-24 h-24 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No hay música todavía</h3>
          <p className="text-gray-400 mb-6">Sé el primero en compartir tu música con el mundo</p>
          <a
            href="/upload"
            className="inline-block px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-green-500/25"
          >
            Subir Primera Canción
          </a>
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de canción
function SongCard({ song, allSongs }: { song: SongWithDetails; allSongs?: SongWithDetails[] }) {
  const { playSong } = usePlayerStore();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSong(song, allSongs);
  };

  return (
    <div className="group relative" onClick={handlePlay}>
      {/* Gradiente de fondo */}
      <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/20 group-hover:via-pink-500/20 group-hover:to-blue-500/20 rounded-xl blur-xl transition-all duration-300"></div>
      
      {/* Tarjeta */}
      <div className="relative bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/5 group-hover:border-white/20 transition-all cursor-pointer">
        {/* Cover */}
        <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          {song.cover_url ? (
            <img
              src={song.cover_url}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <button 
              onClick={handlePlay}
              className="w-12 h-12 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
            >
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <h3 className="text-white font-semibold truncate mb-1">{song.title}</h3>
          <p className="text-gray-400 text-sm truncate">{song.artist}</p>
          
          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {song.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {song.likes.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper para saludo
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}
