import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-100 text-blue-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 bg-white border-r shadow-sm hidden md:block">
      <div className="p-4 text-lg font-semibold">Admin</div>
      <nav className="px-4 pb-6 space-y-2 text-sm text-gray-700">
        <NavLink to="/admin/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/menu" className={linkClass}>
          Menu
        </NavLink>
        <NavLink to="/admin/orders" className={linkClass}>
          Orders
        </NavLink>
        <NavLink to="/admin/invoices" className={linkClass}>
          Invoices
        </NavLink>
        <NavLink to="/admin/reports" className={linkClass}>
          Reports
        </NavLink>
      </nav>
    </aside>
  );
}
