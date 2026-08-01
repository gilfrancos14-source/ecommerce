import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useAuth from '../../context/useAuth.jsx';

const NAV_ITEMS = [
  { to: '/admin', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: 'receipt_long', label: 'Commandes' },
  { to: '/admin/users', icon: 'people', label: 'Utilisateurs' },
  { to: '/admin/products', icon: 'inventory_2', label: 'Produits' },
  { to: '/admin/categories', icon: 'category', label: 'Catégories' },
  { to: '/admin/delivery', icon: 'local_shipping', label: 'Livraison' },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-88px)]">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-50 h-12 w-12 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-[88px] left-0 z-40 h-[calc(100vh-88px)] w-64 bg-surface-container-lowest border-r border-outline/20 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-outline/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-label-md text-primary">{user?.nom?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="font-label-md text-on-surface truncate">{user?.nom}</p>
              <p className="font-body-xs text-on-surface-variant">Administrateur</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-[14px] transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-label-md'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-outline/10">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-[14px] text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            Retour à la boutique
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
