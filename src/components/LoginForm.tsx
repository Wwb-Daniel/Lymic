import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Esperar un momento para que se complete la autenticación
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Correo electrónico o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-white mb-2">
          Correo electrónico o nombre de usuario
        </label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico o nombre de usuario"
          className="w-full px-4 py-3 bg-zinc-800 border border-gray-600 hover:border-white focus:border-white rounded text-white placeholder-gray-400 outline-none transition-colors"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-bold text-white mb-2">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full px-4 py-3 bg-zinc-800 border border-gray-600 hover:border-white focus:border-white rounded text-white placeholder-gray-400 outline-none transition-colors"
          required
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>

      {/* Forgot password */}
      <div className="text-center">
        <a href="#" className="text-white underline hover:text-green-500 transition-colors">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
      </div>

      {/* Sign up */}
      <div className="text-center space-y-4">
        <p className="text-gray-400">¿No tienes una cuenta?</p>
        <a
          href="/signup"
          className="block w-full py-3 border border-gray-600 hover:border-white text-white font-bold rounded-full transition-colors"
        >
          Registrarse en Spotify
        </a>
      </div>
    </form>
  );
}
