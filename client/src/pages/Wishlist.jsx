import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useWishlist from '../context/useWishlist.jsx';
import ProductCard from '../components/home/ProductCard';

export default function Wishlist() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems(wishlistItems);
    setLoading(false);
  }, [wishlistItems]);

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
  };

  if (loading) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
        <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-8">Vos favoris</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface-container-lowest rounded-xl overflow-hidden">
              <div className="h-[300px] bg-surface-container animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-4 w-3/4 bg-surface-container animate-pulse rounded" />
                <div className="h-6 w-1/3 bg-surface-container animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-24 text-center">
        <span className="material-symbols-outlined text-8xl text-on-surface-variant/30 mb-4 block">favorite</span>
        <p className="font-headline-sm text-on-surface-variant mb-2">Aucun favori pour le moment</p>
        <p className="font-body-sm text-on-surface-variant/60 mb-6">Parcourez nos produits et ajoutez vos coups de cœur.</p>
        <Link to="/products" className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors inline-block">
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
      <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-8">Vos favoris</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <ProductCard product={item.product} showDiscount />
            <button
              onClick={() => handleRemove(item.productId)}
              className="absolute top-4 right-4 z-10 h-8 w-8 bg-error text-on-error rounded-full flex items-center justify-center hover:bg-error/80 transition-colors"
              aria-label="Retirer des favoris"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
