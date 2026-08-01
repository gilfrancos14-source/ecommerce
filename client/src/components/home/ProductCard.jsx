import { Link } from 'react-router-dom';
import useCart from '../../context/useCart.jsx';
import useWishlist from '../../context/useWishlist.jsx';

export default function ProductCard({ product, showDiscount = false, showNewBadge = false }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFav = isInWishlist(product.id);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.prix;
  const discount = hasDiscount
    ? Math.round(((product.compareAtPrice - product.prix) / product.compareAtPrice) * 100)
    : 0;

  let images = [];
  try {
    images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
  } catch {
    images = [];
  }
  const imageUrl = images[0] || 'https://via.placeholder.com/300x300?text=No+Image';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, 1).catch(() => {});
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow hover-lift group">
      <div className="relative h-[300px] bg-surface-container overflow-hidden">
        <Link to={`/products/${product.slug || product.id}`}>
            <img
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            src={imageUrl}
            alt={product.nom}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
            }}
          />
        </Link>
        {showDiscount && hasDiscount && (
          <div className="absolute top-4 left-4 bg-error text-on-error font-label-sm text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider">
            -{discount}%
          </div>
        )}
        {showNewBadge && (
          <div className="absolute top-4 left-4 bg-primary text-on-primary font-label-sm text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider">
            Nouveau
          </div>
        )}
        <button
          aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={`absolute top-4 right-4 h-10 w-10 bg-surface/80 rounded-full flex items-center justify-center hover:bg-surface transition-colors backdrop-blur-sm shadow-sm ${
            isFav ? 'text-error' : 'text-on-surface-variant hover:text-error'
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          <span className="material-symbols-outlined text-lg">{isFav ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>
      <div className="p-6">
        <Link to={`/products/${product.slug || product.id}`}>
          <h4 className="font-label-md text-[14px] leading-[20px] text-primary mb-1">{product.nom}</h4>
        </Link>
        <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant mb-4">
          {product.category?.nom || ''}
        </p>
        <div className="flex justify-between items-center">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-[24px] leading-[32px] text-error">{product.prix}&nbsp;&euro;</span>
              <span className="font-body-sm text-on-surface-variant line-through">{product.compareAtPrice}&nbsp;&euro;</span>
            </div>
          ) : (
            <span className="font-headline-md text-[24px] leading-[32px] text-primary">{product.prix}&nbsp;&euro;</span>
          )}
          <button
            aria-label="Ajouter au panier"
            onClick={handleAddToCart}
            className="h-10 w-10 rounded-full border border-outline flex items-center justify-center text-primary hover:bg-secondary hover:text-on-secondary hover:border-secondary transition-all"
          >
            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
