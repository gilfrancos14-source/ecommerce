const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'noreply@luxe.com';
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || 'LUXE';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

async function sendBrevoEmail({ to, subject, htmlContent }) {
  if (!BREVO_API_KEY) {
    console.warn('BREVO_API_KEY non configuré — email non envoyé');
    return;
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Erreur Brevo:', res.status, err);
    }
  } catch (err) {
    console.error('Erreur envoi email:', err.message);
  }
}

export async function sendOrderConfirmation(user, order) {
  await sendBrevoEmail({
    to: user.email,
    subject: `Confirmation de commande #${order.id.slice(-8).toUpperCase()}`,
    htmlContent: `
      <h2>Merci pour votre commande !</h2>
      <p>Bonjour ${user.nom},</p>
      <p>Votre commande <strong>#${order.id.slice(-8).toUpperCase()}</strong> a bien été enregistrée.</p>
      <p><strong>Total : ${order.total.toFixed(2)} €</strong></p>
      ${order.deliveryFee ? `<p>Frais de livraison : ${order.deliveryFee.toFixed(2)} €</p>` : ''}
      <p>Nous vous tiendrons informé de l'avancement de votre commande.</p>
      <p>L'équipe LUXE</p>
    `,
  });
}

export async function sendShippingNotification(user, order) {
  const trackingLink = order.carrierUrl
    ? `<p><a href="${order.carrierUrl}">Suivre mon colis</a></p>`
    : '';

  await sendBrevoEmail({
    to: user.email,
    subject: `Votre commande #${order.id.slice(-8).toUpperCase()} a été expédiée !`,
    htmlContent: `
      <h2>Votre commande est en route !</h2>
      <p>Bonjour ${user.nom},</p>
      <p>Votre commande <strong>#${order.id.slice(-8).toUpperCase()}</strong> a été expédiée.</p>
      ${order.carrier ? `<p><strong>Transporteur :</strong> ${order.carrier}</p>` : ''}
      ${order.trackingNumber ? `<p><strong>Numéro de suivi :</strong> ${order.trackingNumber}</p>` : ''}
      ${trackingLink}
      ${order.estimatedDelivery ? `<p>Livraison estimée le : <strong>${new Date(order.estimatedDelivery).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>` : ''}
      <p>L'équipe LUXE</p>
    `,
  });
}

export async function sendDeliveryNotification(user, order) {
  await sendBrevoEmail({
    to: user.email,
    subject: `Votre commande #${order.id.slice(-8).toUpperCase()} a été livrée`,
    htmlContent: `
      <h2>Livraison confirmée !</h2>
      <p>Bonjour ${user.nom},</p>
      <p>Votre commande <strong>#${order.id.slice(-8).toUpperCase()}</strong> a bien été livrée.</p>
      <p>Nous espérons que vous êtes satisfait de votre achat.</p>
      <p>N'hésitez pas à laisser un avis sur vos produits.</p>
      <p>L'équipe LUXE</p>
    `,
  });
}

export async function sendPasswordResetCode(user, code) {
  await sendBrevoEmail({
    to: user.email,
    subject: 'Code de réinitialisation de mot de passe',
    htmlContent: `
      <h2>Réinitialisation de mot de passe</h2>
      <p>Bonjour ${user.nom},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Voici votre code de vérification :</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 32px;background:#6750A4;color:#fff;border-radius:12px;">${code}</span>
      </div>
      <p>Ce code expirera dans 15 minutes.</p>
      <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      <p>L'équipe LUXE</p>
    `,
  });
}
