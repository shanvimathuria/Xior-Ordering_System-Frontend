import {
  Outlet,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";

export default function DeskLayout() {
  const { restaurantId } = useParams();
  const isLoggedIn = localStorage.getItem("deskLoggedIn");
  const location = useLocation();
  const isLoginRoute = location.pathname === `/${restaurantId}/desk/login`;

  if (!isLoggedIn && !isLoginRoute) {
    return <Navigate to={`/${restaurantId}/desk/login`} replace />;
  }

  if (isLoginRoute) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}
