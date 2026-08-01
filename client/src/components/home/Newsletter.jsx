import { useState } from 'react';
import api from '../../utils/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await api.post('/newsletter/subscribe', { email });
      setMessage(data.message || 'Inscription réussie !');
      setEmail('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-surface px-[16px] md:px-[40px] text-center">
      <div className="max-w-xl mx-auto">
        <h2 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-4">Restez inform&eacute;</h2>
        <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant mb-8">
          Abonnez-vous à notre newsletter pour recevoir nos dernières actualités, nos offres exclusives et nos conseils de style.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
          <input
            className="flex-1 px-4 py-3 rounded-lg border border-outline bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent placeholder-on-surface-variant/50 font-body-md"
            name="email"
            placeholder="Votre adresse e-mail"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="bg-secondary text-on-secondary font-label-md text-[14px] leading-[20px] px-8 py-3 rounded-lg hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Envoi...' : "S'inscrire"}
          </button>
        </form>
        {message && <p className="mt-4 text-on-surface-variant">{message}</p>}
      </div>
    </section>
  );
}
