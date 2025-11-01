import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Playlist, type Song} from "@/lib/data.ts";
import { type Song as SupabaseSong, supabase } from "@/lib/supabase";

export interface CurrentMusic {
  playlist: Playlist | null;
  song: Song | SupabaseSong | null;
  songs: (Song | SupabaseSong)[];
}

export interface PlayerStore {
  isPlaying: boolean;
  currentMusic: CurrentMusic;
  volume: number;
  showNowPlaying: boolean;
  isFavorite: boolean;
  currentTime: number;
  setVolume: (volume: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentMusic: (currentMusic: CurrentMusic) => void;
  setShowNowPlaying: (show: boolean) => void;
  setCurrentTime: (time: number) => void;
  playSong: (song: Song | SupabaseSong, songs?: (Song | SupabaseSong)[]) => void;
  toggleFavorite: () => Promise<void>;
  checkIfFavorite: (songId: string) => Promise<void>;
  incrementViews: (songId: string) => Promise<void>;
  addToHistory: (songId: string) => Promise<void>;
}

// Cargar estado inicial desde localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('player-storage');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const initialState = getInitialState();

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentMusic: { playlist: null, song: null, songs: [] },
      volume: 0.5,
      showNowPlaying: false,
      isFavorite: false,
      currentTime: 0,
      
      setVolume: (volume) => set({ volume }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentMusic: (currentMusic) => set({ currentMusic, isPlaying: true, showNowPlaying: true, currentTime: 0 }),
      setShowNowPlaying: (show) => set({ showNowPlaying: show }),
      setCurrentTime: (time) => set({ currentTime: time }),
  
  playSong: async (song, songs = []) => {
    set({ 
      currentMusic: { playlist: null, song, songs },
      isPlaying: true,
      showNowPlaying: true
    });
    
    // Incrementar vistas y agregar al historial
    if ('id' in song && song.id) {
      const songId = String(song.id);
      await get().incrementViews(songId);
      await get().addToHistory(songId);
      await get().checkIfFavorite(songId);
    }
  },

  toggleFavorite: async () => {
    const { currentMusic, isFavorite } = get();
    const song = currentMusic.song;
    
    if (!song || !('id' in song)) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isFavorite) {
        // Eliminar de favoritos
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('song_id', song.id);

        if (error) throw error;
        
        // Decrementar likes en la canción
        await supabase.rpc('decrement_likes', { song_id: song.id });
        
        set({ isFavorite: false });
      } else {
        // Agregar a favoritos
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, song_id: song.id });

        if (error) throw error;
        
        // Incrementar likes en la canción
        await supabase.rpc('increment_likes', { song_id: song.id });
        
        set({ isFavorite: true });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  },

  checkIfFavorite: async (songId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isFavorite: false });
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('song_id', songId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking favorite:', error);
      }

      set({ isFavorite: !!data });
    } catch (error) {
      console.error('Error checking favorite:', error);
      set({ isFavorite: false });
    }
  },

  incrementViews: async (songId: string) => {
    try {
      await supabase.rpc('increment_views', { song_id: songId });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  },

  addToHistory: async (songId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('play_history')
        .insert({ user_id: user.id, song_id: songId });
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  },
}),
    {
      name: 'player-storage',
      partialize: (state) => ({
        volume: state.volume,
        currentMusic: state.currentMusic,
        showNowPlaying: state.showNowPlaying,
        currentTime: state.currentTime,
      }),
    }
  )
);