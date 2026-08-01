import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const STATUS_LABELS = {
  PENDING: { label: 'En attente', color: 'bg-tertiary/10 text-tertiary' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-primary/10 text-primary' },
  SHIPPED: { label: 'Expédiée', color: 'bg-secondary/10 text-secondary' },
  DELIVERED: { label: 'Livrée', color: 'bg-success/10 text-success' },
  CANCELLED: { label: 'Annulée', color: 'bg-error/10 text-error' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
        <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-8">Mes commandes</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-surface-container animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-24 text-center">
        <span className="material-symbols-outlined text-8xl text-on-surface-variant/30 mb-4 block">receipt_long</span>
        <p className="font-headline-sm text-on-surface-variant mb-2">Aucune commande</p>
        <p className="font-body-sm text-on-surface-variant/60 mb-6">Vous n'avez pas encore passé de commande.</p>
        <Link to="/products" className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors inline-block">
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
      <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-8">Mes commandes</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const status = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-surface-container-lowest rounded-xl p-6 ambient-shadow hover-lift transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-label-md text-on-surface">
                      Commande #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-label-sm uppercase tracking-wider ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="font-body-xs text-on-surface-variant/60 mt-1">
                    {order.items.length} article{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="font-headline-sm text-primary">{order.total.toFixed(2)}&nbsp;&euro;</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
