import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface LibraryItem {
  id: string;
  title: string;
  type: 'playlist' | 'album' | 'artist';
  subtitle: string;
  image?: string;
  isPinned?: boolean;
}

export default function Library() {
  const { user } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLibrary();
    }
  }, [user]);

  const loadLibrary = async () => {
    try {
      // Cargar canciones del usuario
      const { data: songs } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (songs) {
        const libraryItems: LibraryItem[] = songs.map(song => ({
          id: song.id,
          title: song.title,
          type: 'album' as const,
          subtitle: song.artist,
          image: song.cover_url,
        }));
        setItems(libraryItems);
      }
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside
      className={`bg-black/30 backdrop-blur-md rounded-lg transition-all duration-300 ${
        isExpanded ? 'w-[420px]' : 'w-[72px]'
      }`}
    >
      <nav className="h-full flex flex-col">
        {/* Header */}
        <header className="p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              aria-label={isExpanded ? 'Contraer Tu biblioteca' : 'Expandir Tu biblioteca'}
            >
              {/* Icono de biblioteca */}
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3a1 1 0 0 1 .5-.866M16 4.732V20h4V7.041zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1m6 0a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1" />
              </svg>
              
              {isExpanded && (
                <>
                  <span className="font-semibold text-white">Tu biblioteca</span>
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.457 15.207a1 1 0 0 1-1.414-1.414L14.836 12l-1.793-1.793a1 1 0 0 1 1.414-1.414l2.5 2.5a1 1 0 0 1 0 1.414z" />
                    <path d="M20 22a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2zM4 20V4h4v16zm16 0H10V4h10z" />
                  </svg>
                </>
              )}
            </button>

            {isExpanded && (
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Crear playlist"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* Lista de items */}
        {isExpanded && (
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-gray-400 text-sm mb-4">
                  Tu biblioteca está vacía
                </p>
                <a
                  href="/upload"
                  className="inline-block px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:scale-105 transition-transform"
                >
                  Subir música
                </a>
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => (
                  <LibraryItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer (si está expandido) */}
        {isExpanded && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Legal</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Centro de privacidad</a>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}

// Componente para cada item de la biblioteca
function LibraryItem({ item }: { item: LibraryItem }) {
  return (
    <div
      className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 cursor-pointer group transition-colors"
      role="button"
      tabIndex={0}
    >
      {/* Imagen */}
      <div className="w-12 h-12 rounded flex-shrink-0 bg-zinc-800 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.title}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {item.isPinned && (
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.822.797a2.72 2.72 0 0 1 3.847 0l2.534 2.533a2.72 2.72 0 0 1 0 3.848l-3.678 3.678-1.337 4.988-4.486-4.486L1.28 15.78a.75.75 0 0 1-1.06-1.06l4.422-4.422L.156 5.812l4.987-1.337z" />
            </svg>
          )}
          <span className="truncate">
            {item.type === 'playlist' && 'Lista'}
            {item.type === 'album' && 'Álbum'}
            {item.type === 'artist' && 'Artista'}
            {item.subtitle && ` • ${item.subtitle}`}
          </span>
        </div>
      </div>
    </div>
  );
}
