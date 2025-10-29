import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase, uploadFile, getPublicUrl } from '@/lib/supabase';
import { Music, User, Album, Tag, FileText, Upload, Image, Video, CheckCircle2, XCircle, Loader2, Play, Zap, Shield, Infinity } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export default function UploadForm() {
  const { user, initialized } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [lyrics, setLyrics] = useState('');
  
  // Files
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Previews
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, color')
      .order('name');

    if (data) setCategories(data);
    if (error) console.error('Error loading categories:', error);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Debes iniciar sesión para subir música');
      return;
    }

    if (!audioFile) {
      setError('Debes seleccionar un archivo de audio');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log(' Iniciando subida de música...');
      
      // 1. Subir audio
      setUploadProgress('Subiendo audio...');
      console.log(' Subiendo audio...', audioFile.name);
      const audioPath = `${user.id}/${Date.now()}-${audioFile.name}`;
      const audioUpload = await uploadFile('song-audio', audioPath, audioFile);
      console.log(' Audio subido:', audioUpload);
      const audioUrl = getPublicUrl('song-audio', audioPath);
      console.log(' Audio URL:', audioUrl);

      // 2. Subir cover (opcional)
      let coverUrl = null;
      if (coverFile) {
        setUploadProgress('Subiendo portada...');
        console.log(' Subiendo portada...', coverFile.name);
        const coverPath = `${user.id}/${Date.now()}-${coverFile.name}`;
        await uploadFile('song-covers', coverPath, coverFile);
        coverUrl = getPublicUrl('song-covers', coverPath);
        console.log(' Portada subida:', coverUrl);
      }

      // 3. Subir video (opcional)
      let videoUrl = null;
      if (videoFile) {
        setUploadProgress('Subiendo video...');
        console.log(' Subiendo video...', videoFile.name);
        const videoPath = `${user.id}/${Date.now()}-${videoFile.name}`;
        await uploadFile('song-videos', videoPath, videoFile);
        videoUrl = getPublicUrl('song-videos', videoPath);
        console.log(' Video subido:', videoUrl);
      }

      // 4. Obtener duración del audio
      setUploadProgress('Procesando audio...');
      console.log(' Obteniendo duración del audio...');
      const audio = new Audio(URL.createObjectURL(audioFile));
      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', resolve);
      });
      const duration = Math.floor(audio.duration);
      console.log(' Duración:', duration, 'segundos');

      // 5. Crear registro en la base de datos
      setUploadProgress('Guardando en base de datos...');
      console.log(' Guardando en base de datos...');
      const songData = {
        user_id: user.id,
        title,
        artist,
        album: album || null,
        category_id: categoryId || null,
        lyrics: lyrics || null,
        audio_url: audioUrl,
        cover_url: coverUrl,
        video_url: videoUrl,
        duration,
      };
      console.log(' Datos de la canción:', songData);
      
      const { data, error: dbError } = await supabase.from('songs').insert(songData).select();
      
      if (dbError) {
        console.error(' Error en base de datos:', dbError);
        throw dbError;
      }

      console.log(' Canción guardada:', data);
      setUploadProgress('');
      setSuccess(true);
      
      // Redirigir a la página de inicio después de 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (err: any) {
      console.error('Error uploading:', err);
      setError(err.message || 'Error al subir la música. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Inicia sesión para subir música</h2>
          <p className="text-gray-400 mb-6">Necesitas una cuenta para compartir tu música con el mundo</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-full transition-all transform hover:scale-105"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header simple y profesional */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Subir música
        </h1>
        <p className="text-gray-400">
          Completa la información de tu canción para compartirla con tu audiencia
        </p>
      </div>

      {/* Formulario limpio y profesional */}
      <div className="bg-gradient-to-br from-black/20 via-black/10 to-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Sección: Información básica */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-green-500" />
                Detalles de la canción
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Título de la canción *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  placeholder="Mi canción increíble"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Artista *
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  placeholder="Tu nombre artístico"
                  required
                />
              </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Álbum
                </label>
                <input
                  type="text"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  placeholder="Nombre del álbum (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Categoría
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white transition-all cursor-pointer"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              </div>
            </div>

            {/* Letra (opcional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Letra de la canción
              </label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 bg-zinc-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-500 transition-all resize-none"
                placeholder="Escribe la letra aquí (opcional)"
              />
              </div>

            {/* Sección: Archivos multimedia */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-500" />
                Archivos
              </h2>

              {/* Audio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Archivo de audio * (MP3, WAV, OGG)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="audio-upload"
                    required
                  />
                  <label
                    htmlFor="audio-upload"
                    className="group flex items-center justify-center w-full px-6 py-6 bg-zinc-800/30 border-2 border-dashed border-white/20 rounded-xl hover:border-green-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer"
                  >
                    <div className="text-center">
                      <Music className="w-12 h-12 mx-auto text-gray-400 group-hover:text-green-500 mb-2 transition-colors" strokeWidth={1.5} />
                      <p className="text-white font-medium mb-1">
                        {audioFile ? audioFile.name : 'Seleccionar archivo de audio'}
                      </p>
                      <p className="text-gray-500 text-xs">MP3, WAV, OGG • Máx. 50MB</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Cover y Video en grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Cover */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Portada
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="group flex items-center justify-center w-full h-48 bg-zinc-800/30 border-2 border-dashed border-white/20 rounded-xl hover:border-green-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer overflow-hidden"
                    >
                      {coverPreview ? (
                        <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Image className="w-10 h-10 mx-auto text-gray-400 group-hover:text-green-500 mb-1 transition-colors" strokeWidth={1.5} />
                          <p className="text-white text-sm font-medium">Subir imagen</p>
                          <p className="text-gray-500 text-xs mt-0.5">JPG, PNG</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Video Canvas */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Video canvas (opcional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="group flex items-center justify-center w-full h-48 bg-zinc-800/30 border-2 border-dashed border-white/20 rounded-xl hover:border-green-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer overflow-hidden"
                    >
                      {videoPreview ? (
                        <video src={videoPreview} className="w-full h-full object-cover" muted loop autoPlay />
                      ) : (
                        <div className="text-center">
                          <Video className="w-10 h-10 mx-auto text-gray-400 group-hover:text-green-500 mb-1 transition-colors" strokeWidth={1.5} />
                          <p className="text-white text-sm font-medium">Subir video</p>
                          <p className="text-gray-500 text-xs mt-0.5">MP4, WEBM</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2 text-sm">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>¡Música subida exitosamente!</span>
              </div>
            )}

            {/* Botón submit */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>{uploadProgress || 'Subiendo...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Subir canción</span>
                  </>
                )}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
