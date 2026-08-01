import { useEffect, useState } from 'react';
import api from '../../utils/api';
import useAuth from '../../context/useAuth.jsx';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/users').then(({ data }) => setUsers(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } catch { /* role update failed */ }
  };

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-surface-container animate-pulse rounded-xl" />)}</div>;
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline/20">
              <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Nom</th>
              <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Email</th>
              <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Rôle</th>
              <th className="text-left px-6 py-4 font-label-sm text-on-surface-variant">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-outline/10 last:border-0">
                <td className="px-6 py-4 font-body-sm text-on-surface">{u.nom}</td>
                <td className="px-6 py-4 font-body-sm text-on-surface-variant">{u.email}</td>
                <td className="px-6 py-4">
                  <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} disabled={u.id === user?.id} className="px-2 py-1 rounded-lg text-xs font-label-sm bg-surface-container border border-outline/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                    <option value="CLIENT">Client</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 font-body-xs text-on-surface-variant">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
