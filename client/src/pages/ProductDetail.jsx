import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import useAuth from '../context/useAuth.jsx';
import useCart from '../context/useCart.jsx';
import useWishlist from '../context/useWishlist.jsx';

function StarRating({ rating, size = 'text-sm' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined ${size} ${
            star <= Math.round(rating) ? 'text-tertiary' : 'text-on-surface-variant/30'
          }`}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isFav, setIsFav] = useState(false);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [reviewNote, setReviewNote] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const cartTimeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(cartTimeoutRef.current);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.data);
        setSelectedImage(0);
        setSelectedVariant(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Produit introuvable');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product) setIsFav(isInWishlist(product.id));
  }, [product, isInWishlist]);

  const currentImages = useMemo(() => {
    if (!product) return [];
    if (selectedVariant && selectedVariant.images?.length) return selectedVariant.images;
    return product.images || [];
  }, [product, selectedVariant]);

  const currentPrice = selectedVariant ? selectedVariant.prix : product?.prix;
  const currentCompareAt = selectedVariant?.compareAtPrice ?? product?.compareAtPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product?.stock;

  const hasDiscount = currentCompareAt && currentCompareAt > currentPrice;
  const discount = hasDiscount
    ? Math.round(((currentCompareAt - currentPrice) / currentCompareAt) * 100)
    : 0;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSubmittingReview(true);
    setReviewError(null);
    api.post(`/products/${product.id}/reviews`, { note: reviewNote, commentaire: reviewComment })
      .then(({ data }) => {
        setProduct((prev) => {
          const updatedReviews = [data.data, ...prev.reviews];
          return {
            ...prev,
            reviews: updatedReviews,
            avgRating: updatedReviews.reduce((s, r) => s + r.note, 0) / updatedReviews.length,
          };
        });
        setReviewComment('');
        setReviewNote(5);
      })
      .catch((err) => {
        setReviewError(err.response?.data?.message || 'Erreur lors de l\'envoi');
      })
      .finally(() => setSubmittingReview(false));
  };

  if (loading) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-[500px] bg-surface-container animate-pulse rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-surface-container animate-pulse rounded" />
            <div className="h-8 w-3/4 bg-surface-container animate-pulse rounded" />
            <div className="h-6 w-1/3 bg-surface-container animate-pulse rounded" />
            <div className="h-20 w-full bg-surface-container animate-pulse rounded" />
            <div className="h-10 w-48 bg-surface-container animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-24 text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4 block">error</span>
        <p className="font-headline-sm text-on-surface-variant mb-2">{error}</p>
        <Link to="/products" className="font-label-md text-secondary hover:underline mt-4 inline-block">
          Retour aux produits
        </Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary transition-colors">Produits</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/categories/${product.category.slug}`} className="hover:text-primary transition-colors">
              {product.category.nom}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-on-surface">{product.nom}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <div className="relative h-[500px] bg-surface-container-lowest rounded-xl overflow-hidden mb-4">
            {currentImages.length > 0 ? (
              <img
                src={currentImages[selectedImage] || currentImages[0]}
                alt={product.nom}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500?text=No+Image'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-8xl text-on-surface-variant/20">image</span>
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-error text-on-error font-label-sm text-[10px] px-2 py-1 rounded-sm uppercase tracking-wider">
                -{discount}%
              </div>
            )}
          </div>
          {currentImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {currentImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-primary' : 'border-transparent hover:border-outline'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=N/A'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <Link to={`/categories/${product.category.slug}`} className="font-label-sm text-secondary uppercase tracking-[0.2em] hover:underline">
              {product.category.nom}
            </Link>
          )}
          <h1 className="font-headline-xl text-[36px] leading-[44px] text-primary mt-2 mb-4">{product.nom}</h1>

          {product.avgRating !== null && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.avgRating} />
              <span className="font-body-sm text-on-surface-variant">
                {product.avgRating.toFixed(1)} ({product.reviews.length} avis)
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            {hasDiscount ? (
              <>
                <span className="font-headline-lg text-[32px] text-error">{currentPrice}&nbsp;&euro;</span>
                <span className="font-body-md text-on-surface-variant line-through">{currentCompareAt}&nbsp;&euro;</span>
              </>
            ) : (
              <span className="font-headline-lg text-[32px] text-primary">{currentPrice}&nbsp;&euro;</span>
            )}
          </div>

          <p className="font-body-md text-on-surface-variant mb-6 leading-relaxed">{product.description}</p>

          {product.variants?.length > 0 && (
            <div className="mb-6">
              <p className="font-label-md text-on-surface mb-3">Variante :</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSelectedVariant(null); setSelectedImage(0); setQuantity(1); }}
                  className={`px-4 py-2 rounded-lg border font-label-sm transition-all ${
                    !selectedVariant
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  Par défaut
                </button>
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVariant(v); setSelectedImage(0); setQuantity(1); }}
                    className={`px-4 py-2 rounded-lg border font-label-sm transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline text-on-surface-variant hover:border-primary/50'
                    }`}
                  >
                    {v.nom}
                    {v.compareAtPrice && v.compareAtPrice > v.prix && (
                      <span className="ml-1 text-error text-xs">-{Math.round(((v.compareAtPrice - v.prix) / v.compareAtPrice) * 100)}%</span>
                    )}
                  </button>
                ))}
              </div>
              {selectedVariant && (
                <div className="mt-2 flex items-center gap-3">
                  <span className="font-body-sm text-on-surface-variant">
                    Stock : {selectedVariant.stock > 0 ? `${selectedVariant.stock} disponible${selectedVariant.stock > 1 ? 's' : ''}` : 'Rupture'}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mb-6">
            <span className={`w-2.5 h-2.5 rounded-full ${currentStock > 0 ? 'bg-success' : 'bg-error'}`} />
            <span className="font-body-sm text-on-surface-variant">
              {currentStock > 0 ? `${currentStock} en stock` : 'Rupture de stock'}
            </span>
          </div>

          {currentStock > 0 && (
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-outline rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-12 w-12 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="h-12 w-12 flex items-center justify-center font-label-md text-on-surface border-x border-outline">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  className="h-12 w-12 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
              <button
                onClick={() => {
                  addItem(product.id, quantity, selectedVariant?.id || null)
                    .then(() => {
                      setAddedToCart(true);
                      clearTimeout(cartTimeoutRef.current);
                      cartTimeoutRef.current = setTimeout(() => setAddedToCart(false), 2000);
                    })
                    .catch((err) => {
                      setError(err.response?.data?.message || 'Erreur lors de l\'ajout au panier');
                    });
                }}
                className="flex-1 h-12 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  {addedToCart ? 'check' : 'add_shopping_cart'}
                </span>
                {addedToCart ? 'Ajouté !' : 'Ajouter au panier'}
              </button>
              <button
                onClick={() => {
                  toggleWishlist(product.id).then((added) => setIsFav(added));
                }}
                className={`h-12 w-12 rounded-lg border flex items-center justify-center transition-colors ${
                  isFav
                    ? 'border-error bg-error/10 text-error'
                    : 'border-outline text-on-surface-variant hover:border-error hover:text-error'
                }`}
              >
                <span className="material-symbols-outlined">{isFav ? 'favorite' : 'favorite_border'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="font-headline-md text-[24px] leading-[32px] text-primary mb-8">Avis clients</h2>

        {isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="bg-surface-container-lowest rounded-xl p-6 mb-8 ambient-shadow">
            <h3 className="font-label-md text-on-surface mb-4">Laisser un avis</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-body-sm text-on-surface-variant">Note :</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewNote(star)}
                    className="p-0.5"
                  >
                    <span className={`material-symbols-outlined text-xl ${
                      star <= reviewNote ? 'text-tertiary' : 'text-on-surface-variant/30'
                    }`}>
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={3}
              className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors resize-none mb-4"
            />
            {reviewError && <p className="font-body-sm text-error mb-4">{reviewError}</p>}
            <button
              type="submit"
              disabled={submittingReview || !reviewComment.trim()}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submittingReview ? 'Envoi...' : 'Publier'}
            </button>
          </form>
        )}

        {product.reviews.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant/60">Aucun avis pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-label-md text-primary">{review.user.nom.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface">{review.user.nom}</p>
                      <p className="font-body-xs text-on-surface-variant">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.note} size="text-base" />
                </div>
                <p className="font-body-sm text-on-surface-variant mt-3">{review.commentaire}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
