import { useNavigate } from "react-router-dom";

export default function AdminTopbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="h-14 px-6 flex items-center justify-between bg-white border-b shadow-sm">
      <div className="font-semibold text-gray-900">Restaurant Admin</div>
      <button
        onClick={logout}
        className="text-sm text-red-600 hover:text-red-700"
      >
        Logout
      </button>
    </header>
  );
}
