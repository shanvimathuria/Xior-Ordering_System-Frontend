import { NavLink, useParams } from "react-router-dom";

export default function AdminSidebar() {
  const { restaurantId } = useParams();

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-md text-sm font-medium ${
      isActive
        ? "bg-blue-100 text-blue-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-60 bg-white shadow-md p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

      <nav className="space-y-2">
        <NavLink to={`/${restaurantId}/admin/dashboard`} className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to={`/${restaurantId}/admin/menu`} className={linkClass}>
          Menu
        </NavLink>
        <NavLink to={`/${restaurantId}/admin/orders`} className={linkClass}>
          Orders
        </NavLink>
        <NavLink to={`/${restaurantId}/admin/invoices`} className={linkClass}>
          Invoices
        </NavLink>
        <NavLink to={`/${restaurantId}/admin/reports`} className={linkClass}>
          Reports
        </NavLink>
      </nav>
    </aside>
  );
}
