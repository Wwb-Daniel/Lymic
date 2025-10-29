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

  // Cargar audio cuando cambia la canción
  useEffect(() => {
    const song = currentMusic?.song;
    if (!audioRef.current || !song) return;

    // Verificar si es una canción de Supabase (tiene audio_url) o local
    if ('audio_url' in song && song.audio_url) {
      audioRef.current.src = song.audio_url;
    } else if ('id' in song) {
      audioRef.current.src = `/music/${currentMusic.playlist?.id}/0${song.id}.mp3`;
    }

    audioRef.current.load();
    setHasRestoredTime(false);
  }, [currentMusic?.song]);

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

  // Controlar play/pause
  useEffect(() => {
    if (!audioRef.current || !currentMusic?.song) return;

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
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

    const updateTime = () => {
      if (!isSeeking) {
        const time = audio.currentTime;
        setCurrentTime(time);
        // Guardar el tiempo en el store cada segundo
        if (Math.floor(time) % 1 === 0) {
          setSavedTime(time);
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

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('durationchange', updateDuration);

    // Actualizar duración inmediatamente si ya está disponible
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('durationchange', updateDuration);
    };
  }, [isSeeking, currentMusic?.song]);

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
      <audio
        ref={audioRef}
        onEnded={handleEnded}
      />

      <div className="h-full flex items-center justify-between gap-4">
        {/* Información de la canción - Izquierda */}
        <div className="flex items-center gap-3 min-w-[180px] w-[30%]">
          {/* Cover */}
          <div className="w-14 h-14 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
            {songCover ? (
              <img src={songCover} alt={songTitle} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{songTitle}</div>
            <div className="text-xs text-gray-400 truncate">{songArtist}</div>
          </div>

          {/* Like button */}
          <button 
            onClick={toggleFavorite}
            className={`p-2 transition-colors ${isFavorite ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart 
              className="w-4 h-4" 
              fill={isFavorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Controles - Centro */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[722px]">
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
        <div className="flex items-center gap-2 min-w-[180px] w-[30%] justify-end">
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
