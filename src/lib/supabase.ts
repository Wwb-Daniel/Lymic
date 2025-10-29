import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de la base de datos
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  name_updated_at: string | null;
  avatar_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  created_at: string;
}

export interface Song {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number | null;
  audio_url: string;
  cover_url: string | null;
  video_url: string | null;
  lyrics: string | null;
  category_id: string | null;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  color: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SongWithDetails extends Song {
  category_name: string | null;
  category_slug: string | null;
  category_color: string | null;
  uploaded_by: string | null;
  uploader_avatar: string | null;
}

// Helper para obtener URL pública de storage
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Helper para subir archivo
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { cacheControl?: string; upsert?: boolean }
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);
  
  if (error) throw error;
  return data;
}

// Helper para eliminar archivo
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
