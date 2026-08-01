import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const STATUS_LABELS = {
  PENDING: { label: 'En attente', color: 'bg-tertiary/10 text-tertiary', icon: 'hourglass_empty' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  SHIPPED: { label: 'Expédiée', color: 'bg-secondary/10 text-secondary', icon: 'local_shipping' },
  DELIVERED: { label: 'Livrée', color: 'bg-success/10 text-success', icon: 'inventory_2' },
  CANCELLED: { label: 'Annulée', color: 'bg-error/10 text-error', icon: 'cancel' },
};

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

function OrderTimeline({ currentStatus }) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="flex items-center justify-center gap-3 py-4">
        <span className="material-symbols-outlined text-error text-2xl">cancel</span>
        <span className="font-label-md text-error">Commande annulée</span>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between py-4">
      {STATUS_ORDER.map((status, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const info = STATUS_LABELS[status];

        return (
          <div key={status} className="flex-1 flex flex-col items-center relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
              isCompleted
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant/40'
            } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
              <span className="material-symbols-outlined text-lg">{info.icon}</span>
            </div>
            <span className={`font-body-xs text-center hidden sm:block ${
              isCompleted ? 'text-on-surface font-medium' : 'text-on-surface-variant/40'
            }`}>
              {info.label}
            </span>
            {i < STATUS_ORDER.length - 1 && (
              <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${
                i < currentIndex ? 'bg-primary' : 'bg-surface-container'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Commande introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
        <div className="h-8 w-48 bg-surface-container animate-pulse rounded mb-8" />
        <div className="h-64 bg-surface-container animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-24 text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4 block">error</span>
        <p className="font-headline-sm text-on-surface-variant mb-2">{error}</p>
        <Link to="/orders" className="font-label-md text-secondary hover:underline mt-4 inline-block">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const status = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;

  return (
    <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
        <Link to="/account" className="hover:text-primary transition-colors">Mon compte</Link>
        <span>/</span>
        <Link to="/orders" className="hover:text-primary transition-colors">Commandes</Link>
        <span>/</span>
        <span className="text-on-surface">#{order.id.slice(-8).toUpperCase()}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary">
          Commande #{order.id.slice(-8).toUpperCase()}
        </h1>
        <span className={`px-3 py-1 rounded-full text-xs font-label-sm uppercase tracking-wider ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow mb-8">
        <h3 className="font-headline-sm text-primary mb-4">Suivi de la commande</h3>
        <OrderTimeline currentStatus={order.status} />
      </div>

      {order.trackingNumber && (
        <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-secondary">local_shipping</span>
            <h3 className="font-headline-sm text-primary">Suivi de colis</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="font-body-xs text-on-surface-variant mb-1">Transporteur</p>
              <p className="font-label-md text-on-surface">{order.carrier || '-'}</p>
            </div>
            <div>
              <p className="font-body-xs text-on-surface-variant mb-1">Numéro de suivi</p>
              <p className="font-label-md text-on-surface font-mono">{order.trackingNumber}</p>
            </div>
            {order.estimatedDelivery && (
              <div>
                <p className="font-body-xs text-on-surface-variant mb-1">Livraison estimée</p>
                <p className="font-label-md text-on-surface">
                  {new Date(order.estimatedDelivery).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
          {order.carrierUrl && (
            <a
              href={order.carrierUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-4 font-label-sm text-secondary hover:underline"
            >
              Suivre mon colis
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="font-headline-sm text-primary mb-6">Articles</h3>
            <div className="space-y-4">
              {order.items.map((item) => {
                const product = item.product;
                let images = [];
                try {
                  images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
                } catch { images = []; }
                const imageUrl = images[0] || 'https://via.placeholder.com/80x80?text=N/A';
                return (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b border-outline/10 last:border-0">
                    <img
                      src={imageUrl}
                      alt={product.nom}
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=N/A'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-on-surface truncate">{product.nom}</p>
                      <p className="font-body-xs text-on-surface-variant">Qty: {item.quantity} × {item.prix.toFixed(2)}&nbsp;&euro;</p>
                    </div>
                    <span className="font-label-sm text-on-surface shrink-0">{(item.prix * item.quantity).toFixed(2)}&nbsp;&euro;</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="font-headline-sm text-primary mb-4">Récapitulatif</h3>
            <div className="space-y-3">
              <div className="flex justify-between font-body-sm text-on-surface-variant">
                <span>Sous-total</span>
                <span>{(order.total - (order.deliveryFee || 0)).toFixed(2)}&nbsp;&euro;</span>
              </div>
              <div className="flex justify-between font-body-sm text-on-surface-variant">
                <span>Livraison{order.deliveryMethod ? ` (${order.deliveryMethod.nom})` : ''}</span>
                <span className={(!order.deliveryFee || order.deliveryFee === 0) ? 'text-success' : ''}>
                  {(!order.deliveryFee || order.deliveryFee === 0) ? 'Gratuite' : `${order.deliveryFee.toFixed(2)} €`}
                </span>
              </div>
              <div className="border-t border-outline/20 pt-3 flex justify-between">
                <span className="font-label-md text-on-surface">Total</span>
                <span className="font-headline-sm text-primary">{order.total.toFixed(2)}&nbsp;&euro;</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="font-headline-sm text-primary mb-4">Livraison</h3>
            <p className="font-body-sm text-on-surface-variant">{order.adresseLivraison}</p>
            {order.phone && <p className="font-body-sm text-on-surface-variant mt-2">{order.phone}</p>}
            <p className="font-body-xs text-on-surface-variant/60 mt-3">
              {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
