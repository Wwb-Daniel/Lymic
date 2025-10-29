-- =====================================================
-- CORREGIR POLÍTICAS RLS PARA PROFILES
-- =====================================================
-- El problema es que probablemente no hay política de UPDATE
-- Ejecutar este SQL en Supabase SQL Editor
-- =====================================================

-- 1. Verificar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 2. Habilitar RLS en la tabla profiles (si no está habilitado)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 4. Crear política para SELECT (ver perfil)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 5. Crear política para INSERT (crear perfil)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 6. Crear política para UPDATE (actualizar perfil) - IMPORTANTE
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 7. Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'profiles';

-- 8. Probar actualización manual (reemplaza 'tu-user-id' con tu ID real)
-- UPDATE profiles 
-- SET full_name = 'Test Name', name_updated_at = NOW()
-- WHERE id = auth.uid();
