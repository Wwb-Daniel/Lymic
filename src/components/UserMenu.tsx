import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import AuthModal from './AuthModal';

export default function UserMenu() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, profile, signOut, initialize, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  if (!initialized) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-green-500/25"
        >
          Iniciar Sesión
        </button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 rounded-full transition-all"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-white font-medium hidden md:block">
          {profile?.username || user.email?.split('@')[0]}
        </span>
        <svg
          className={`w-4 h-4 text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showUserMenu && (
        <>
          {/* Overlay para cerrar el menú */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
          
          {/* Menú desplegable */}
          <div className="absolute right-0 mt-2 w-56 bg-zinc-900/95 backdrop-blur-md rounded-lg border border-white/10 shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <p className="text-white font-semibold">{profile?.full_name || profile?.username}</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
            
            <div className="py-2">
              <a
                href="/profile"
                className="block px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Mi Perfil
              </a>
              <a
                href="/upload"
                className="block px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Subir Música
              </a>
              <a
                href="/my-music"
                className="block px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Mi Música
              </a>
              <a
                href="/playlists"
                className="block px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Mis Playlists
              </a>
            </div>

            <div className="border-t border-white/10 py-2">
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
