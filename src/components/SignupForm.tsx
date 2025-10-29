import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthStore();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep(2);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, username, fullName);
      // Esperar un momento para que se complete el registro
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Error al registrarse. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-white mb-2">
            Dirección de correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@dominio.com"
            className="w-full px-4 py-3 bg-zinc-800 border border-gray-600 hover:border-white focus:border-white rounded text-white placeholder-gray-400 outline-none transition-colors"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-colors"
        >
          Siguiente
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCompleteSignup} className="space-y-4">
      {/* Email (readonly) */}
      <div>
        <label htmlFor="email-readonly" className="block text-sm font-bold text-white mb-2">
          Dirección de correo electrónico
        </label>
        <input
          id="email-readonly"
          type="email"
          value={email}
          readOnly
          className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded text-gray-400 cursor-not-allowed"
        />
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-bold text-white mb-2">
          Nombre completo
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre completo"
          className="w-full px-4 py-3 bg-zinc-800 border border-gray-600 hover:border-white focus:border-white rounded text-white placeholder-gray-400 outline-none transition-colors"
          required
        />
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-bold text-white mb-2">
          Nombre de usuario
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="usuario123"
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
          minLength={6}
        />
        <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
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
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </button>

      {/* Back button */}
      <button
        type="button"
        onClick={() => setStep(1)}
        className="w-full text-white underline hover:text-green-500 transition-colors"
      >
        Volver
      </button>
    </form>
  );
}
