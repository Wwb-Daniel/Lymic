import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { supabase, type SongWithDetails, type Category } from '@/lib/supabase';
import { usePlayerStore } from '@/store/playerStore';
import { Flame, Sparkles, Music2 } from '@/components/icons';

// Constants
const SONGS_LIMIT = 12;
const CATEGORIES_LIMIT = 8;

export default function HomeContent() {
  const [trendingSongs, setTrendingSongs] = useState<SongWithDetails[]>([]);
  const [recentSongs, setRecentSongs] = useState<SongWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = useCallback(async () => {
    try {
      const [trendingRes, recentRes, catsRes] = await Promise.all([
        supabase.from('songs_with_details').select('id,title,artist,cover_url,audio_url,video_url,views,likes,duration,album').order('views',{ascending:false}).limit(SONGS_LIMIT),
        supabase.from('songs_with_details').select('id,title,artist,cover_url,audio_url,video_url,views,likes,duration,album').order('created_at',{ascending:false}).limit(SONGS_LIMIT),
        supabase.from('categories').select('*').order('name').limit(CATEGORIES_LIMIT)
      ]);

      if (trendingRes.data) setTrendingSongs(trendingRes.data);
      if (recentRes.data) setRecentSongs(recentRes.data);
      if (catsRes.data) setCategories(catsRes.data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-12">
      <div>
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white via-green-400 to-blue-500 bg-clip-text text-transparent">
          {getGreeting()}
        </h1>
        <p className="text-gray-400 text-lg">Descubre nueva musica</p>
      </div>

      {trendingSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Flame className="w-8 h-8 text-orange-500" />
              Tendencias
            </h2>
            <a href="/search" className="text-gray-400 hover:text-white text-sm">Ver todas</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} allSongs={trendingSongs} />
            ))}
          </div>
        </section>
      )}

      {recentSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              Recien Agregadas
            </h2>
            <a href="/search" className="text-gray-400 hover:text-white text-sm">Ver todas</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recentSongs.map((song) => (
              <SongCard key={song.id} song={song} allSongs={recentSongs} />
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <Music2 className="w-8 h-8 text-green-500" />
              Explorar Generos
            </h2>
            <a href="/search" className="text-gray-400 hover:text-white text-sm">Ver todos</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const SongCard = memo(function SongCard({song,allSongs}:{song:SongWithDetails;allSongs?:SongWithDetails[]}){
  const {playSong} = usePlayerStore();
  const [imgLoaded,setImgLoaded] = useState(false);

  const handlePlay = useCallback((e:React.MouseEvent)=>{
    e.stopPropagation();
    playSong(song,allSongs);
  },[song,allSongs,playSong]);

  return (
    <div className="group relative" onClick={handlePlay}>
      <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/20 rounded-xl blur-xl transition-all"></div>
      <div className="relative bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/5">
        <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-purple-500/20">
          {song.cover_url?(
            <><div className={`absolute inset-0 bg-gray-800 ${imgLoaded?'hidden':'block'}`}/>
            <img src={song.cover_url} alt={song.title} loading="lazy" onLoad={()=>setImgLoaded(true)} className="w-full h-full object-cover"/></>
          ):(<div className="w-full h-full flex items-center justify-center"><svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>)}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40"><button onClick={handlePlay} className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg"><svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button></div>
        </div>
        <h3 className="text-white font-semibold truncate">{song.title}</h3>
        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
        <div className="flex gap-3 mt-2 text-xs text-gray-500"><span>{song.views.toLocaleString()}</span><span>{song.likes.toLocaleString()}</span></div>
      </div>
    </div>
  );
});

const CategoryCard = memo(function CategoryCard({category}:{category:Category}){
  const [imgLoaded,setImgLoaded] = useState(false);
  return(
    <a href={`/search?category=${category.id}`} className="relative aspect-square rounded-xl overflow-hidden group">
      <div className={`absolute inset-0 bg-gray-800 ${imgLoaded?'hidden':'block'}`}/>
      {category.icon?<img src={category.icon} alt={category.name} loading="lazy" onLoad={()=>setImgLoaded(true)} className="absolute inset-0 w-full h-full object-cover"/>:<div className="absolute inset-0" style={{backgroundColor:category.color}}/>}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/70"></div>
      <div className="relative h-full p-6 flex items-end"><h3 className="text-white font-bold text-2xl">{category.name}</h3></div>
    </a>
  );
});

function getGreeting(){const h = new Date().getHours();return h<12?'Buenos dias':h<18?'Buenas tardes':'Buenas noches';}
