import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const images = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgk-G4l6JRcmcUJT1LxneBsicCVmRHC970PrAGvFVPEOfIefozTEyXkMIisZBrJNXO3O6mpYA3MJdC3aXJkgyr8ujFLVOaWQdp6PMg8eQc7azn_OiA8q0DLgGP1Qxsg6-OWbaaphjAFiv72yobYX11SL-_lBMQzFi7Ol-MOoEnYdeHepFOfIX2MIhf4sy-7Mp5Dwe2a9UyWBx8PN2Ks668ipcXcnieUmPz6J30XPj8mHZR7h-NnDQw0K_3etBfgO6wWjQAt7JYd30',
    alt: 'Luxury accessories',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk2p77hIdBib1yBr6sGeAXCofKwNTozME4eIgG7CNvTjIETwJLP2Xvi-KddkM7j1-K6u-aSXvnCFwAOuS67jd07Js1XNFw433XQ6mC1D-g9_wmm2-k2AErPtH8URdBPOE1oggHbwOehX5XRwSwDrnI0B-THKvwvhId55NU3D4-Gf05RcvF-1Go19qmLODCqezmWmmdSBC5-hGw1hBMdLcYrU_6q80VMYOcHM2VlYgUZtSzwiFcg7e9fUpLoB_A4RZLoFXllQm3cYU',
    alt: 'Modern fashion',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByjXudcn9E1AnUCSqGCAKo9gcwatkGbJnoNf6YCakCdt-el6YSSVW1d7pP-XA_lRp-FUhpJnAfZMFhlCet1g1LB9zU7LRQKt0wo3oLsXdDtIsBemJ6wCWkVo8vwoqAAcCHH4NohQcQSyETs9O8wfQ-0ueMRI4aaL3hZhv_KG7p1NJnkPTMuWeXb5M4SuXySDjDL3fX7ISp-A9XZgbO3T_fz-bAe4uwA-j_yKcHzM7RIYwrJHdhl0hwYBFngPI1HP0H9TStL9dNhcg',
    alt: 'High-end interior',
  },
];

export default function Hero() {
  const carouselRef = useRef(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      rotationRef.current -= 120;
      if (carouselRef.current) {
        carouselRef.current.style.transform = `rotateY(${rotationRef.current}deg)`;
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[700px] w-full flex items-center px-[16px] md:px-[40px] py-20">
      <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-start text-left z-10">
          <h1 className="font-display-lg text-[48px] leading-[56px] md:text-[64px] md:leading-[72px] text-primary mb-6">
            Red&eacute;finissez votre style
          </h1>
          <p className="font-body-lg text-[18px] leading-[28px] text-on-surface-variant mb-10 max-w-xl">
            D&eacute;couvrez une collection pens&eacute;e pour l'&eacute;l&eacute;gance intemporelle. Qualit&eacute; premium, design &eacute;pur&eacute; et engagement durable.
          </p>
          <Link to="/products" className="inline-block bg-secondary text-on-secondary font-label-md text-[14px] leading-[20px] px-8 py-4 rounded-lg hover:bg-secondary-container hover:text-on-secondary-container transition-all duration-300 shadow-md hover:shadow-lg">
            Acheter maintenant
          </Link>
        </div>

        <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center perspective-1000 overflow-hidden md:overflow-visible">
          <div
            ref={carouselRef}
            className="relative w-[240px] md:w-[300px] h-[340px] md:h-[420px] transform-style-3d transition-transform duration-1000 ease-in-out"
          >
            {images.map((img, i) => (
              <div
                key={i}
                className="absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-2xl"
                style={{ transform: `rotateY(${i * 120}deg) translateZ(220px)` }}
              >
                <img className="w-full h-full object-cover" src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
