import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    if (!paymentIntent) {
      setStatus('error');
      return;
    }

    api.get('/orders')
      .then(({ data }) => {
        const order = data.data.find((o) => o.paymentIntentId === paymentIntent);
        if (order) {
          setOrderId(order.id);
          setStatus('success');
        } else {
          setStatus('pending');
        }
      })
      .catch(() => setStatus('error'));
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-24 text-center">
        <span className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full inline-block mb-4" />
        <p className="font-body-sm text-on-surface-variant">Vérification du paiement...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-24 text-center">
        <span className="material-symbols-outlined text-8xl text-error/40 mb-4 block">error</span>
        <p className="font-headline-sm text-on-surface-variant mb-2">Erreur de paiement</p>
        <Link to="/cart" className="mt-4 inline-block px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors">
          Retour au panier
        </Link>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-24 text-center">
        <span className="material-symbols-outlined text-8xl text-tertiary/40 mb-4 block">hourglass_empty</span>
        <p className="font-headline-sm text-on-surface-variant mb-2">Paiement en cours de validation</p>
        <p className="font-body-sm text-on-surface-variant/60 mb-6">Votre commande sera confirmée sous peu.</p>
        <Link to="/products" className="mt-4 inline-block px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors">
          Continuer les achats
        </Link>
      </div>
    );
  }

  return (
    <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-24 text-center">
      <span className="material-symbols-outlined text-8xl text-success mb-4 block">check_circle</span>
      <p className="font-headline-lg text-[32px] leading-[40px] text-primary mb-2">Paiement réussi !</p>
      <p className="font-body-md text-on-surface-variant mb-8">Merci pour votre commande.</p>
      <div className="flex items-center justify-center gap-4">
        <Link
          to={`/orders/${orderId}`}
          className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors"
        >
          Voir ma commande
        </Link>
        <Link
          to="/products"
          className="px-8 py-3 border border-outline rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          Continuer les achats
        </Link>
      </div>
    </div>
  );
}
