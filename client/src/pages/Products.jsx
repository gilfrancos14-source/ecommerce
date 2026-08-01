import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/home/ProductCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'prix_asc', label: 'Prix croissant' },
  { value: 'prix_desc', label: 'Prix décroissant' },
  { value: 'nom_asc', label: 'Nom A-Z' },
  { value: 'nom_desc', label: 'Nom Z-A' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const currentSort = searchParams.get('sort') || 'newest';
  const currentCategory = searchParams.get('categoryId') || '';
  const currentMinPrix = searchParams.get('minPrix') || '';
  const currentMaxPrix = searchParams.get('maxPrix') || '';
  const currentNom = searchParams.get('nom') || '';

  const [minPrixInput, setMinPrixInput] = useState(currentMinPrix);
  const [maxPrixInput, setMaxPrixInput] = useState(currentMaxPrix);

  useEffect(() => {
    setMinPrixInput(currentMinPrix);
    setMaxPrixInput(currentMaxPrix);
  }, [currentMinPrix, currentMaxPrix]);

  const buildParams = useCallback(() => {
    const params = {};
    const page = searchParams.get('page');
    const sort = searchParams.get('sort');
    const categoryId = searchParams.get('categoryId');
    const minPrix = searchParams.get('minPrix');
    const maxPrix = searchParams.get('maxPrix');
    const nom = searchParams.get('nom');
    if (page) params.page = page;
    if (sort) params.sort = sort;
    if (categoryId) params.categoryId = categoryId;
    if (minPrix) params.minPrix = minPrix;
    if (maxPrix) params.maxPrix = maxPrix;
    if (nom) params.nom = nom;
    return params;
  }, [searchParams]);

  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const { keepPage, ...realUpdates } = updates;
      const setPage = 'page' in realUpdates;
      Object.entries(realUpdates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      if (!keepPage && !setPage) {
        next.delete('page');
      }
      return next;
    });
  }, [setSearchParams]);

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = buildParams();
    api.get('/products', { params })
      .then(({ data }) => {
        setProducts(data.data);
        setPagination({ total: data.total, page: data.page, totalPages: data.totalPages });
      })
      .catch(() => {
        setProducts([]);
        setPagination({ total: 0, page: 1, totalPages: 1 });
      })
      .finally(() => setLoading(false));
  }, [buildParams]);

  const handleSort = (e) => {
    updateParams({ sort: e.target.value, keepPage: true });
  };

  const handleCategory = (categoryId) => {
    updateParams({ categoryId });
  };

  const handlePriceFilter = () => {
    updateParams({ minPrix: minPrixInput, maxPrix: maxPrixInput, keepPage: true });
  };

  const handlePageChange = (page) => {
    updateParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setMinPrixInput('');
    setMaxPrixInput('');
  };

  const hasActiveFilters = currentCategory || currentMinPrix || currentMaxPrix || currentNom;

  return (
    <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-12">
      <div className="mb-8">
        <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-2">Nos produits</h1>
        <p className="font-body-md text-on-surface-variant">
          {pagination.total} produit{pagination.total !== 1 ? 's' : ''} trouvé{pagination.total !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-primary">Filtres</h3>
              {hasActiveFilters && (
                <button onClick={handleResetFilters} className="font-label-sm text-secondary hover:text-on-surface transition-colors">
                  Tout effacer
                </button>
              )}
            </div>

            <div>
              <h4 className="font-label-md text-on-surface mb-3">Catégorie</h4>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={currentCategory === cat.id}
                      onChange={() => handleCategory(currentCategory === cat.id ? '' : cat.id)}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="font-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                      {cat.nom}
                    </span>
                    <span className="font-body-xs text-on-surface-variant/60 ml-auto">({cat._count.products})</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-label-md text-on-surface mb-3">Prix</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrixInput}
                  onChange={(e) => setMinPrixInput(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
                <span className="text-on-surface-variant">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrixInput}
                  onChange={(e) => setMaxPrixInput(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                onClick={handlePriceFilter}
                className="mt-2 w-full py-2 bg-primary text-on-primary rounded-lg font-label-sm hover:bg-primary/90 transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <span className="font-body-sm text-on-surface-variant">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            <select
              value={currentSort}
              onChange={handleSort}
              className="px-4 py-2 bg-surface-container rounded-lg border border-outline/20 font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
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
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4 block">search_off</span>
              <p className="font-headline-sm text-on-surface-variant mb-2">Aucun produit trouvé</p>
              <p className="font-body-sm text-on-surface-variant/60 mb-6">Essayez de modifier vos filtres</p>
              <button onClick={handleResetFilters} className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} showDiscount />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="h-10 w-10 rounded-full border border-outline flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-10 w-10 rounded-full font-label-sm transition-colors ${
                        page === pagination.page
                          ? 'bg-primary text-on-primary'
                          : 'border border-outline text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="h-10 w-10 rounded-full border border-outline flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
