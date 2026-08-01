import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const STATUS_LABELS = {
  PENDING: { label: 'En attente', color: 'bg-tertiary/10 text-tertiary' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-primary/10 text-primary' },
  SHIPPED: { label: 'Expédiée', color: 'bg-secondary/10 text-secondary' },
  DELIVERED: { label: 'Livrée', color: 'bg-success/10 text-success' },
  CANCELLED: { label: 'Annulée', color: 'bg-error/10 text-error' },
};

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipForm, setShipForm] = useState({ trackingNumber: '', carrier: '', carrierUrl: '', estimatedDelivery: '' });
  const [shippingOrderId, setShippingOrderId] = useState(null);
  const [shipSaving, setShipSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/orders/admin/all').then(({ data }) => setOrders(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'SHIPPED') {
      setShippingOrderId(orderId);
      return;
    }
    if (newStatus === 'DELIVERED') {
      try {
        await api.put(`/orders/${orderId}/deliver`);
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'DELIVERED', deliveredAt: new Date().toISOString() } : o));
      } catch { /* failed */ }
      return;
    }
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch { /* status update failed */ }
  };

  const handleShip = async (orderId) => {
    setShipSaving(true);
    try {
      const payload = {
        trackingNumber: shipForm.trackingNumber || undefined,
        carrier: shipForm.carrier || undefined,
        carrierUrl: shipForm.carrierUrl || undefined,
        estimatedDelivery: shipForm.estimatedDelivery || undefined,
      };
      const { data } = await api.put(`/orders/${orderId}/ship`, payload);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'SHIPPED', trackingNumber: data.data.trackingNumber, carrier: data.data.carrier, carrierUrl: data.data.carrierUrl, estimatedDelivery: data.data.estimatedDelivery } : o));
      setShippingOrderId(null);
      setShipForm({ trackingNumber: '', carrier: '', carrierUrl: '', estimatedDelivery: '' });
    } catch { /* failed */ } finally {
      setShipSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-surface-container animate-pulse rounded-xl" />)}</div>;
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline/20">
              <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Commande</th>
              <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Client</th>
              <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Total</th>
              <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Statut</th>
              <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Date</th>
              <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
              return (
                <tr key={order.id} className="border-b border-outline/10 last:border-0">
                  <td className="px-6 py-4">
                    <Link to={`/orders/${order.id}`} className="font-label-sm text-primary hover:underline">#{order.id.slice(-8).toUpperCase()}</Link>
                  </td>
                  <td className="px-6 py-4 font-body-sm text-on-surface">{order.user?.nom || '-'}</td>
                  <td className="px-6 py-4 font-label-sm text-on-surface">{order.total.toFixed(2)} €</td>
                  <td className="px-6 py-4">
                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className={`px-2 py-1 rounded-full text-[10px] font-label-sm border-0 cursor-pointer ${status.color}`}>
                      {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{STATUS_LABELS[s].label}</option>))}
                    </select>
                  </td>
                  <td className="px-6 py-4 font-body-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4">
                    {!order.trackingNumber && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <button onClick={() => setShippingOrderId(order.id)} className="px-3 py-1 bg-secondary text-on-secondary rounded-lg font-label-sm hover:bg-secondary/90 transition-colors">Expédier</button>
                    )}
                    {order.trackingNumber && (
                      <span className="font-body-xs text-success flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span>Suivi</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {shippingOrderId && (
        <div className="border-t border-outline/20 p-6 bg-surface-container/50">
          <h4 className="font-headline-sm text-primary mb-4">Expédier la commande #{shippingOrderId.slice(-8).toUpperCase()}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="font-label-sm text-on-surface mb-1 block">N° de suivi</label>
              <input type="text" value={shipForm.trackingNumber} onChange={(e) => setShipForm({ ...shipForm, trackingNumber: e.target.value })} placeholder="7A123456789FR" className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-on-surface mb-1 block">Transporteur</label>
              <input type="text" value={shipForm.carrier} onChange={(e) => setShipForm({ ...shipForm, carrier: e.target.value })} placeholder="Colissimo, DHL..." className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-on-surface mb-1 block">Lien de suivi</label>
              <input type="url" value={shipForm.carrierUrl} onChange={(e) => setShipForm({ ...shipForm, carrierUrl: e.target.value })} placeholder="https://..." className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="font-label-sm text-on-surface mb-1 block">Livraison estimée</label>
              <input type="date" value={shipForm.estimatedDelivery} onChange={(e) => setShipForm({ ...shipForm, estimatedDelivery: e.target.value })} className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleShip(shippingOrderId)} disabled={shipSaving} className="px-6 py-2 bg-secondary text-on-secondary rounded-lg font-label-sm hover:bg-secondary/90 transition-colors disabled:opacity-40">{shipSaving ? 'Envoi...' : 'Expédier'}</button>
            <button onClick={() => { setShippingOrderId(null); setShipForm({ trackingNumber: '', carrier: '', carrierUrl: '', estimatedDelivery: '' }); }} className="px-6 py-2 border border-outline rounded-lg font-label-sm text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
