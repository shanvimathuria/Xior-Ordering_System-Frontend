// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

/* Layouts */
import RestaurantLandingLayout from "./layouts/RestaurantLandingLayout";
import OnlineOrderLayout from "./layouts/OnlineOrderLayout";
import DineInLayout from "./layouts/DineInLayout";
import AdminLayout from "./layouts/AdminLayout";
import DeskLayout from "./layouts/DeskLayout";
import KitchenLayout from "./layouts/KitchenLayout";

/* Restaurant Pages */
import Landing from "./pages/restaurant/Landing";
import Menu from "./pages/restaurant/Menu";
import Takeout from "./pages/restaurant/Takeout";
import Delivery from "./pages/restaurant/Delivery";
import Cart from "./pages/restaurant/Cart";
import Checkout from "./pages/restaurant/Checkout";

/* Dine-in */
import DineInMenu from "./pages/dinein/DineInMenu";

/* Admin */
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMenu from "./pages/admin/Menu";
import AdminOrders from "./pages/admin/Orders";
import AdminReports from "./pages/admin/Reports";
import AdminTables from "./pages/admin/Tables";
import AdminTaxesCharges from "./pages/admin/TaxesCharges";
import AdminInvoiceSettings from "./pages/admin/InvoiceSettings";

/* Desk */
import DeskLogin from "./pages/desk/Login";
import DeskDashboard from "./pages/desk/Dashboard";
import OrderDetail from "./pages/desk/OrderDetail";

/* Kitchen */
import Kitchen from "./pages/kitchen/Kitchen";

export default function App() {
  return (
    <Routes>

      {/* Default landing */}
      <Route path="/" element={<Navigate to="/demo" replace />} />

      {/* 🌐 Restaurant (Public) */}
      <Route path="/:restaurantId" element={<RestaurantLandingLayout />}>
        <Route index element={<Landing />} />
        <Route path="menu" element={<Menu />} />
        <Route path="takeout" element={<Takeout />} />
        <Route path="delivery" element={<Delivery />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
      </Route>

      {/* 🍽️ Dine-in QR */}
      <Route path="/:restaurantId/dine/:tableNumber" element={<DineInLayout />}>
        <Route index element={<DineInMenu />} />
      </Route>

      {/* 🧑‍💼 Admin */}
      <Route path="/:restaurantId/admin" element={<AdminLayout />}>
        <Route path="login" element={<AdminLogin />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="tables" element={<AdminTables />} />
        <Route path="taxes-charges" element={<AdminTaxesCharges />} />
        <Route path="invoice-settings" element={<AdminInvoiceSettings />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* 🧾 Desk */}
      <Route path="/:restaurantId/desk" element={<DeskLayout />}>
        <Route path="login" element={<DeskLogin />} />
        <Route path="dashboard" element={<DeskDashboard />} />
        <Route path="orders/:id" element={<OrderDetail />} />
      </Route>

      {/* 👨‍🍳 Kitchen */}
      <Route path="/:restaurantId/kitchen" element={<KitchenLayout />}>
        <Route index element={<Kitchen />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/demo" replace />} />

    </Routes>
  );
}


