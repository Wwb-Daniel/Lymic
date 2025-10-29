-- =====================================================
-- ACTUALIZACIÓN DE TABLA PROFILES
-- Agregar campos para controlar edición de nombre y avatar
-- =====================================================
-- Ejecutar este SQL en el SQL Editor de Supabase
-- =====================================================

-- Agregar columnas para controlar cuándo se actualizó el nombre y avatar
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMP WITH TIME ZONE;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('name_updated_at', 'avatar_updated_at');

-- =====================================================
-- CREAR BUCKET PARA AVATARS (Si no existe)
-- =====================================================
-- Nota: Esto se debe hacer desde la interfaz de Supabase Storage
-- O ejecutar este código en una función de Supabase:
-- 
-- 1. Ir a Storage en el panel de Supabase
-- 2. Crear un nuevo bucket llamado "avatars"
-- 3. Hacer el bucket público:
--    - Click en el bucket "avatars"
--    - Ir a "Policies"
--    - Crear política pública para lectura
-- =====================================================

-- Política de Storage para permitir que los usuarios suban sus avatars
-- (Ejecutar después de crear el bucket)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
