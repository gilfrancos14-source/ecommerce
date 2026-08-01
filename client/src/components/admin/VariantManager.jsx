import { useState, useEffect } from 'react';
import api from '../../utils/api';

const VARIANT_EMPTY = { nom: '', prix: '', compareAtPrice: '', stock: '' };

export default function VariantManager({ product, onClose }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(VARIANT_EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    setLoading(true);
    api.get(`/variants/product/${product.id}`)
      .then(({ data }) => setVariants(data.data))
      .catch(() => setVariants([]))
      .finally(() => setLoading(false));
  }, [product.id]);

  const handleImageChange = (e) => {
    previews.forEach((url) => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('nom', form.nom);
      fd.append('prix', form.prix);
      if (form.compareAtPrice) fd.append('compareAtPrice', form.compareAtPrice);
      fd.append('stock', form.stock || '0');
      images.forEach((f) => fd.append('images', f));

      if (editing) {
        const { data } = await api.put(`/variants/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setVariants((prev) => prev.map((v) => v.id === editing.id ? data.data : v));
      } else {
        const { data } = await api.post(`/variants/product/${product.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setVariants((prev) => [...prev, data.data]);
      }
      resetForm();
    } catch { /* handled */ } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette variante ?')) return;
    try {
      await api.delete(`/variants/${id}`);
      setVariants((prev) => prev.filter((v) => v.id !== id));
    } catch { /* failed */ }
  };

  const handleEdit = (v) => {
    setEditing(v);
    setForm({ nom: v.nom, prix: String(v.prix), compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : '', stock: String(v.stock) });
    setPreviews(v.images || []);
    setImages([]);
  };

  const resetForm = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setForm(VARIANT_EMPTY); setImages([]); setPreviews([]); setEditing(null);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-surface-container-lowest border-b border-outline/20 px-6 py-4 flex items-center justify-between">
          <h3 className="font-headline-sm text-primary">Variants — {product.nom}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-surface-container rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="font-label-sm text-on-surface mb-1 block">Nom *</label><input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
              <div><label className="font-label-sm text-on-surface mb-1 block">Stock</label><input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="font-label-sm text-on-surface mb-1 block">Prix (€) *</label><input type="number" step="0.01" min="0" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} required className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
              <div><label className="font-label-sm text-on-surface mb-1 block">Prix barré (€)</label><input type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
            </div>
            <div><label className="font-label-sm text-on-surface mb-1 block">Images (max 5)</label><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={handleImageChange} className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary/10 file:text-primary file:font-label-sm file:cursor-pointer" /></div>
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden bg-surface-container">
                    <img src={src} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/64x64?text=N/A'; }} />
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-sm hover:bg-primary/90 transition-colors disabled:opacity-40">{saving ? 'Envoi...' : editing ? 'Mettre à jour' : 'Créer'}</button>
              {editing && <button type="button" onClick={resetForm} className="px-4 py-2 border border-outline rounded-lg font-label-sm text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>}
            </div>
          </form>

          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-surface-container animate-pulse rounded-lg" />)}</div>
          ) : variants.length === 0 ? (
            <p className="font-body-sm text-on-surface-variant/60 text-center py-8">Aucune variante</p>
          ) : (
            <div className="space-y-2">
              {variants.map((v) => {
                const images = v.images || [];
                const imageUrl = images[0];
                return (
                  <div key={v.id} className="flex items-center gap-3 bg-surface-container rounded-lg p-3">
                    {imageUrl && <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0"><img src={imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                    <div className="flex-1 min-w-0">
                      <p className="font-label-sm text-on-surface truncate">{v.nom}</p>
                      <p className="font-body-xs text-on-surface-variant">{v.prix.toFixed(2)} € — Stock: {v.stock}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleEdit(v)} className="h-8 w-8 rounded-lg text-on-surface-variant hover:bg-surface-container-low flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                      <button onClick={() => handleDelete(v.id)} className="h-8 w-8 rounded-lg text-error hover:bg-error/10 flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
