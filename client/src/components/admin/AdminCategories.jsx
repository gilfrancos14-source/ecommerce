import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nom: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/categories').then(({ data }) => setCategories(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/categories/${editing.id}`, form);
        setCategories((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...data.data } : c));
      } else {
        const { data } = await api.post('/categories', form);
        setCategories((prev) => [...prev, { ...data.data, _count: { products: 0 } }]);
      }
      setForm({ nom: '', description: '' });
      setEditing(null);
    } catch { /* handled */ } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch { /* delete failed */ }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setForm({ nom: cat.nom, description: cat.description || '' });
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
                  <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Slug</th>
                  <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Produits</th>
                  <th className="text-right px-6 py-4 font-label-sm text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3].map(i => <tr key={i}><td colSpan={4} className="px-6 py-4"><div className="h-10 bg-surface-container animate-pulse rounded" /></td></tr>)
                ) : categories.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center font-body-sm text-on-surface-variant/60">Aucune catégorie</td></tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-outline/10 last:border-0">
                      <td className="px-6 py-4 font-body-sm text-on-surface">{cat.nom}</td>
                      <td className="px-6 py-4 font-body-xs text-on-surface-variant">{cat.slug}</td>
                      <td className="px-6 py-4 font-label-sm text-on-surface">{cat._count?.products || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEdit(cat)} className="text-secondary hover:text-primary transition-colors mr-3"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => handleDelete(cat.id)} className="text-error hover:text-error/80 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
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
          <h3 className="font-headline-sm text-primary mb-4">{editing ? 'Modifier' : 'Ajouter'} une catégorie</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="font-label-sm text-on-surface mb-1 block">Nom</label><input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
            <div><label className="font-label-sm text-on-surface mb-1 block">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors resize-none" /></div>
            <button type="submit" disabled={saving} className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-sm hover:bg-primary/90 transition-colors disabled:opacity-40">{saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer'}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ nom: '', description: '' }); }} className="w-full py-3 border border-outline rounded-lg font-label-sm text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>}
          </form>
        </div>
      </div>
    </div>
  );
}
