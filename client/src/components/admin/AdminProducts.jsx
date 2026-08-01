import { useEffect, useState } from 'react';
import api from '../../utils/api';
import VariantManager from './VariantManager';

const PROD_EMPTY = { nom: '', description: '', prix: '', compareAtPrice: '', stock: '', categoryId: '', featured: false };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(PROD_EMPTY);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [variantProduct, setVariantProduct] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/products?limit=50').then(({ data }) => setProducts(data.data)),
      api.get('/categories').then(({ data }) => setCategories(data.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleImageChange = (e) => {
    previews.forEach((url) => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('nom', form.nom);
      if (form.description) fd.append('description', form.description);
      fd.append('prix', form.prix);
      if (form.compareAtPrice) fd.append('compareAtPrice', form.compareAtPrice);
      fd.append('stock', form.stock || '0');
      fd.append('categoryId', form.categoryId);
      fd.append('featured', form.featured ? 'true' : 'false');
      images.forEach((f) => fd.append('images', f));

      if (editing) {
        const { data } = await api.put(`/products/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setProducts((prev) => prev.map((p) => p.id === editing.id ? data.data : p));
      } else {
        const { data } = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setProducts((prev) => [data.data, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch { /* delete failed */ }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setForm({
      nom: product.nom, description: product.description || '', prix: String(product.prix),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '', stock: String(product.stock),
      categoryId: product.categoryId || '', featured: product.featured || false,
    });
    setPreviews(product.images || []);
    setImages([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setForm(PROD_EMPTY); setImages([]); setPreviews([]); setEditing(null); setShowForm(false); setError(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="font-body-sm text-on-surface-variant">{products.length} produit{products.length !== 1 ? 's' : ''}</span>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-sm hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined text-sm">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Fermer' : 'Ajouter un produit'}
        </button>
      </div>

      {showForm && (
        <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow mb-8">
          <h3 className="font-headline-sm text-primary mb-6">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div><label className="font-label-sm text-on-surface mb-1 block">Nom *</label><input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
              <div><label className="font-label-sm text-on-surface mb-1 block">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="font-label-sm text-on-surface mb-1 block">Prix (€) *</label><input type="number" step="0.01" min="0" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} required className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
                <div><label className="font-label-sm text-on-surface mb-1 block">Prix barré (€)</label><input type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="font-label-sm text-on-surface mb-1 block">Stock *</label><input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" /></div>
                <div><label className="font-label-sm text-on-surface mb-1 block">Catégorie *</label><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"><option value="">Choisir...</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-primary w-4 h-4" /><span className="font-label-sm text-on-surface">Produit en vedette</span></label>
            </div>
            <div className="space-y-4">
              <div><label className="font-label-sm text-on-surface mb-1 block">Images (max 5)</label><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={handleImageChange} className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-label-sm file:cursor-pointer" /></div>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative h-24 rounded-lg overflow-hidden bg-surface-container">
                      <img src={src} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=N/A'; }} />
                      {editing && src.startsWith('/') && <span className="absolute top-1 right-1 bg-primary text-on-primary text-[8px] px-1 rounded">existant</span>}
                    </div>
                  ))}
                </div>
              )}
              {editing && <p className="font-body-xs text-on-surface-variant/60">Les images existantes sont conservées si vous n'en ajoutez pas de nouvelles.</p>}
            </div>
            {error && <p className="font-body-sm text-error lg:col-span-2">{error}</p>}
            <div className="flex gap-3 lg:col-span-2">
              <button type="submit" disabled={saving} className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-40">{saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer le produit'}</button>
              <button type="button" onClick={resetForm} className="px-8 py-3 border border-outline rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-surface-container animate-pulse rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const images = product.images || [];
            const imageUrl = images[0] || 'https://via.placeholder.com/100x100?text=N/A';
            return (
              <div key={product.id} className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow">
                <div className="relative h-40 bg-surface-container">
                  <img src={imageUrl} alt={product.nom} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=N/A'; }} />
                  {product.featured && <span className="absolute top-2 left-2 bg-tertiary text-on-tertiary text-[10px] font-label-sm px-2 py-0.5 rounded-full">Vedette</span>}
                </div>
                <div className="p-4">
                  <p className="font-label-sm text-on-surface truncate">{product.nom}</p>
                  <p className="font-body-xs text-on-surface-variant">{product.category?.nom || '-'}</p>
                  <div className="flex items-center justify-between mt-2 mb-3">
                    <span className="font-label-sm text-primary">{product.prix.toFixed(2)} €</span>
                    <span className={`font-body-xs ${product.stock > 0 ? 'text-success' : 'text-error'}`}>Stock: {product.stock}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setVariantProduct(product)} className="flex-1 h-9 border border-outline rounded-lg font-label-sm text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center gap-1"><span className="material-symbols-outlined text-sm">style</span> Variants</button>
                    <button onClick={() => handleEdit(product)} className="flex-1 h-9 border border-outline rounded-lg font-label-sm text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center gap-1"><span className="material-symbols-outlined text-sm">edit</span> Modifier</button>
                    <button onClick={() => handleDelete(product.id)} className="h-9 w-9 border border-error/30 rounded-lg text-error hover:bg-error/10 transition-colors flex items-center justify-center"><span className="material-symbols-outlined text-sm">delete</span></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {variantProduct && (
        <VariantManager product={variantProduct} onClose={() => setVariantProduct(null)} />
      )}
    </div>
  );
}
