export default function BrandValues() {
  const values = [
    {
      icon: 'local_shipping',
      title: 'Livraison Gratuite',
      description: 'Profitez de la livraison offerte pour toute commande supérieure à 100€, partout en Europe.',
    },
    {
      icon: 'lock',
      title: 'Paiement Sécurisé',
      description: 'Vos transactions sont 100% sécurisées grâce aux dernières technologies de cryptage.',
    },
    {
      icon: 'support_agent',
      title: 'Service Client 24/7',
      description: 'Une équipe dédiée est à votre écoute pour vous accompagner à chaque étape.',
    },
  ];

  return (
    <section className="py-20 bg-surface-container-lowest border-y border-outline-variant/30">
      <div className="max-w-[1280px] mx-auto px-[16px] md:px-[40px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-outline-variant/30">
          {values.map((value, i) => (
            <div key={i} className="flex flex-col items-center pt-8 md:pt-0">
              <div className="h-16 w-16 bg-surface-container rounded-full flex items-center justify-center mb-6 text-secondary">
                <span className="material-symbols-outlined text-[32px]">{value.icon}</span>
              </div>
              <h3 className="font-headline-md text-[24px] leading-[32px] text-primary mb-2">{value.title}</h3>
              <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant max-w-xs">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
