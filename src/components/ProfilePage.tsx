import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase, type SongWithDetails } from '@/lib/supabase';
import { usePlayerStore } from '@/store/playerStore';
import { Eye, Heart, Play, Music, User, Edit, Camera } from '@/components/icons';

export default function ProfilePage() {
  const { user, profile, updateProfile, fetchProfile } = useAuthStore();
  const { playSong } = usePlayerStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para favoritos e historial
  const [favorites, setFavorites] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_favorites: 0,
    total_plays: 0,
    total_views: 0,
    total_likes: 0,
  });
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  useEffect(() => {
    if (profile) {
      setNewName(profile.full_name || profile.username || '');
    }
  }, [profile]);

  // Cargar favoritos, historial y estadísticas
  useEffect(() => {
    if (user) {
      loadFavorites();
      loadHistory();
      loadStats();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites_with_details')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setFavorites(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('history_with_details')
        .select('*')
        .eq('user_id', user?.id)
        .order('played_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_stats', { user_uuid: user?.id });

      if (error) throw error;
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlaySong = async (song: any, list: any[]) => {
    try {
      console.log('🎵 handlePlaySong called with:', song);
      console.log('🎵 Song structure:', Object.keys(song));
      
      // Determinar el ID de la canción (puede ser song_id o id dependiendo de la vista)
      const songId = song.song_id || song.id;
      
      if (!songId) {
        console.error('❌ No song ID found in:', song);
        return;
      }

      console.log('🎵 Loading song with ID:', songId);

      // Cargar la canción completa desde la base de datos para obtener el audio_url
      const { data: fullSong, error } = await supabase
        .from('songs_with_details')
        .select('*')
        .eq('id', songId)
        .single();

      if (error) {
        console.error('❌ Error loading song:', error);
        // Si falla songs_with_details, intentar con la tabla songs directamente
        const { data: fallbackSong, error: fallbackError } = await supabase
          .from('songs')
          .select('*')
          .eq('id', songId)
          .single();
        
        if (fallbackError) {
          console.error('❌ Error loading song from fallback:', fallbackError);
          return;
        }
        
        if (!fallbackSong) {
          console.error('❌ Song not found in fallback');
          return;
        }
        
        console.log('✅ Song loaded from fallback:', fallbackSong);
        playSong(fallbackSong as any, [fallbackSong] as any);
        return;
      }

      if (!fullSong) {
        console.error('❌ Song not found');
        return;
      }

      console.log('✅ Song loaded:', fullSong);

      // Cargar todas las canciones de la lista con sus URLs
      const songIds = list.map(s => s.song_id || s.id).filter(Boolean);
      const { data: fullSongs, error: listError } = await supabase
        .from('songs_with_details')
        .select('*')
        .in('id', songIds);

      if (listError) {
        console.error('⚠️ Error loading songs list:', listError);
      }

      // Usar las canciones completas o solo la canción actual
      const songsToPlay = fullSongs || [fullSong];

      console.log('🎵 Playing song:', fullSong.title, 'from list of', songsToPlay.length);
      playSong(fullSong as any, songsToPlay as any);
    } catch (err) {
      console.error('❌ Error playing song:', err);
    }
  };

  // Verificar si han pasado 7 días desde la última actualización
  const canEditName = () => {
    if (!profile?.name_updated_at) return true;
    const lastUpdate = new Date(profile.name_updated_at);
    const now = new Date();
    const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= 7;
  };

  const canEditAvatar = () => {
    if (!profile?.avatar_updated_at) return true;
    const lastUpdate = new Date(profile.avatar_updated_at);
    const now = new Date();
    const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= 7;
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }

    if (!canEditName()) {
      setError('Solo puedes cambiar tu nombre cada 7 días');
      return;
    }

    try {
      console.log('Actualizando nombre a:', newName);
      console.log('Usuario ID:', user?.id);
      console.log('Datos a actualizar:', {
        full_name: newName,
        name_updated_at: new Date().toISOString(),
      });
      
      await updateProfile({
        full_name: newName,
        name_updated_at: new Date().toISOString(),
      });
      
      console.log('✅ Perfil actualizado, refrescando...');
      
      // Refrescar el perfil para obtener los datos actualizados
      await fetchProfile();
      
      console.log('✅ Perfil refrescado');
      
      setSuccess('Nombre actualizado correctamente');
      setIsEditingName(false);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ Error completo al actualizar nombre:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error details:', err.details);
      console.error('❌ Error hint:', err.hint);
      setError(err.message || err.details || 'Error al actualizar el nombre');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!canEditAvatar()) {
      setError('Solo puedes cambiar tu foto cada 7 días');
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen debe ser menor a 2MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }

    setIsUploadingAvatar(true);
    setError('');

    try {
      // Subir imagen a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Actualizar perfil
      console.log('Actualizando avatar URL:', data.publicUrl);
      await updateProfile({
        avatar_url: data.publicUrl,
        avatar_updated_at: new Date().toISOString(),
      });

      // Refrescar el perfil para obtener los datos actualizados
      await fetchProfile();

      setSuccess('Foto actualizada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error al subir avatar:', err);
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || user.email || 'Usuario';
  const daysUntilNameEdit = canEditName() ? 0 : Math.ceil(7 - (new Date().getTime() - new Date(profile.name_updated_at!).getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilAvatarEdit = canEditAvatar() ? 0 : Math.ceil(7 - (new Date().getTime() - new Date(profile.avatar_updated_at!).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen">
      {/* Header con fondo y overlays */}
      <div className="relative">
        {/* Fondo superior (usa avatar como fallback) */}
        <div className="absolute inset-0 h-[260px] md:h-[320px] overflow-hidden rounded-b-2xl">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-full h-full object-cover blur-lg scale-110 opacity-70"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-700/40 via-fuchsia-700/30 to-emerald-700/30" />
          )}
          {/* Overlay de degradados para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(29,185,84,0.25),_transparent_60%)]" />
        </div>

        {/* Contenido del header sobre el fondo */}
        <div className="relative px-6 pt-24 md:pt-32 pb-6">
          <div className="flex items-end gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-56 h-56 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-32 h-32 text-white" />
              )}
            </div>
            
            {/* Botón para cambiar foto */}
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={!canEditAvatar() || isUploadingAvatar}
                  className="hidden"
                />
                <div className="text-center">
                  <Camera className="w-12 h-12 text-white mx-auto mb-2" />
                  <span className="text-white font-semibold">
                    {isUploadingAvatar ? 'Subiendo...' : 'Elegir foto'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Info del perfil */}
          <div className="flex-1 pb-6">
            <p className="text-sm font-semibold mb-2">Perfil</p>
            
            {/* Nombre editable */}
            {isEditingName ? (
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-6xl font-bold bg-transparent border-b-2 border-white outline-none"
                  autoFocus
                />
                <button
                  onClick={handleUpdateName}
                  className="px-4 py-2 bg-green-500 text-black font-semibold rounded-full hover:bg-green-400"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setNewName(profile.full_name || profile.username || '');
                  }}
                  className="px-4 py-2 bg-zinc-700 text-white font-semibold rounded-full hover:bg-zinc-600"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => canEditName() && setIsEditingName(true)}
                disabled={!canEditName()}
                className="group"
                title={!canEditName() ? `Podrás editar en ${daysUntilNameEdit} días` : 'Editar nombre'}
              >
                <h1 className="text-6xl font-bold mb-4 group-hover:underline">
                  {displayName}
                </h1>
              </button>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span>{user.email}</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-500">
          {error}
        </div>
      )}
      {success && (
        <div className="mx-6 mb-4 p-4 bg-green-500/10 border border-green-500 rounded text-green-500">
          {success}
        </div>
      )}

      {/* Estadísticas */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
            <p className="text-sm text-gray-400">Favoritos</p>
            <p className="text-3xl font-bold text-green-500">{stats.total_favorites}</p>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
            <p className="text-sm text-gray-400">Reproducciones</p>
            <p className="text-3xl font-bold text-blue-500">{stats.total_plays}</p>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
            <p className="text-sm text-gray-400">Vistas Totales</p>
            <p className="text-3xl font-bold text-purple-500">{stats.total_views.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
            <p className="text-sm text-gray-400">Me Gusta</p>
            <p className="text-3xl font-bold text-pink-500">{stats.total_likes.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs de Favoritos e Historial */}
      <div className="px-6">
        <div className="flex gap-4 border-b border-white/10 mb-4">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === 'favorites'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Favoritos ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === 'history'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Historial ({history.length})
          </button>
        </div>

        {/* Lista de canciones */}
        <div className="space-y-2 pb-8">
          {activeTab === 'favorites' && favorites.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No tienes canciones favoritas aún</p>
            </div>
          )}
          
          {activeTab === 'history' && history.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No has reproducido ninguna canción aún</p>
            </div>
          )}

          {activeTab === 'favorites' && favorites.map((song, index) => (
            <div
              key={song.id}
              onClick={() => handlePlaySong(song, favorites)}
              className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-white/5 to-transparent backdrop-blur-md hover:bg-white/10 transition-colors group border border-white/5 cursor-pointer"
            >
              <span className="text-gray-400 w-8 text-center">{index + 1}</span>
              
              {song.cover_url ? (
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-zinc-700 flex items-center justify-center">
                  <Music className="w-6 h-6 text-gray-500" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>

              <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{song.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" fill="currentColor" />
                  <span>{song.likes.toLocaleString()}</span>
                </div>
                <span>{formatDuration(song.duration)}</span>
              </div>

              <button
                onClick={() => handlePlaySong(song, favorites)}
                className="opacity-0 group-hover:opacity-100 p-2 bg-green-500 rounded-full hover:bg-green-400 transition-all"
              >
                <Play className="w-5 h-5 text-black fill-black" />
              </button>
            </div>
          ))}

          {activeTab === 'history' && history.map((song, index) => (
            <div
              key={song.id}
              onClick={() => handlePlaySong(song, history)}
              className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-white/5 to-transparent backdrop-blur-md hover:bg-white/10 transition-colors group border border-white/5 cursor-pointer"
            >
              <span className="text-gray-400 w-8 text-center">{index + 1}</span>
              
              {song.cover_url ? (
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-zinc-700 flex items-center justify-center">
                  <Music className="w-6 h-6 text-gray-500" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>

              <div className="hidden md:block text-sm text-gray-400">
                {new Date(song.played_at).toLocaleDateString()}
              </div>

              <button
                onClick={() => handlePlaySong(song, history)}
                className="opacity-0 group-hover:opacity-100 p-2 bg-green-500 rounded-full hover:bg-green-400 transition-all"
              >
                <Play className="w-5 h-5 text-black fill-black" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
