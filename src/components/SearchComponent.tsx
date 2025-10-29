import {useState,useEffect,memo,useCallback} from 'react';
import debounce from 'lodash.debounce';
import {supabase,type SongWithDetails,type Category} from '@/lib/supabase';
import {usePlayerStore} from '@/store/playerStore';
import {Search,X} from 'lucide-react';

const SEARCH_LIMIT = 20;
const DEBOUNCE_MS = 300;

export default function SearchComponent(){
  const [query,setQuery] = useState('');
  const [songs,setSongs] = useState<SongWithDetails[]>([]);
  const [categories,setCategories] = useState<Category[]>([]);
  const [selectedCategory,setSelectedCategory] = useState('');
  const [loading,setLoading] = useState(false);
  const [showResults,setShowResults] = useState(false);

  useEffect(()=>{loadCategories();},[]);

  const loadCategories = useCallback(async()=>{
    const {data} = await supabase.from('categories').select('id,name').order('name').limit(15);
    if(data) setCategories(data);
  },[]);

  const searchSongs = useCallback(async(q:string,cat?:string)=>{
    if(!q && !cat){setSongs([]);setShowResults(false);return;}
    setLoading(true);
    setShowResults(true);
    try{
      let query_obj = supabase.from('songs_with_details').select('id,title,artist,cover_url,views,likes').limit(SEARCH_LIMIT);
      if(q) query_obj = query_obj.or(`title.ilike.%${q}%,artist.ilike.%${q}%`);
      if(cat) query_obj = query_obj.eq('category_id',cat);
      const {data} = await query_obj;
      setSongs(data || []);
    }catch(e){console.error('Search error:',e);}
    finally{setLoading(false);}
  },[]);

  const debouncedSearch = useCallback(
    debounce((q:string,cat:string)=>searchSongs(q,cat),DEBOUNCE_MS),
    [searchSongs]
  );

  const handleSearch = (q:string)=>{setQuery(q);debouncedSearch(q,selectedCategory);};
  const handleCategoryChange = (cat:string)=>{setSelectedCategory(cat);debouncedSearch(query,cat);};
  const clearSearch = ()=>{setQuery('');setSongs([]);setShowResults(false);};

  return(
    <div className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search className="w-5 h-5"/></div>
          <input
            type="text"
            placeholder="Busca música, artistas..."
            value={query}
            onChange={(e)=>handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
          />
          {query && <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400"/></button>}
        </div>
      </div>

      {categories.length>0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          <button onClick={()=>handleCategoryChange('')} className={`px-3 py-1 text-sm rounded-full transition-colors ${!selectedCategory?'bg-green-500 text-white':'bg-white/10 text-gray-400 hover:bg-white/20'}`}>Todo</button>
          {categories.map(cat=><CategoryButton key={cat.id} cat={cat} selected={selectedCategory===cat.id} onSelect={handleCategoryChange}/>)}
        </div>
      )}

      {showResults && (
        <div className="mt-6">
          {loading?<div className="text-center py-8"><div className="inline-block animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"></div></div>:
          songs.length>0?(
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {songs.map(song=><SearchSongCard key={song.id} song={song}/>)}
            </div>
          ):(
            <div className="text-center py-12 text-gray-400">
              <p>No se encontraron canciones</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const CategoryButton = memo(function({cat,selected,onSelect}:{cat:Category;selected:boolean;onSelect:(id:string)=>void}){
  return(
    <button onClick={()=>onSelect(cat.id)} className={`px-3 py-1 text-sm rounded-full transition-colors ${selected?'bg-green-500 text-white':'bg-white/10 text-gray-400 hover:bg-white/20'}`}>{cat.name}</button>
  );
});

const SearchSongCard = memo(function({song}:{song:SongWithDetails}){
  const {playSong} = usePlayerStore();
  const [imgLoaded,setImgLoaded] = useState(false);

  return(
    <div className="group relative rounded-lg overflow-hidden bg-zinc-900/30 border border-white/5 hover:border-white/20 transition-all cursor-pointer" onClick={()=>playSong(song)}>
      <div className="relative aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 overflow-hidden">
        {!imgLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse"/>}
        {song.cover_url?<img src={song.cover_url} alt={song.title} loading="lazy" onLoad={()=>setImgLoaded(true)} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center"><svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity"><button className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"><svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button></div>
      </div>
      <div className="p-2">
        <h4 className="text-white text-sm font-semibold truncate">{song.title}</h4>
        <p className="text-gray-400 text-xs truncate">{song.artist}</p>
      </div>
    </div>
  );
});
