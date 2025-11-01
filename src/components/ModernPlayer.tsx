import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize2,
  Heart,
  Music
} from '@/components/icons';

export default function ModernPlayer() {
  const { currentMusic, isPlaying, volume, setIsPlaying, setVolume, setCurrentMusic, showNowPlaying, setShowNowPlaying, isFavorite, toggleFavorite, currentTime: savedTime, setCurrentTime: setSavedTime } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const [hasRestoredTime, setHasRestoredTime] = useState(false);
  const [didBlobFallback, setDidBlobFallback] = useState(false);

  // Cargar audio cuando cambia la canción
  useEffect(() => {
    const song = currentMusic?.song;
    if (!audioRef.current || !song) return;

    // Verificar si es la misma canción (mismo ID y misma URL)
    const isSameSong = audioRef.current.src && 
      ((song.audio_url && audioRef.current.src.includes(song.audio_url)) ||
       (song.id && audioRef.current.src.includes(song.id.toString())));

    // Si es la misma canción, no recargar el audio
    if (isSameSong) {
      console.log('🎵 Same song, not reloading audio');
      return;
    }

    console.log('🎵 Loading song:', song);
    console.log('🎵 Has audio_url?', 'audio_url' in song, song.audio_url);
    console.log('🎵 isPlaying:', isPlaying);

    // Verificar si es una canción de Supabase (tiene audio_url) o local
    if ('audio_url' in song && song.audio_url) {
      console.log('✅ Using Supabase audio_url:', song.audio_url);
      audioRef.current.src = song.audio_url;
    } else if ('id' in song) {
      const localPath = `/music/${currentMusic.playlist?.id}/0${song.id}.mp3`;
      console.log('📁 Using local path:', localPath);
      audioRef.current.src = localPath;
    } else {
      console.error('❌ No audio source available for song:', song);
      return;
    }

    audioRef.current.muted = false;
    audioRef.current.defaultMuted = false;
    audioRef.current.volume = volume;
    // Hint type to some browsers
    try { audioRef.current.setAttribute('type', 'audio/mpeg'); } catch {}
    
    const handleLoadedData = () => {
      console.log('🎵 Audio loaded, attempting to play');
      // Restaurar tiempo guardado si existe
      if (savedTime > 0 && !hasRestoredTime) {
        audioRef.current!.currentTime = savedTime;
        setHasRestoredTime(true);
      }
      if (isPlaying) {
        audioRef.current?.play().catch(err => {
          console.error('❌ Error playing audio:', err);
        });
      }
    };

    const handleCanPlay = () => {
      console.log('🎵 Audio can play');
      // Restaurar tiempo guardado si existe
      if (savedTime > 0 && !hasRestoredTime) {
        audioRef.current!.currentTime = savedTime;
        setHasRestoredTime(true);
      }
      if (isPlaying && audioRef.current) {
        audioRef.current.play().catch(err => {
          console.error('❌ Error playing audio on canplay:', err);
        });
      }
    };

    audioRef.current.addEventListener('loadeddata', handleLoadedData);
    audioRef.current.addEventListener('canplay', handleCanPlay);
    
    audioRef.current.load();
    setHasRestoredTime(false);
    setDidBlobFallback(false);

    return () => {
      audioRef.current?.removeEventListener('loadeddata', handleLoadedData);
      audioRef.current?.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentMusic?.song?.id, isPlaying, volume, savedTime, hasRestoredTime]);

  // Restaurar tiempo guardado cuando el audio esté listo
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentMusic?.song || hasRestoredTime) return;

    const handleCanPlay = () => {
      if (savedTime > 0 && !hasRestoredTime) {
        audio.currentTime = savedTime;
        setCurrentTime(savedTime);
        setHasRestoredTime(true);
      }
      if (isPlaying) {
        audio.play().catch(console.error);
      }
    };

    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentMusic?.song, savedTime, isPlaying, hasRestoredTime]);

  // Controlar play/pause y guardar tiempo actual
  useEffect(() => {
    if (!audioRef.current || !currentMusic?.song) return;

    if (isPlaying) {
      // Solo restaurar tiempo si es significativamente diferente (más de 1 segundo)
      // Esto evita saltos innecesarios al cambiar entre play/pause rápidamente
      if (savedTime > 0 && Math.abs(audioRef.current.currentTime - savedTime) > 1) {
        audioRef.current.currentTime = savedTime;
      }
      audioRef.current.play().catch(console.error);
    } else {
      // Guardar tiempo actual cuando se pausa
      const currentTime = audioRef.current.currentTime;
      if (currentTime > 0 && !isNaN(currentTime)) {
        setSavedTime(currentTime);
      }
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Controlar volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Actualizar tiempo actual
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentMusic?.song) return;

    // Guardar tiempo cuando se pausa
    const handlePause = () => {
      if (audio.currentTime > 0) {
        setSavedTime(audio.currentTime);
      }
    };

    // Guardar tiempo cuando se detiene
    const handleTimeUpdate = () => {
      if (!isSeeking && audio.currentTime > 0) {
        setCurrentTime(audio.currentTime);
        // Guardar periódicamente (cada segundo aproximadamente)
        const currentSeconds = Math.floor(audio.currentTime);
        const savedSeconds = Math.floor(savedTime);
        if (currentSeconds !== savedSeconds) {
          setSavedTime(audio.currentTime);
        }
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const handleCanPlay = () => {
      // Asegurar que la duración se actualice cuando el audio esté listo
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('durationchange', updateDuration);

    // Actualizar duración inmediatamente si ya está disponible
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('durationchange', updateDuration);
    };
  }, [isSeeking, currentMusic?.song, savedTime]);

  // Siguiente canción automática
  const handleEnded = () => {
    const { songs } = currentMusic;
    if (songs && songs.length > 0) {
      const currentIndex = songs.findIndex(s => s.id === currentMusic.song?.id);
      const nextIndex = (currentIndex + 1) % songs.length;
      const nextSong = songs[nextIndex];
      setCurrentMusic({ ...currentMusic, song: nextSong });
    } else {
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    const { songs } = currentMusic;
    if (songs && songs.length > 0) {
      const currentIndex = songs.findIndex(s => s.id === currentMusic.song?.id);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
      const prevSong = songs[prevIndex];
      setCurrentMusic({ ...currentMusic, song: prevSong });
    }
  };

  const handleNext = () => {
    const { songs } = currentMusic;
    if (songs && songs.length > 0) {
      const currentIndex = songs.findIndex(s => s.id === currentMusic.song?.id);
      const nextIndex = (currentIndex + 1) % songs.length;
      const nextSong = songs[nextIndex];
      setCurrentMusic({ ...currentMusic, song: nextSong });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) {
      return <VolumeX className="w-4 h-4" />;
    } else if (volume < 0.5) {
      return <Volume1 className="w-4 h-4" />;
    } else {
      return <Volume2 className="w-4 h-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const song = currentMusic?.song;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!song) return null;

  // Type guard para canciones de Supabase
  const isSupabaseSong = (s: any): s is { title: string; artist: string; cover_url?: string } => {
    return s && 'audio_url' in s;
  };

  const songTitle = isSupabaseSong(song) ? song.title : (song as any).title;
  const songArtist = isSupabaseSong(song) ? song.artist : ((song as any).artists?.join(', ') || 'Unknown');
  const songCover = isSupabaseSong(song) ? song.cover_url : (song as any).image;

  return (
    <footer className="h-[80px] bg-black/30 backdrop-blur-md border-t border-white/10 px-4">
      {/* Manejo avanzado de errores del audio */}
      {/* Retenta con ?download=1 para Supabase si falla la primera carga */}
      
      
      <audio
        ref={audioRef}
        preload="auto"
        onError={(e) => {
          const audio = e.currentTarget as HTMLAudioElement;
          const err = audio.error;
          const code = err ? err.code : undefined;
          console.error('Audio error', { src: audio.src, code, error: err });
          // Retry strategy for Supabase public URLs
          try {
            const url = new URL(audio.src);
            if (url.hostname.includes('supabase.co') && !url.searchParams.has('download')) {
              url.searchParams.set('download', '1');
              console.warn('Retrying audio with download=1:', url.toString());
              audio.src = url.toString();
              audio.load();
              if (isPlaying) {
                audio.play().catch(console.error);
              }
              return;
            }
            // Blob fallback for decode errors
            if (code === 3 && url.hostname.includes('supabase.co') && !didBlobFallback) {
              console.warn('Falling back to blob URL for audio decode error');
              setDidBlobFallback(true);
              fetch(audio.src, { mode: 'cors' })
                .then(async (res) => {
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  const blob = await res.blob();
                  const objectUrl = URL.createObjectURL(blob);
                  audio.src = objectUrl;
                  audio.load();
                  if (isPlaying) {
                    audio.play().catch(console.error);
                  }
                })
                .catch((e3) => console.error('Blob fallback failed', e3));
            }
          } catch (e2) {
            console.error('Error while retrying audio load', e2);
          }
        }}
        onEnded={handleEnded}
      />

      <div className="h-full flex items-center justify-between gap-2 sm:gap-4">
        {/* Información de la canción - Izquierda */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 sm:min-w-[180px] w-full sm:w-[30%] flex-1">
          {/* Cover */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
            {songCover ? (
              <img src={songCover} alt={songTitle} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
              </div>
            )}
          </div>
          
          {/* Info móvil - solo título */}
          <div className="flex-1 min-w-0 sm:hidden">
            <div className="text-xs font-medium text-white truncate">{songTitle}</div>
          </div>

          {/* Info Desktop */}
          <div className="flex-1 min-w-0 hidden sm:block">
            <div className="text-xs sm:text-sm font-medium text-white truncate">{songTitle}</div>
            <div className="text-[10px] sm:text-xs text-gray-400 truncate">{songArtist}</div>
          </div>

          {/* Like button - oculto en móvil muy pequeño */}
          <button 
            onClick={toggleFavorite}
            className={`hidden sm:block p-2 transition-colors ${isFavorite ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart 
              className="w-4 h-4" 
              fill={isFavorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Controles móviles - Solo play/pause */}
        <div className="flex sm:hidden items-center justify-center flex-1">
          <button
            onClick={handlePlayPause}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-black" />
            ) : (
              <Play className="w-5 h-5 text-black ml-0.5" />
            )}
          </button>
        </div>

        {/* Controles - Centro (Desktop) */}
        <div className="hidden sm:flex flex-col items-center gap-2 flex-1 max-w-[722px]">
          {/* Botones de control */}
          <div className="flex items-center gap-4">
            {/* Shuffle */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              onClick={handlePrevious}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-black" />
              ) : (
                <Play className="w-4 h-4 text-black ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={handleNext}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Repeat */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 group">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                onMouseDown={() => setIsSeeking(true)}
                onMouseUp={() => setIsSeeking(false)}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0
                  group-hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:transition-opacity"
                style={{
                  background: `linear-gradient(to right, #fff ${progress}%, #4b5563 ${progress}%)`
                }}
              />
            </div>
            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controles adicionales - Derecha */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 sm:min-w-[180px] w-auto sm:w-[30%] justify-end">
          {/* Now Playing */}
          <button
            onClick={() => setShowNowPlaying(!showNowPlaying)}
            className={`p-2 transition-colors ${showNowPlaying ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.196 8 6 5v6z" />
              <path d="M15.002 1.75A1.75 1.75 0 0 0 13.252 0h-10.5a1.75 1.75 0 0 0-1.75 1.75v12.5c0 .966.783 1.75 1.75 1.75h10.5a1.75 1.75 0 0 0 1.75-1.75zm-1.75-.25a.25.25 0 0 1 .25.25v12.5a.25.25 0 0 1-.25.25h-10.5a.25.25 0 0 1-.25-.25V1.75a.25.25 0 0 1 .25-.25z" />
            </svg>
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 group">
            <button 
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label={volume === 0 ? 'Activar sonido' : 'Silenciar'}
            >
              {getVolumeIcon()}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              style={{
                background: `linear-gradient(to right, #fff ${volume * 100}%, #4b5563 ${volume * 100}%)`
              }}
            />
          </div>

          {/* Fullscreen */}
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
