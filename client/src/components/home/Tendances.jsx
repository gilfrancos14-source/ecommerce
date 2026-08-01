import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import ProductCard from './ProductCard';

export default function Tendances() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/featured')
      .then(({ data }) => setProducts(data.data.slice(0, 4)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 bg-surface-container-low px-[16px] md:px-[40px]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-headline-lg text-[32px] leading-[40px] text-primary">Tendances du moment</h2>
          <Link to="/products" className="hidden md:flex items-center text-secondary font-label-md text-[14px] leading-[20px] hover:underline">
            Voir tout <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-xl overflow-hidden">
                <div className="h-[300px] bg-surface-container animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-3/4 bg-surface-container animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-surface-container animate-pulse rounded" />
                  <div className="h-6 w-1/3 bg-surface-container animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center md:hidden">
          <Link to="/products" className="px-6 py-3 border border-primary rounded-lg text-primary font-label-md hover:bg-primary hover:text-on-primary transition-colors w-full inline-block">
            Voir tout
          </Link>
        </div>
      </div>
    </section>
  );
}
