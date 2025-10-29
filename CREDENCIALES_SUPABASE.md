# 🔑 Configuración de Credenciales de Supabase

## 📝 Instrucciones

Una vez que tengas tus credenciales de Supabase, crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
PUBLIC_SUPABASE_URL=TU_URL_AQUI
PUBLIC_SUPABASE_ANON_KEY=TU_KEY_AQUI
PUBLIC_APP_URL=http://localhost:4321
```

## 🔍 Dónde Encontrar las Credenciales

1. Ve a [app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** (⚙️) > **API**
4. Copia:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon public** key → `PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Importante

- **NO compartas** tu `service_role` key (la otra key que aparece)
- El archivo `.env` ya está en `.gitignore` y no se subirá a Git
- Las variables deben empezar con `PUBLIC_` para que Astro las reconozca
- Reinicia el servidor después de crear el `.env`

## ✅ Verificar que Funciona

Después de configurar el `.env`:

1. Reinicia el servidor: `npm run dev`
2. Abre http://localhost:4321
3. Intenta registrarte
4. Si funciona, ¡todo está bien! ✨

## 🐛 Si No Funciona

Revisa que:
- [ ] El archivo se llama exactamente `.env` (sin extensión)
- [ ] Está en la raíz del proyecto (junto a `package.json`)
- [ ] Las variables empiezan con `PUBLIC_`
- [ ] No hay espacios antes o después del `=`
- [ ] Reiniciaste el servidor después de crear el archivo

---

**Cuando tengas tus credenciales, pégalas aquí y yo configuraré todo por ti.**
