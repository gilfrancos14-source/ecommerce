import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../utils/api';

const STATUS_LABELS = {
  PENDING: { label: 'En attente', color: 'bg-tertiary/10 text-tertiary' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-primary/10 text-primary' },
  SHIPPED: { label: 'Expédiée', color: 'bg-secondary/10 text-secondary' },
  DELIVERED: { label: 'Livrée', color: 'bg-success/10 text-success' },
  CANCELLED: { label: 'Annulée', color: 'bg-error/10 text-error' },
};

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">{icon}</span>
        </div>
        <div>
          <p className="font-body-sm text-on-surface-variant">{label}</p>
          <p className="font-headline-sm text-primary">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/admin/stats').then(({ data }) => setStats(data.data)),
      api.get('/admin/stats/detailed').then(({ data }) => setDetailedStats(data.data)),
      api.get('/admin/stock-alerts').then(({ data }) => setStockAlerts(data.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-surface-container animate-pulse rounded-xl" />)}
        </div>
        <div className="h-80 bg-surface-container animate-pulse rounded-xl" />
        <div className="h-80 bg-surface-container animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="people" label="Utilisateurs" value={stats.totalUsers} />
        <StatCard icon="inventory_2" label="Produits" value={stats.totalProducts} />
        <StatCard icon="receipt_long" label="Commandes" value={stats.totalOrders} />
        <StatCard icon="euro" label="Chiffre d'affaires" value={`${stats.totalRevenue.toFixed(2)} €`} />
      </div>

      {stockAlerts.length > 0 && (
        <div className="bg-error/5 border border-error/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-error">warning</span>
            <h3 className="font-headline-sm text-error">Alertes stock ({stockAlerts.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stockAlerts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-surface-container-lowest rounded-lg p-3">
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${p.stock === 0 ? 'bg-error' : 'bg-tertiary'}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-label-sm text-on-surface truncate">{p.nom}</p>
                  <p className="font-body-xs text-on-surface-variant">{p.category?.nom}</p>
                </div>
                <span className={`font-label-sm shrink-0 ${p.stock === 0 ? 'text-error' : 'text-tertiary'}`}>
                  {p.stock === 0 ? 'Rupture' : `${p.stock} restant${p.stock > 1 ? 's' : ''}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {detailedStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="font-headline-sm text-primary mb-6">Évolution des commandes (30 jours)</h3>
            {detailedStats.ordersByDay.length === 0 ? (
              <p className="font-body-sm text-on-surface-variant/60 text-center py-12">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={detailedStats.ordersByDay}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6750A4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6750A4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CAC4D0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#79747E' }} tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} />
                  <YAxis tick={{ fontSize: 12, fill: '#79747E' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value, name) => name === 'revenue' ? [`${value.toFixed(2)} €`, 'CA'] : [value, 'Commandes']} labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  <Area type="monotone" dataKey="revenue" stroke="#6750A4" fill="url(#colorRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="count" stroke="#0B57D0" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <h3 className="font-headline-sm text-primary mb-6">Statuts des commandes</h3>
            {detailedStats.ordersByStatus.length === 0 ? (
              <p className="font-body-sm text-on-surface-variant/60 text-center py-12">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={detailedStats.ordersByStatus.map((s) => ({ name: STATUS_LABELS[s.status]?.label || s.status, value: s.count }))} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {detailedStats.ordersByStatus.map((s, i) => {
                      const colors = ['#79747E', '#6750A4', '#0B57D0', '#146A3C', '#B3261E'];
                      return <Cell key={i} fill={colors[i % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {detailedStats && detailedStats.topProducts.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
          <h3 className="font-headline-sm text-primary mb-6">Produits les plus vendus</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={detailedStats.topProducts} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CAC4D0" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#79747E' }} />
              <YAxis dataKey="nom" type="category" width={180} tick={{ fontSize: 12, fill: '#49454F' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value, name) => name === 'totalRevenue' ? [`${value.toFixed(2)} €`, 'CA'] : [value, 'Vendus']} />
              <Bar dataKey="totalSold" fill="#6750A4" radius={[0, 6, 6, 0]} name="Vendus" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {detailedStats && detailedStats.revenueByCategory.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
          <h3 className="font-headline-sm text-primary mb-6">Revenus par catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={detailedStats.revenueByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CAC4D0" />
              <XAxis dataKey="categoryName" tick={{ fontSize: 12, fill: '#49454F' }} />
              <YAxis tick={{ fontSize: 12, fill: '#79747E' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value, name) => name === 'revenue' ? [`${value.toFixed(2)} €`, 'CA'] : [value, 'Articles vendus']} />
              <Bar dataKey="revenue" fill="#0B57D0" radius={[6, 6, 0, 0]} name="CA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
        <h3 className="font-headline-sm text-primary mb-4">Commandes récentes</h3>
        {stats.recentOrders.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant/60">Aucune commande</p>
        ) : (
          <div className="space-y-3">
            {stats.recentOrders.map((order) => {
              const status = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
              return (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-outline/10 last:border-0">
                  <div>
                    <span className="font-label-sm text-on-surface">#{order.id.slice(-8).toUpperCase()}</span>
                    <span className="font-body-xs text-on-surface-variant ml-2">{order.user.nom}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-label-sm ${status.color}`}>{status.label}</span>
                    <span className="font-label-sm text-primary">{order.total.toFixed(2)} €</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
