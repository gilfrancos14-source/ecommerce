import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = location.state?.resetToken;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  if (!resetToken) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { resetToken, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <div className="px-[16px] md:px-[40px] max-w-md mx-auto py-24">
      <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-4 text-center">Nouveau mot de passe</h1>
      <p className="font-body-md text-on-surface-variant text-center mb-8">
        Définissez votre nouveau mot de passe.
      </p>

      {success ? (
        <div className="text-center">
          <div className="mb-6 px-4 py-3 rounded-lg bg-success-container text-on-success-container font-body-md text-[14px]">
            Mot de passe réinitialisé avec succès ! Vous allez être redirigé...
          </div>
          <Link to="/login" className="text-secondary hover:underline font-label-md">
            Aller à la connexion
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-error-container text-on-error-container font-body-md text-[14px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block font-label-md text-[14px] leading-[20px] text-primary mb-2">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-outline bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder-on-surface-variant/50 font-body-md"
                placeholder="Minimum 6 caractères"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-label-md text-[14px] leading-[20px] text-primary mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-outline bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder-on-surface-variant/50 font-body-md"
                placeholder="Retapez le mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-on-secondary font-label-md text-[14px] leading-[20px] px-8 py-3 rounded-lg hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
