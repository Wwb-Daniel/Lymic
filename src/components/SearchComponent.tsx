import { useState, useEffect, useCallback } from 'react';
import { supabase, type SongWithDetails, type Category } from '@/lib/supabase';
import debounce from 'lodash.debounce';

export default function SearchComponent() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<SongWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) setCategories(data);
  };

  const searchSongs = async (searchQuery: string, categoryFilter?: string) => {
    // Si no hay búsqueda ni categoría, limpiar resultados
    if (!searchQuery && !categoryFilter) {
      setSongs([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      console.log('Buscando con:', { searchQuery, categoryFilter });

      // Buscar si el query coincide con un nombre de categoría
      let matchedCategory = null;
      if (searchQuery && !categoryFilter) {
        matchedCategory = categories.find(cat => 
          cat.name.toLowerCase() === searchQuery.toLowerCase() ||
          cat.slug.toLowerCase() === searchQuery.toLowerCase()
        );
      }

      // Primero intentar con la vista songs_with_details
      let query = supabase
        .from('songs_with_details')
        .select('*')
        .order('views', { ascending: false })
        .limit(50);

      // Si hay filtro de categoría o se encontró una categoría por nombre
      if (categoryFilter) {
        console.log('Filtrando por categoría:', categoryFilter);
        query = query.eq('category_id', categoryFilter);
      } else if (matchedCategory) {
        query = query.eq('category_id', matchedCategory.id);
      }

      // Solo aplicar búsqueda de texto si hay query y no hay categoría exacta
      if (searchQuery && !categoryFilter && !matchedCategory) {
        // Búsqueda en múltiples campos (incluyendo nombre de categoría)
        query = query.or(
          `title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%,album.ilike.%${searchQuery}%,category_name.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error en songs_with_details:', error);
        // Si falla, intentar con la tabla songs directamente
        const fallbackQuery = supabase
          .from('songs')
          .select(`
            *,
            categories:category_id (
              name,
              slug,
              color
            ),
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .order('views', { ascending: false })
          .limit(50);

        if (categoryFilter) {
          fallbackQuery.eq('category_id', categoryFilter);
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        
        if (fallbackError) throw fallbackError;
        
        // Transformar los datos al formato esperado
        const transformedData = (fallbackData || []).map((song: any) => ({
          ...song,
          category_name: song.categories?.name || null,
          category_slug: song.categories?.slug || null,
          category_color: song.categories?.color || null,
          uploaded_by: song.profiles?.username || null,
          uploader_avatar: song.profiles?.avatar_url || null,
        }));
        
        setSongs(transformedData);
      } else {
        console.log('Resultados encontrados:', data?.length);
        setSongs(data || []);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce para no hacer demasiadas peticiones
  const debouncedSearch = useCallback(
    debounce((q: string, cat: string) => searchSongs(q, cat), 300),
    []
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value, selectedCategory);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    searchSongs(query, categoryId);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Barra de búsqueda */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-xl"></div>
          <div className="relative flex items-center bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-xl rounded-full border border-white/20 overflow-hidden shadow-2xl">
            <div className="pl-6 pr-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="¿Qué quieres escuchar?"
              className="flex-1 py-4 px-2 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSongs([]);
                  setShowResults(false);
                }}
                className="px-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtro por categorías */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-3 pb-4 min-w-max">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-6 py-2 rounded-full font-medium transition-all backdrop-blur-md ${
              selectedCategory === ''
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap backdrop-blur-md ${
                selectedCategory === cat.id
                  ? 'text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
              style={
                selectedCategory === cat.id
                  ? { backgroundColor: cat.color }
                  : {}
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {!loading && showResults && songs.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No se encontraron resultados</h3>
          <p className="text-gray-500">Intenta con otros términos de búsqueda</p>
        </div>
      )}

      {!loading && songs.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white mb-4">
            {songs.length} {songs.length === 1 ? 'resultado' : 'resultados'}
          </h2>
          
          {/* Lista de canciones */}
          <div className="bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            {songs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-4 hover:bg-white/10 transition-colors group cursor-pointer"
              >
                {/* Número/Play button */}
                <div className="w-8 text-center">
                  <span className="text-gray-400 group-hover:hidden">{index + 1}</span>
                  <button className="hidden group-hover:block text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>

                {/* Cover y título */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{song.title}</p>
                    <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                  </div>
                </div>

                {/* Álbum */}
                <div className="hidden md:block flex-1 min-w-0">
                  <p className="text-gray-400 text-sm truncate">{song.album || '-'}</p>
                </div>

                {/* Categoría */}
                {song.category_name && (
                  <div className="hidden lg:block">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: song.category_color || '#1DB954' }}
                    >
                      {song.category_name}
                    </span>
                  </div>
                )}

                {/* Vistas */}
                <div className="hidden sm:flex items-center gap-1 text-gray-400 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{song.views.toLocaleString()}</span>
                </div>

                {/* Likes */}
                <div className="hidden sm:flex items-center gap-1 text-gray-400 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{song.likes.toLocaleString()}</span>
                </div>

                {/* Duración */}
                <div className="text-gray-400 text-sm w-12 text-right">
                  {formatDuration(song.duration)}
                </div>

                {/* Menú */}
                <button className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categorías cuando no hay búsqueda */}
      {!showResults && !loading && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Explorar por categoría</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
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
                <div className="relative h-full p-4 flex items-end">
                  <h3 className="text-white font-bold text-xl drop-shadow-lg">{cat.name}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
