import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CheckoutForm({ onSuccess, onError, disabled }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    onError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/checkout/success',
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message);
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || processing || disabled}
        className="w-full h-12 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <span className="animate-spin h-4 w-4 border-2 border-on-primary border-t-transparent rounded-full" />
            Paiement en cours...
          </>
        ) : (
          'Payer maintenant'
        )}
      </button>
    </form>
  );
}
