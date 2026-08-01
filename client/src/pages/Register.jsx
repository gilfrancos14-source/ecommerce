import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth.jsx';

export default function Register() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ nom, email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-[16px] md:px-[40px] max-w-md mx-auto py-24">
      <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-8 text-center">Créer un compte</h1>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-error-container text-on-error-container font-body-md text-[14px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nom" className="block font-label-md text-[14px] leading-[20px] text-primary mb-2">
            Nom
          </label>
          <input
            id="nom"
            type="text"
            required
            minLength={2}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-outline bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder-on-surface-variant/50 font-body-md"
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-label-md text-[14px] leading-[20px] text-primary mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-outline bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder-on-surface-variant/50 font-body-md"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-label-md text-[14px] leading-[20px] text-primary mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-outline bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder-on-surface-variant/50 font-body-md"
            placeholder="Min. 6 caractères"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-on-secondary font-label-md text-[14px] leading-[20px] px-8 py-3 rounded-lg hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Inscription...' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-8 text-center font-body-md text-[14px] leading-[20px] text-on-surface-variant">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-secondary hover:underline">Se connecter</Link>
      </p>
    </div>
  );
}
