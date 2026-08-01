import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      navigate('/verify-code', { state: { resetId: data.resetId, email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-[16px] md:px-[40px] max-w-md mx-auto py-24">
      <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-4 text-center">Mot de passe oublié</h1>
      <p className="font-body-md text-on-surface-variant text-center mb-8">
        Entrez votre email et nous vous enverrons un code de vérification.
      </p>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-error-container text-on-error-container font-body-md text-[14px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-on-secondary font-label-md text-[14px] leading-[20px] px-8 py-3 rounded-lg hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Envoi...' : 'Envoyer le code'}
        </button>
      </form>

      <p className="mt-8 text-center font-body-md text-[14px] leading-[20px] text-on-surface-variant">
        <Link to="/login" className="text-secondary hover:underline">Retour à la connexion</Link>
      </p>
    </div>
  );
}
