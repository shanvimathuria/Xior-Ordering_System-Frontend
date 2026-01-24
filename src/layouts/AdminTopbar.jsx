import { useParams } from "react-router-dom";

export default function AdminTopbar() {
  const { restaurantId } = useParams();

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = `/${restaurantId}/admin/login`;
  };

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <span className="text-sm text-gray-600">
        Restaurant ID: {restaurantId}
      </span>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
}
