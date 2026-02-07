import {
  Outlet,
  Navigate,
  NavLink,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

export default function AdminLayout() {
  const { restaurantId } = useParams();
  const isLoggedIn = localStorage.getItem("adminLoggedIn");
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginRoute = location.pathname === `/${restaurantId}/admin/login`;

  const navItems = [
    { label: "Dashboard", to: `/${restaurantId}/admin/dashboard` },
    { label: "Orders", to: `/${restaurantId}/admin/orders` },
    { label: "Table Management", to: `/${restaurantId}/admin/tables` },
    { label: "Menu Management", to: `/${restaurantId}/admin/menu` },
    { label: "Taxes & Charges", to: `/${restaurantId}/admin/taxes-charges` },
    { label: "Invoice Settings", to: `/${restaurantId}/admin/invoice-settings` },
    { label: "Reports", to: `/${restaurantId}/admin/reports` },
  ];

  if (!isLoggedIn && !isLoginRoute) {
    return <Navigate to={`/${restaurantId}/admin/login`} replace />;
  }

  if (isLoginRoute) {
    return <Outlet />;
  }

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate(`/${restaurantId}/admin/login`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-slate-700 flex">
      <aside className="w-72 bg-white/90 border-r border-slate-100 shadow-sm fixed inset-y-0 left-0 flex flex-col">
        <div className="px-6 pt-8 pb-6">
          <p className="text-xs uppercase tracking-[0.25rem] text-slate-400">Admin</p>
          <h1 className="text-xl font-semibold text-slate-800 mt-1">Evergreen Bistro</h1>
          <p className="text-sm text-slate-500 mt-1">ID: {restaurantId}</p>
        </div>
        <nav className="flex-1 flex flex-col justify-between px-4 pb-6">
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-center w-full h-14 rounded-lg text-base font-semibold transition-colors shadow-sm ${
                    isActive
                      ? "bg-[#2AB0A3]/10 text-[#2AB0A3] border-2 border-[#2AB0A3]/30"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          {/* Logout button removed as requested */}
        </nav>
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#FF5A5C] hover:bg-[#FF5A5C]/10"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 pl-72 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 backdrop-blur bg-[#FFF8F0]/80 border-b border-slate-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25rem] text-slate-400">Restaurant Admin</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Evergreen Bistro</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#2AB0A3]" aria-hidden />
                <span>ID: {restaurantId}</span>
                <span>Role: Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
