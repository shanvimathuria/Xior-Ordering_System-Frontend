import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center justify-center w-full aspect-square rounded-lg text-base font-semibold transition-colors shadow-sm ${
      isActive
        ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
    }`;

  return (
    <aside className="w-64 bg-white border-r shadow-sm hidden md:flex flex-col h-screen">
      <div className="p-4 text-lg font-semibold">Admin</div>
      <nav className="flex-1 flex flex-col gap-4 px-4 pb-6">
        <div className="flex-1 flex flex-col gap-4 justify-between">
          <NavLink to="/admin/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            Orders
          </NavLink>
          <NavLink to="/admin/tables" className={linkClass}>
            Table Management
          </NavLink>
          <NavLink to="/admin/menu" className={linkClass}>
            Menu Management
          </NavLink>
          <NavLink to="/admin/taxes-charges" className={linkClass}>
            Taxes & Charges
          </NavLink>
          <NavLink to="/admin/invoice-settings" className={linkClass}>
            Invoice Settings
          </NavLink>
          <NavLink to="/admin/reports" className={linkClass}>
            Reports
          </NavLink>
        </div>
        {/* Logout button removed as requested */}
      </nav>
    </aside>
  );
}
