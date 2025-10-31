import { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { type Song as SupabaseSong } from '@/lib/supabase';
import { Eye, Heart, X } from '@/components/icons';

// Type guard para verificar si es una canción de Supabase
function isSupabaseSong(song: any): song is SupabaseSong {
  return song && 'audio_url' in song;
}

export default function NowPlaying() {
  const { currentMusic, isPlaying, setIsPlaying, showNowPlaying, setShowNowPlaying, isFavorite, toggleFavorite } = usePlayerStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ajustar el margen del contenido principal cuando el panel esté abierto
  useEffect(() => {
    const app = document.getElementById('app');
    const mainContent = document.getElementById('main-content');
    
    if (showNowPlaying && app && mainContent) {
      const panelWidth = isExpanded ? '420px' : '355px';
      app.style.marginRight = panelWidth;
      mainContent.style.marginRight = '0';
    } else if (app && mainContent) {
      app.style.marginRight = '0';
      mainContent.style.marginRight = '0';
    }

    return () => {
      if (app && mainContent) {
        app.style.marginRight = '0';
        mainContent.style.marginRight = '0';
      }
    };
  }, [showNowPlaying, isExpanded]);

  // Sincronizar video con estado de reproducción
  useEffect(() => {
    const song = currentMusic?.song;
    if (!videoRef.current || !song || !isSupabaseSong(song) || !song.video_url) return;

    if (isPlaying) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, currentMusic?.song]);

  // Detener video cuando cambia la canción
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [currentMusic?.song?.id]);

  // Función para mostrar notificación temporal
  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Copiar enlace de la canción
  const handleCopyLink = async () => {
    const song = currentMusic?.song;
    if (!song || !('id' in song)) return;
    
    const url = `${window.location.origin}/song/${song.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showNotification('Enlace copiado al portapapeles');
    } catch (error) {
      console.error('Error copying link:', error);
      showNotification('Error al copiar enlace');
    }
  };

  // Compartir canción
  const handleShare = async () => {
    const song = currentMusic?.song;
    if (!song || !isSupabaseSong(song)) return;

    const shareData = {
      title: song.title,
      text: `Escucha "${song.title}" de ${song.artist}`,
      url: `${window.location.origin}/song/${song.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showNotification('Compartido exitosamente');
      } else {
        // Fallback: copiar al portapapeles
        await handleCopyLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Descargar canción
  const handleDownload = () => {
    const song = currentMusic?.song;
    if (!song || !isSupabaseSong(song)) return;

    if (song.audio_url) {
      const link = document.createElement('a');
      link.href = song.audio_url;
      link.download = `${song.artist} - ${song.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Descargando canción...');
    }
  };

  // Agregar a cola
  const handleAddToQueue = () => {
    showNotification('Agregado a la cola');
    setShowMenu(false);
  };

  // Ir al artista
  const handleGoToArtist = () => {
    const song = currentMusic?.song;
    if (!song || !isSupabaseSong(song)) return;
    window.location.href = `/artist/${song.artist}`;
  };

  if (!currentMusic?.song || !showNowPlaying) return null;

  const { song } = currentMusic;
  
  // Solo mostrar para canciones de Supabase
  if (!isSupabaseSong(song)) return null;

  return (
    <aside
className={`h-full backdrop-blur-xl border-l border-white/20 transition-all duration-300 z-40 overflow-hidden ${
          isExpanded ? 'w-[420px]' : 'w-[280px]'
        }`}
      >

        {/* Fondo con gradiente transparente y luces neón animadas */}      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 pointer-events-none" />
      
      {/* Luces neón animadas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Luz verde 1 - superior derecha */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-500/30 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '3s' }} />
        
        {/* Luz blanca 1 - centro */}
        <div className="absolute top-1/3 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '4s', animationDelay: '1s' }} />
        
        {/* Luz verde 2 - inferior izquierda */}
        <div className="absolute bottom-20 -left-20 w-56 h-56 bg-green-400/25 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '2s' }} />
        
        {/* Luz blanca 2 - inferior derecha */}
        <div className="absolute bottom-40 -right-10 w-48 h-48 bg-white/15 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
        
        {/* Luz verde 3 - centro derecha */}
        <div className="absolute top-1/2 -right-16 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '4.5s', animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <button
          onClick={() => setShowNowPlaying(false)}
          className="p-2 hover:bg-white/5 rounded-full transition-colors group"
          aria-label="Cerrar vista"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 text-center">
          <h2 className="text-sm font-semibold truncate">{song.title}</h2>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Botón de menú de opciones */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
              aria-label="Más opciones"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M16 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
              </svg>
            </button>

            {/* Menú desplegable */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 py-2 z-50">
                <button
                  onClick={() => { handleShare(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
                  </svg>
                  Compartir
                </button>
                <button
                  onClick={() => { handleCopyLink(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
                    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
                  </svg>
                  Copiar enlace
                </button>
                <button
                  onClick={() => { handleDownload(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
                  </svg>
                  Descargar
                </button>
                <button
                  onClick={handleAddToQueue}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5" />
                  </svg>
                  Agregar a cola
                </button>
                <button
                  onClick={() => { handleGoToArtist(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                  </svg>
                  Ir al artista
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
            aria-label="Expandir vista"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.53 9.47a.75.75 0 0 1 0 1.06l-2.72 2.72h1.018a.75.75 0 0 1 0 1.5H1.25v-3.579a.75.75 0 0 1 1.5 0v1.018l2.72-2.72a.75.75 0 0 1 1.06 0zm2.94-2.94a.75.75 0 0 1 0-1.06l2.72-2.72h-1.018a.75.75 0 1 1 0-1.5h3.578v3.579a.75.75 0 0 1-1.5 0V3.81l-2.72 2.72a.75.75 0 0 1-1.06 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="overflow-y-auto overflow-x-hidden h-[calc(100vh-80px)]">
        {/* Cover / Video Canvas con overlay de título y artista */}
        <div className="relative h-[70vh] w-full bg-zinc-800 overflow-hidden">
          {song.video_url ? (
            <video
              ref={videoRef}
              src={song.video_url}
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : song.cover_url ? (
            <img
              src={song.cover_url}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5z" />
              </svg>
            </div>
          )}
          {/* Overlay con gradiente y texto */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 flex flex-col justify-end p-6 pointer-events-none">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {song.title}
              </h1>
              <p className="text-lg text-white/90 drop-shadow-md">
                {song.artist}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional de la canción */}
        <div className="relative p-6 bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm">
          {/* Botones de acción */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
              aria-label="Compartir"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
              </svg>
            </button>
            <button
              onClick={toggleFavorite}
            className={`p-2 hover:bg-white/5 rounded-full transition-colors ${
                isFavorite ? 'text-green-500' : 'text-gray-400'
`              }`}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart 
                className="w-5 h-5" 
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke={isFavorite ? 'none' : 'currentColor'}
              />
            </button>
          </div>

          {/* Estadísticas */}
          {(song.views > 0 || song.likes > 0) && (
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              {song.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {song.views.toLocaleString()} vistas
                </span>
              )}
              {song.likes > 0 && (
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" fill="currentColor" />
                  {song.likes.toLocaleString()} likes
                </span>
              )}
            </div>
          )}

          {/* Letra (si existe) */}
          {song.lyrics && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3">Letra</h3>
              <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                {song.lyrics}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notificación Toast */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
 d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                        span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
