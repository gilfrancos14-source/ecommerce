import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useCart from '../context/useCart.jsx';
import useAuth from '../context/useAuth.jsx';
import StripeProvider from '../components/stripe/StripeProvider';
import CheckoutForm from '../components/stripe/CheckoutForm';

export default function Checkout() {
  const { items, total, count, loading: cartLoading, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [adresseLivraison, setAdresseLivraison] = useState(user?.adresse || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [error, setError] = useState(null);

  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [lastTotal, setLastTotal] = useState(null);

  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  useEffect(() => {
    api.get('/delivery-methods')
      .then(({ data }) => {
        setDeliveryMethods(data.data);
        if (data.data.length > 0) setSelectedDelivery(data.data[0]);
      })
      .catch(() => {});
  }, []);

  const getDeliveryFee = () => {
    if (!selectedDelivery) return 0;
    if (selectedDelivery.freeFrom && total >= selectedDelivery.freeFrom) return 0;
    return selectedDelivery.price;
  };

  const orderTotal = total + getDeliveryFee();

  useEffect(() => {
    if (count === 0) return;
    if (orderTotal === lastTotal && clientSecret) return;

    setCreatingIntent(true);
    setClientSecret(null);
    setPaymentIntentId(null);
    setLastTotal(orderTotal);

    api.post('/payments/create-intent', { deliveryMethodId: selectedDelivery?.id || null })
      .then(({ data }) => {
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Erreur lors de la préparation du paiement');
      })
      .finally(() => setCreatingIntent(false));
  }, [count, orderTotal]);

  if (cartLoading) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
        <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-8">Commande</h1>
        <div className="h-64 bg-surface-container animate-pulse rounded-xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-24 text-center">
        <span className="material-symbols-outlined text-8xl text-on-surface-variant/30 mb-4 block">receipt_long</span>
        <p className="font-headline-sm text-on-surface-variant mb-2">Votre panier est vide</p>
        <Link to="/products" className="mt-4 inline-block px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors">
          Voir les produits
        </Link>
      </div>
    );
  }

  const handlePaymentSuccess = async () => {
    try {
      const { data } = await api.post('/orders', {
        adresseLivraison,
        phone,
        paymentIntentId,
        deliveryMethodId: selectedDelivery?.id || null,
      });
      await clearCart();
      navigate(`/orders/${data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande');
    }
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!adresseLivraison.trim() || !phone.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError(null);
  };

  const isAddressValid = adresseLivraison.trim().length >= 5 && phone.trim().length >= 1;

  return (
    <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
      <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-8">Commande</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <form onSubmit={handleAddressSubmit}>
            <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow mb-6">
              <h3 className="font-headline-sm text-primary mb-6">Adresse de livraison</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-label-sm text-on-surface mb-1 block">Adresse</label>
                  <textarea
                    value={adresseLivraison}
                    onChange={(e) => setAdresseLivraison(e.target.value)}
                    placeholder="123 Rue de la Paix, 75001 Paris"
                    rows={3}
                    required
                    className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-on-surface mb-1 block">Téléphone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    required
                    className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </form>

          {deliveryMethods.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow mb-6">
              <h3 className="font-headline-sm text-primary mb-6">Mode de livraison</h3>
              <div className="space-y-3">
                {deliveryMethods.map((method) => {
                  const isSelected = selectedDelivery?.id === method.id;
                  const isFree = method.freeFrom && total >= method.freeFrom;
                  const price = isFree ? 0 : method.price;

                  return (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-outline/20 hover:border-outline/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        checked={isSelected}
                        onChange={() => setSelectedDelivery(method)}
                        className="accent-primary w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-label-md text-on-surface">{method.nom}</span>
                          <span className="font-body-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{method.carrier}</span>
                        </div>
                        <p className="font-body-xs text-on-surface-variant mt-1">{method.description || method.estimatedDays}</p>
                        {method.freeFrom && (
                          <p className="font-body-xs text-success mt-1">Gratuit dès {method.freeFrom} € d'achat</p>
                        )}
                      </div>
                      <span className="font-headline-sm text-primary shrink-0">
                        {price === 0 ? 'Gratuit' : `${price.toFixed(2)} €`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {isAddressValid && (
            <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow mb-6">
              <h3 className="font-headline-sm text-primary mb-6">Paiement</h3>
              {creatingIntent ? (
                <div className="flex items-center justify-center py-8 gap-3">
                  <span className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="font-body-sm text-on-surface-variant">Préparation du paiement...</span>
                </div>
              ) : clientSecret ? (
                <StripeProvider clientSecret={clientSecret}>
                  <CheckoutForm
                    onSuccess={handlePaymentSuccess}
                    onError={setError}
                    disabled={!isAddressValid}
                  />
                </StripeProvider>
              ) : error ? (
                <p className="font-body-sm text-error text-center py-4">{error}</p>
              ) : null}
            </div>
          )}

          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="font-headline-sm text-primary mb-4">Articles ({count})</h3>
            <div className="space-y-3">
              {items.map((item) => {
                const product = item.product;
                const variant = item.variant;
                let images = [];
                try {
                  const src = variant?.images || product.images;
                  images = src ? (typeof src === 'string' ? JSON.parse(src) : src) : [];
                } catch { images = []; }
                const imageUrl = images[0] || 'https://via.placeholder.com/60x60?text=N/A';
                const displayPrice = variant ? variant.prix : product.prix;
                const displayName = variant ? `${product.nom} — ${variant.nom}` : product.nom;
                return (
                  <div key={item.id} className="flex items-center gap-3 py-2">
                    <img
                      src={imageUrl}
                      alt={product.nom}
                      className="w-14 h-14 object-cover rounded-lg shrink-0"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/60x60?text=N/A'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-label-sm text-on-surface truncate">{displayName}</p>
                      <p className="font-body-xs text-on-surface-variant">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-label-sm text-on-surface shrink-0">{(displayPrice * item.quantity).toFixed(2)}&nbsp;&euro;</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow sticky top-[104px]">
            <h3 className="font-headline-sm text-primary mb-6">Récapitulatif</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between font-body-sm text-on-surface-variant">
                <span>Sous-total</span>
                <span>{total.toFixed(2)}&nbsp;&euro;</span>
              </div>
              {selectedDelivery && (
                <div className="flex justify-between font-body-sm text-on-surface-variant">
                  <span>Livraison ({selectedDelivery.nom})</span>
                  <span className={getDeliveryFee() === 0 ? 'text-success' : ''}>
                    {getDeliveryFee() === 0 ? 'Gratuite' : `${getDeliveryFee().toFixed(2)} €`}
                  </span>
                </div>
              )}
              <div className="border-t border-outline/20 pt-3 flex justify-between">
                <span className="font-label-md text-on-surface">Total</span>
                <span className="font-headline-sm text-primary">{orderTotal.toFixed(2)}&nbsp;&euro;</span>
              </div>
            </div>
            {error && !clientSecret && <p className="font-body-sm text-error mb-4">{error}</p>}
            <Link
              to="/cart"
              className="w-full h-12 border border-outline rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center mt-3"
            >
              Retour au panier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
