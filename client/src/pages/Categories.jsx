import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';

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
    <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-on-surface">Collections</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-2">Nos collections</h1>
        <p className="font-body-md text-on-surface-variant">
          Explorez nos univers et trouvez ce qui vous plaît
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[400px] rounded-xl bg-surface-container animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4 block">category</span>
          <p className="font-headline-sm text-on-surface-variant mb-2">Aucune collection disponible</p>
          <p className="font-body-sm text-on-surface-variant/60">Revenez bientôt pour découvrir nos univers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="font-headline-md text-[24px] leading-[32px] text-on-primary">{cat.nom}</h3>
                {cat.description && (
                  <p className="font-body-sm text-on-primary/70 mt-1 line-clamp-2">{cat.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="font-body-sm text-on-primary/60">
                    {cat._count?.products || 0} produit{(cat._count?.products || 0) !== 1 ? 's' : ''}
                  </span>
                  <span className="material-symbols-outlined text-on-primary transform group-hover:translate-x-2 transition-transform">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
