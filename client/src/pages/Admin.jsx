import AdminDashboard from '../components/admin/AdminDashboard';
import AdminOrders from '../components/admin/AdminOrders';
import AdminUsers from '../components/admin/AdminUsers';
import AdminProducts from '../components/admin/AdminProducts';
import AdminCategories from '../components/admin/AdminCategories';
import AdminDelivery from '../components/admin/AdminDelivery';

export default function Admin({ section }) {
  return (
    <div className="px-[16px] md:px-[40px] py-12">
      {section === 'dashboard' && <AdminDashboard />}
      {section === 'orders' && <AdminOrders />}
      {section === 'users' && <AdminUsers />}
      {section === 'products' && <AdminProducts />}
      {section === 'categories' && <AdminCategories />}
      {section === 'delivery' && <AdminDelivery />}
    </div>
  );
}
