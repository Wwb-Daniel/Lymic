import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import SearchBar from './SearchBar';

export default function TopBar() {
  const { user, profile, initialize, signOut } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Inicializar autenticación
  useEffect(() => {
    initialize();
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);


  const getInitial = (name?: string | null) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (userId?: string) => {
    if (!userId) return 'rgb(25, 230, 140)';
    // Generar color consistente basado en el ID del usuario
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const colors = [
      'rgb(25, 230, 140)',
      'rgb(230, 25, 140)',
      'rgb(140, 25, 230)',
      'rgb(25, 140, 230)',
      'rgb(230, 140, 25)',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const displayName = profile?.full_name || profile?.username || user?.email || 'Usuario';

  return (
    <header className="sticky top-0 z-30 bg-zinc-900/20 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo y navegación izquierda */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src="/Lymic.png" alt="Lymic" className="w-10 h-10" />
          </a>

          {/* Botón Home */}
          <a
            href="/"
            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
            aria-label="Inicio"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732z" />
            </svg>
          </a>

          {/* Barra de búsqueda */}
          <SearchBar />
        </div>

        {/* Botones derecha */}
        <div className="flex items-center gap-2">
          {/* Instalar app */}
          <a
            href="/download"
            className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:scale-105 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.995 8.745a.75.75 0 0 1 1.06 0L7.25 9.939V4a.75.75 0 0 1 1.5 0v5.94l1.195-1.195a.75.75 0 1 1 1.06 1.06L8 12.811l-.528-.528-.005-.005-2.472-2.473a.75.75 0 0 1 0-1.06" />
              <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13" />
            </svg>
            Instalar app
          </a>

          {/* Novedades */}
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Novedades"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1.5a4 4 0 0 0-4 4v3.27a.75.75 0 0 1-.1.373L2.255 12h11.49L12.1 9.142a.75.75 0 0 1-.1-.374V5.5a4 4 0 0 0-4-4m-5.5 4a5.5 5.5 0 0 1 11 0v3.067l2.193 3.809a.75.75 0 0 1-.65 1.124H10.5a2.5 2.5 0 0 1-5 0H.957a.75.75 0 0 1-.65-1.124L2.5 8.569zm4.5 8a1 1 0 1 0 2 0z" />
            </svg>
          </button>

          {/* Actividad de amigos */}
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Actividad de amigos"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.849 10.034c-.021-.465.026-.93.139-1.381H1.669c.143-.303.375-.556.665-.724l.922-.532a1.63 1.63 0 0 0 .436-2.458 1.8 1.8 0 0 1-.474-1.081q-.014-.287.057-.563a1.12 1.12 0 0 1 .627-.7 1.2 1.2 0 0 1 .944 0q.225.1.392.281c.108.12.188.263.237.417q.074.276.057.561a1.8 1.8 0 0 1-.475 1.084 1.6 1.6 0 0 0-.124 1.9c.36-.388.792-.702 1.272-.927v-.015c.48-.546.768-1.233.821-1.958a3.2 3.2 0 0 0-.135-1.132 2.657 2.657 0 0 0-5.04 0c-.111.367-.157.75-.135 1.133.053.724.341 1.41.821 1.955A.13.13 0 0 1 2.565 6a.13.13 0 0 1-.063.091l-.922.532A3.2 3.2 0 0 0-.004 9.396v.75h3.866c.001-.033-.01-.071-.013-.112m10.568-3.4-.922-.532a.13.13 0 0 1-.064-.091.12.12 0 0 1 .028-.1c.48-.546.768-1.233.821-1.958a3.3 3.3 0 0 0-.135-1.135A2.64 2.64 0 0 0 12.7 1.233a2.67 2.67 0 0 0-3.042.64 2.65 2.65 0 0 0-.554.948c-.11.367-.156.75-.134 1.133.053.724.341 1.41.821 1.955.005.006 0 .011 0 .018.48.225.911.54 1.272.927a1.6 1.6 0 0 0-.125-1.907 1.8 1.8 0 0 1-.474-1.081q-.015-.287.057-.563a1.12 1.12 0 0 1 .627-.7 1.2 1.2 0 0 1 .944 0q.225.1.392.281.162.182.236.413c.05.184.07.375.058.565a1.8 1.8 0 0 1-.475 1.084 1.633 1.633 0 0 0 .438 2.456l.922.532c.29.169.52.421.664.724h-2.319c.113.452.16.918.139 1.383 0 .04-.013.078-.017.117h3.866v-.75a3.2 3.2 0 0 0-1.58-2.778v.004zm-3.625 6-.922-.532a.13.13 0 0 1-.061-.144.1.1 0 0 1 .025-.047 3.33 3.33 0 0 0 .821-1.958 3.2 3.2 0 0 0-.135-1.132 2.657 2.657 0 0 0-5.041 0c-.11.367-.156.75-.134 1.133.053.724.341 1.41.821 1.955a.13.13 0 0 1 .028.106.13.13 0 0 1-.063.091l-.922.532a3.2 3.2 0 0 0-1.584 2.773v.75h8.75v-.75a3.2 3.2 0 0 0-1.583-2.781zm-5.5 2.023c.143-.303.375-.556.665-.724l.922-.532a1.63 1.63 0 0 0 .436-2.458 1.8 1.8 0 0 1-.474-1.081q-.015-.287.057-.563a1.12 1.12 0 0 1 .627-.7 1.2 1.2 0 0 1 .944 0q.225.1.392.281c.108.12.188.263.237.417q.073.276.057.561a1.8 1.8 0 0 1-.475 1.084 1.632 1.632 0 0 0 .438 2.456l.922.532c.29.169.52.421.664.724z" />
            </svg>
          </button>

          {/* Usuario */}
          {user ? (
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-1 py-1 bg-black hover:bg-zinc-800 rounded-full transition-colors"
                aria-label={displayName}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm"
                    style={{ backgroundColor: getAvatarColor(user.id) }}
                  >
                    {getInitial(displayName)}
                  </div>
                )}
              </button>

              {/* Menú desplegable */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    Perfil
                  </a>
                  <a
                    href="/upload"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    Subir música
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors border-t border-white/10"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/login"
              className="px-4 py-2 bg-white text-black rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Iniciar sesión
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
