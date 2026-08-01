import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function AdminDelivery() {
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nom: '', description: '', price: '', freeFrom: '', estimatedDays: '', carrier: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/delivery-methods/admin/all').then(({ data }) => setDeliveryMethods(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nom: form.nom, description: form.description || undefined,
        price: parseFloat(form.price) || 0, freeFrom: form.freeFrom ? parseFloat(form.freeFrom) : undefined,
        estimatedDays: form.estimatedDays, carrier: form.carrier,
      };
      if (editing) {
        const { data } = await api.put(`/delivery-methods/${editing.id}`, payload);
        setDeliveryMethods((prev) => prev.map((d) => d.id === editing.id ? data.data : d));
      } else {
        const { data } = await api.post('/delivery-methods', payload);
        setDeliveryMethods((prev) => [...prev, data.data]);
      }
      setForm({ nom: '', description: '', price: '', freeFrom: '', estimatedDays: '', carrier: '' });
      setEditing(null);
    } catch { /* handled */ } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce mode de livraison ?')) return;
    try {
      await api.delete(`/delivery-methods/${id}`);
      setDeliveryMethods((prev) => prev.filter((d) => d.id !== id));
    } catch { /* delete failed */ }
  };

  const handleEdit = (dm) => {
    setEditing(dm);
    setForm({ nom: dm.nom, description: dm.description || '', price: String(dm.price), freeFrom: dm.freeFrom ? String(dm.freeFrom) : '', estimatedDays: dm.estimatedDays, carrier: dm.carrier });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline/20">
                  <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Nom</th>
                  <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Transporteur</th>
                  <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Prix</th>
                  <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Gratuit dès</th>
                  <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Délai</th>
                  <th className="text-right px-6 py-4 font-label-sm text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3].map(i => <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-10 bg-surface-container animate-pulse rounded" /></td></tr>)
                ) : deliveryMethods.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center font-body-sm text-on-surface-variant/60">Aucun mode de livraison</td></tr>
                ) : (
                  deliveryMethods.map((dm) => (
                    <tr key={dm.id} className="border-b border-outline/10 last:border-0">
                      <td className="px-6 py-4 font-body-sm text-on-surface">{dm.nom}</td>
                      <td className="px-6 py-4 font-body-xs text-on-surface-variant">{dm.carrier}</td>
                      <td className="px-6 py-4 font-label-sm text-on-surface">{dm.price.toFixed(2)} €</td>
                      <td className="px-6 py-4 font-body-xs text-on-surface-variant">{dm.freeFrom ? `${dm.freeFrom} €` : '-'}</td>
                      <td className="px-6 py-4 font-body-xs text-on-surface-variant">{dm.estimatedDays}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEdit(dm)} className="text-secondary hover:text-primary transition-colors mr-3"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => handleDelete(dm.id)} className="text-error hover:text-error/80 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
          <h3 className="font-headline-sm text-primary mb-4">{editing ? 'Modifier' : 'Ajouter'} un mode de livraison</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="font-label-sm text-on-surface mb-1 block">Nom</label><input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required placeholder="Standard, Express..." className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
            <div><label className="font-label-sm text-on-surface mb-1 block">Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Livraison sous 3-5 jours" className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="font-label-sm text-on-surface mb-1 block">Prix (€)</label><input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
              <div><label className="font-label-sm text-on-surface mb-1 block">Gratuit dès (€)</label><input type="number" step="0.01" min="0" value={form.freeFrom} onChange={(e) => setForm({ ...form, freeFrom: e.target.value })} placeholder="50" className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="font-label-sm text-on-surface mb-1 block">Transporteur</label><input type="text" value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} required placeholder="Colissimo, Chronopost..." className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
              <div><label className="font-label-sm text-on-surface mb-1 block">Délai estimé</label><input type="text" value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} required placeholder="3-5 jours ouvrés" className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
            </div>
            <button type="submit" disabled={saving} className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-sm hover:bg-primary/90 transition-colors disabled:opacity-40">{saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer'}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ nom: '', description: '', price: '', freeFrom: '', estimatedDays: '', carrier: '' }); }} className="w-full py-3 border border-outline rounded-lg font-label-sm text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>}
          </form>
        </div>
      </div>
    </div>
  );
}
