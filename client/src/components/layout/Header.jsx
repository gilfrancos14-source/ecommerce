import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth.jsx';
import useCart from '../../context/useCart.jsx';
import SearchModal from './SearchModal';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-between px-[16px] md:px-[40px] py-4 max-w-[1280px] mx-auto">
        <Link to="/" className="font-display-lg text-[48px] leading-[56px] font-bold tracking-tighter text-primary">
          LUXE
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link to="/products" className="text-on-surface-variant font-body-md text-[16px] leading-[24px] hover:text-secondary transition-colors duration-300">Tous les produits</Link>
          <Link to="/products?sort=newest" className="text-on-surface-variant font-body-md text-[16px] leading-[24px] hover:text-secondary transition-colors duration-300">Nouveautés</Link>
          <Link to="/categories" className="text-on-surface-variant font-body-md text-[16px] leading-[24px] hover:text-secondary transition-colors duration-300">Collections</Link>
          {isAuthenticated && (
            <Link to="/wishlist" className="text-on-surface-variant font-body-md text-[16px] leading-[24px] hover:text-secondary transition-colors duration-300">Ma Wishlist</Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <button aria-label="Rechercher" onClick={() => setSearchOpen(true)} className="text-primary hover:text-secondary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>

          {!loading && (
            isAuthenticated ? (
              <Link to="/account" aria-label="Mon compte" className="flex items-center text-primary hover:text-secondary transition-colors">
                <span className="material-symbols-outlined">person</span>
                <span className="hidden md:inline ml-1 font-body-md text-[14px]">{user?.nom}</span>
              </Link>
            ) : (
              <Link to="/login" aria-label="Connexion" className="text-primary hover:text-secondary transition-colors">
                <span className="material-symbols-outlined">person</span>
              </Link>
            )
          )}

          <Link to="/cart" aria-label="Panier" className="text-primary hover:text-secondary transition-colors relative">
            <span className="material-symbols-outlined">shopping_cart</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-on-secondary text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{count}</span>
            )}
          </Link>

          {!loading && isAuthenticated && (
            <button
              onClick={handleLogout}
              aria-label="Déconnexion"
              className="text-primary hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          )}

          <button className="md:hidden text-primary" onClick={() => setMobileOpen(!mobileOpen)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden px-[16px] pb-4 space-y-3 bg-surface/95 backdrop-blur-md">
          <Link to="/products" className="block text-on-surface-variant font-body-md hover:text-secondary transition-colors" onClick={() => setMobileOpen(false)}>Tous les produits</Link>
          <Link to="/products?sort=newest" className="block text-on-surface-variant font-body-md hover:text-secondary transition-colors" onClick={() => setMobileOpen(false)}>Nouveautés</Link>
          <Link to="/categories" className="block text-on-surface-variant font-body-md hover:text-secondary transition-colors" onClick={() => setMobileOpen(false)}>Collections</Link>
          {isAuthenticated && (
            <Link to="/wishlist" className="block text-on-surface-variant font-body-md hover:text-secondary transition-colors" onClick={() => setMobileOpen(false)}>Ma Wishlist</Link>
          )}
        </nav>
      )}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
