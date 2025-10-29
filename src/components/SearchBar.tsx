import { useState, useCallback } from 'react';
import { supabase, type SongWithDetails } from '@/lib/supabase';
import { usePlayerStore } from '@/store/playerStore';
import debounce from 'lodash.debounce';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<SongWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { playSong } = usePlayerStore();

  const searchSongs = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSongs([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      const { data, error } = await supabase
        .from('songs_with_details')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%,album.ilike.%${searchQuery}%`)
        .order('views', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error('Error searching:', error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((q: string) => searchSongs(q), 300),
    []
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSongClick = (song: SongWithDetails, allSongs: SongWithDetails[]) => {
    playSong(song, allSongs);
    setShowResults(false);
    setQuery('');
  };

  const handleViewAll = () => {
    window.location.href = '/search';
  };

  return (
    <div className="relative w-96 max-w-md">
      {/* Input de búsqueda */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.533 1.27893C5.35215 1.27893 1.12598 5.41887 1.12598 10.5579C1.12598 15.697 5.35215 19.8369 10.533 19.8369C12.767 19.8369 14.8235 19.0671 16.4402 17.7794L20.7929 22.132C21.1834 22.5226 21.8166 22.5226 22.2071 22.132C22.5976 21.7415 22.5976 21.1083 22.2071 20.7178L17.8634 16.3741C19.1616 14.7849 19.94 12.7634 19.94 10.5579C19.94 5.41887 15.7138 1.27893 10.533 1.27893ZM3.12598 10.5579C3.12598 6.55226 6.42768 3.27893 10.533 3.27893C14.6383 3.27893 17.94 6.55226 17.94 10.5579C17.94 14.5636 14.6383 17.8369 10.533 17.8369C6.42768 17.8369 3.12598 14.5636 3.12598 10.5579Z" />
          </svg>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="¿Qué quieres reproducir?"
          className="w-full pl-12 pr-12 py-3 bg-white/5 hover:bg-white/10 focus:bg-white/10 backdrop-blur-xl rounded-full text-sm text-white placeholder-gray-400 outline-none transition-colors border border-white/10"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSongs([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            aria-label="Limpiar búsqueda"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.293 3.293a1 1 0 0 1 1.414 0L12 10.586l7.293-7.293a1 1 0 1 1 1.414 1.414L13.414 12l7.293 7.293a1 1 0 0 1-1.414 1.414L12 13.414l-7.293 7.293a1 1 0 0 1-1.414-1.414L10.586 12 3.293 4.707a1 1 0 0 1 0-1.414" />
            </svg>
          </button>
        )}
      </div>

      {/* Resultados dropdown */}
      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 overflow-hidden z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}

          {!loading && songs.length === 0 && query && (
            <div className="p-4 text-center text-gray-400">
              No se encontraron resultados
            </div>
          )}

          {!loading && songs.length > 0 && (
            <>
              {songs.map((song) => (
                <button
                  key={song.id}
                  onMouseDown={() => handleSongClick(song, songs)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left"
                >
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-zinc-700 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{song.title}</p>
                    <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                  </div>
                </button>
              ))}
              
              {/* Ver todos los resultados */}
              <button
                onMouseDown={handleViewAll}
                className="w-full p-3 text-center text-sm text-green-500 hover:bg-white/10 transition-colors border-t border-white/10"
              >
                Ver todos los resultados
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
