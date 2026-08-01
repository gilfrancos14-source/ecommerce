import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../utils/api';

const gradients = [
  'from-primary/60 to-tertiary/40',
  'from-secondary/60 to-primary/40',
  'from-tertiary/60 to-secondary/40',
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 px-[16px] md:px-[40px] max-w-[1280px] mx-auto">
      <h2 className="font-headline-lg text-[32px] leading-[40px] text-center text-primary mb-16">
        Explorez nos univers
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[400px] rounded-xl bg-surface-container animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, index) => (
            <Link
              key={cat.slug}
              to={`/categories/${cat.slug}`}
              className="group relative h-[400px] rounded-xl overflow-hidden shadow-sm hover-lift cursor-pointer block"
            >
              {cat.image ? (
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={cat.image}
                  alt={cat.nom}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center ${cat.image ? 'hidden' : 'flex'}`}
              >
                <span className="font-headline-xl text-on-primary/80 text-[48px]">{cat.nom}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                <h3 className="font-headline-md text-[24px] leading-[32px] text-on-primary">{cat.nom}</h3>
                <span className="material-symbols-outlined text-on-primary transform group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
