import { useEffect, useState } from "react";
import { fetchDeskOrders } from "../../api/admin.api";
import OrderDetailModal from "../../components/OrderDetailModal";
import InvoiceView from "../../components/InvoiceView";

const ACTIVE_STATUSES = ["PLACED", "ACCEPTED", "PREPARING", "READY", "OUT FOR DELIVERY", "IN_PROGRESS"];
const COMPLETED_STATUSES = ["COMPLETED", "DELIVERED"];

const isToday = (value) => {
  if (!value) return false;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return false;
  const today = new Date();
  return (
    dt.getFullYear() === today.getFullYear() &&
    dt.getMonth() === today.getMonth() &&
    dt.getDate() === today.getDate()
  );
};

const formatTime = (value) => {
  const dt = new Date(value);
  return Number.isNaN(dt.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(dt);
};

const formatStatus = (status) => {
  if (!status) return "";
  return status
    .toString()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatCurrency = (amount) => `₹${amount?.toLocaleString?.("en-IN") ?? amount}`;

const formatDateTime = (value) => {
  const dt = new Date(value);
  return Number.isNaN(dt.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(dt);
};

const renderStatus = (status) => {
  const statusTone = {
    "PLACED": "bg-sky-100 text-sky-700",
    "ACCEPTED": "bg-blue-100 text-blue-700",
    "PREPARING": "bg-[#FF9A34]/20 text-[#FF9A34]",
    "READY": "bg-[#2AB0A3]/20 text-[#2AB0A3]",
    "OUT FOR DELIVERY": "bg-[#FFE650]/40 text-[#9b7a00]",
    "COMPLETED": "bg-emerald-100 text-emerald-700",
    "DELIVERED": "bg-emerald-100 text-emerald-700",
    "CANCELLED": "bg-red-100 text-red-700",
  };
  const statusUpperCase = status?.toUpperCase() || "";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone[statusUpperCase]}`}>
      {statusUpperCase}
    </span>
  );
};

const renderPayment = (paymentStatus, orderStatus) => {
  const paymentTone = {
    Paid: "bg-emerald-100 text-emerald-700",
    Pending: "bg-yellow-100 text-yellow-800",
  };
  const displayStatus = orderStatus === "COMPLETED" ? "Paid" : paymentStatus;
  const tone = orderStatus === "COMPLETED" ? paymentTone["Paid"] : paymentTone[paymentStatus];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tone}`}>
      {displayStatus}
    </span>
  );
};

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDeskOrders();
        if (!mounted) return;
        const normalized = (Array.isArray(data) ? data : data?.orders || []).map((o) => ({
          id: o.id ?? o.order_id ?? o.orderId ?? o._id ?? "",
          type: o.type ?? o.order_type ?? o.orderType ?? "Dine-in",
          tableNumber: o.tableNumber ?? o.table_number ?? o.table ?? null,
          customerName: o.customerName ?? o.customer_name ?? o.customer ?? "Guest",
          phone: o.phone ?? o.contact ?? "",
          total: o.total ?? o.amount ?? o.grand_total ?? 0,
          paymentStatus: o.paymentStatus ?? o.payment_status ?? "Pending",
          status: (o.status ?? o.order_status ?? "PLACED")?.toUpperCase?.() || "PLACED",
          timePlaced: o.timePlaced ?? o.created_at ?? o.createdAt ?? new Date().toISOString(),
        })).filter((o) => isToday(o.timePlaced));
        setOrders(normalized);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load dashboard data");
        setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);


  return (
    <div className="space-y-8 text-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        </div>
      </div>
      {/* KPI cards removed as requested */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        {/* Ongoing Orders section removed as requested */}

        {/* Completed Orders section removed as requested */}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          renderStatus={renderStatus}
          renderPayment={(paymentStatus) => renderPayment(paymentStatus, selectedOrder.status)}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
        />
      )}

      {selectedInvoice && (
        <OrderDetailModal
          order={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          renderStatus={renderStatus}
          renderPayment={(paymentStatus) => renderPayment(paymentStatus, selectedInvoice.status)}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
          forceInvoiceView={true}
        />
      )}
    </div>
  );
}
