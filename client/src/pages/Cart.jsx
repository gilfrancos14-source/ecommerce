import { Link } from 'react-router-dom';
import useCart from '../context/useCart.jsx';

export default function Cart() {
  const { items, total, count, loading, updateQuantity, removeItem, clearCart } = useCart();

  const handleClear = async () => {
    try { await clearCart(); } catch { /* ignore */ }
  };

  const handleUpdateQty = async (id, qty) => {
    try { await updateQuantity(id, qty); } catch { /* ignore */ }
  };

  const handleRemove = async (id) => {
    try { await removeItem(id); } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
        <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-8">Votre panier</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-surface-container animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-24 text-center">
        <span className="material-symbols-outlined text-8xl text-on-surface-variant/30 mb-4 block">shopping_cart</span>
        <p className="font-headline-sm text-on-surface-variant mb-2">Votre panier est vide</p>
        <p className="font-body-sm text-on-surface-variant/60 mb-6">Découvrez nos produits et ajoutez-en à votre panier.</p>
        <Link to="/products" className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors inline-block">
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary">Votre panier</h1>
        <button
          onClick={handleClear}
          className="font-label-sm text-error hover:text-error/80 transition-colors"
        >
          Tout vider
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {items.map((item) => {
            const product = item.product;
            const variant = item.variant;
            let images = [];
            try {
              const src = variant?.images || product.images;
              images = src ? (typeof src === 'string' ? JSON.parse(src) : src) : [];
            } catch { images = []; }
            const imageUrl = images[0] || 'https://via.placeholder.com/100x100?text=N/A';
            const displayPrice = variant ? variant.prix : product.prix;
            const displayCompareAt = variant?.compareAtPrice ?? product.compareAtPrice;
            const hasDiscount = displayCompareAt && displayCompareAt > displayPrice;
            const displayName = variant ? `${product.nom} — ${variant.nom}` : product.nom;
            const maxStock = variant ? variant.stock : product.stock;

            return (
              <div key={item.id} className="bg-surface-container-lowest rounded-xl p-4 flex gap-4 ambient-shadow">
                <Link to={`/products/${product.slug}`} className="shrink-0">
                  <img
                    src={imageUrl}
                    alt={product.nom}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=N/A'; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product.slug}`} className="font-label-md text-primary hover:underline line-clamp-1">
                    {displayName}
                  </Link>
                  <div className="flex items-baseline gap-2 mt-1">
                    {hasDiscount ? (
                      <>
                        <span className="font-headline-sm text-error">{displayPrice}&nbsp;&euro;</span>
                        <span className="font-body-xs text-on-surface-variant line-through">{displayCompareAt}&nbsp;&euro;</span>
                      </>
                    ) : (
                      <span className="font-headline-sm text-primary">{displayPrice}&nbsp;&euro;</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-outline rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleUpdateQty(item.id, Math.max(1, item.quantity - 1))}
                        className="h-8 w-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="h-8 w-8 flex items-center justify-center font-label-sm text-on-surface border-x border-outline">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.id, Math.min(maxStock, item.quantity + 1))}
                        className="h-8 w-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow sticky top-[104px]">
            <h3 className="font-headline-sm text-primary mb-6">Récapitulatif</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between font-body-sm text-on-surface-variant">
                <span>{count} article{count !== 1 ? 's' : ''}</span>
                <span>{total.toFixed(2)}&nbsp;&euro;</span>
              </div>
              <div className="flex justify-between font-body-sm text-on-surface-variant">
                <span>Livraison</span>
                <span className="text-success">Gratuite</span>
              </div>
              <div className="border-t border-outline/20 pt-3 flex justify-between">
                <span className="font-label-md text-on-surface">Total</span>
                <span className="font-headline-sm text-primary">{total.toFixed(2)}&nbsp;&euro;</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="w-full h-12 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors flex items-center justify-center"
            >
              Passer la commande
            </Link>
            <Link
              to="/products"
              className="w-full h-12 border border-outline rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center mt-3"
            >
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
