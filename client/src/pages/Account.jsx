import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../context/useAuth.jsx';
import api from '../utils/api';

export default function Account() {
  const { user, updateProfile } = useAuth();

  const [nom, setNom] = useState(user?.nom || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [adresse, setAdresse] = useState(user?.adresse || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    setNom(user?.nom || '');
    setPhone(user?.phone || '');
    setAdresse(user?.adresse || '');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile({ nom, phone, adresse });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setChangingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
      <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-8">Mon compte</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="font-headline-sm text-primary mb-6">Informations personnelles</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-label-sm text-on-surface mb-1 block">Nom</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="font-label-sm text-on-surface mb-1 block">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-surface-container/50 rounded-lg border border-outline/20 font-body-sm text-on-surface-variant/60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="font-label-sm text-on-surface mb-1 block">Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="font-label-sm text-on-surface mb-1 block">Adresse</label>
                <textarea
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Votre adresse de livraison"
                  rows={3}
                  className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              {error && <p className="font-body-sm text-error">{error}</p>}
              {success && <p className="font-body-sm text-success">Profil mis à jour avec succès</p>}
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="font-headline-sm text-primary mb-4">Navigation</h3>
            <div className="space-y-2">
              <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-secondary">receipt_long</span>
                <span className="font-body-md text-on-surface">Mes commandes</span>
              </Link>
              <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-secondary">favorite</span>
                <span className="font-body-md text-on-surface">Mes favoris</span>
              </Link>
              <Link to="/cart" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-secondary">shopping_cart</span>
                <span className="font-body-md text-on-surface">Mon panier</span>
              </Link>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow mt-6">
            <h3 className="font-headline-sm text-primary mb-6">Changer le mot de passe</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="font-label-sm text-on-surface mb-1 block">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="font-label-sm text-on-surface mb-1 block">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                  placeholder="Minimum 6 caractères"
                />
              </div>
              <div>
                <label className="font-label-sm text-on-surface mb-1 block">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                  placeholder="Retapez le mot de passe"
                />
              </div>
              {passwordError && <p className="font-body-sm text-error">{passwordError}</p>}
              {passwordSuccess && <p className="font-body-sm text-success">Mot de passe modifié avec succès</p>}
              <button
                type="submit"
                disabled={changingPassword}
                className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {changingPassword ? 'Modification...' : 'Modifier le mot de passe'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
