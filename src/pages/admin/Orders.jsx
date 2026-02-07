import { useEffect, useMemo, useState } from "react";
import { fetchDeskOrders } from "../../api/admin.api";
import OrderDetailModal from "../../components/OrderDetailModal";

const API_BASE = "https://ordering-system-backend-a1az.onrender.com";

/* styling tokens — KEEP EXACTLY AS-IS */
const ACTIVE_STATUSES = ["PLACED", "ACCEPTED", "PREPARING", "READY", "OUT FOR DELIVERY"];
const RECENT_STATUSES = ["COMPLETED", "CANCELLED"];

const statusTone = {
  "PLACED": "bg-sky-100 text-sky-700",
  "ACCEPTED": "bg-blue-100 text-blue-700",
  "PREPARING": "bg-[#FF9A34]/20 text-[#FF9A34]",
  "READY": "bg-[#2AB0A3]/20 text-[#2AB0A3]",
  "OUT FOR DELIVERY": "bg-[#FFE650]/40 text-[#9b7a00]",
  "COMPLETED": "bg-emerald-100 text-emerald-700",
  "CANCELLED": "bg-red-100 text-red-700",
};

const paymentTone = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-yellow-100 text-yellow-800",
};

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatCurrency = (amount) => `₹${amount?.toLocaleString?.("en-IN") ?? amount}`;

export default function Orders() {
  // --- data + load logic (moved INSIDE component) ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDeskOrders();
      const raw = Array.isArray(data) ? data : data?.orders || [];

      // normalize fields so UI doesn't crash if backend uses snake_case or other keys
      const normalized = await Promise.all(raw.map(async (o) => {
        const status = (o.status ?? o.order_status ?? "PLACED")?.toUpperCase?.() || "PLACED";
        let total = o.total ?? o.amount ?? o.grand_total ?? o.subtotal ?? 0;

        // Fetch the correct total based on order status
        try {
          if (status === "COMPLETED") {
            // For completed orders, fetch from invoice endpoint
            const invoiceRes = await fetch(`${API_BASE}/desk/orders/${o.id}/invoice`);
            if (invoiceRes.ok) {
              const invoiceData = await invoiceRes.json();
              total = invoiceData.grand_total ?? invoiceData.total ?? total;
              console.log("Order", o.id, "invoice total:", total);
            }
          } else {
            // For non-completed orders, fetch from order details endpoint and calculate total from items
            const detailRes = await fetch(`${API_BASE}/desk/orders/${o.id}`);
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              console.log("Order", o.id, "items:", detailData.items);
              // Calculate total same way as modal: sum of (quantity * single_price)
              total = (detailData.items || []).reduce((acc, item) => {
                const itemTotal = (item.quantity || 0) * (item.single_price || 0);
                console.log("Item:", item, "calculated:", itemTotal);
                return acc + itemTotal;
              }, 0);
              console.log("Order", o.id, "final calculated total:", total);
            }
          }
        } catch (err) {
          console.log("Failed to fetch order details for", o.id, err);
        }

        return {
          id: o.id ?? o.order_id ?? o.orderId ?? o._id ?? "",
          type: o.type ?? o.order_type ?? o.orderType ?? "Dine-In",
          tableNumber: o.tableNumber ?? o.table_number ?? o.table ?? null,
          customerName: o.customerName ?? o.customer_name ?? o.customer ?? "",
          phone: o.phone ?? o.contact ?? "",
          total: total,
          paymentStatus: o.paymentStatus ?? o.payment_status ?? "Pending",
          status: status,
          timePlaced: o.timePlaced ?? o.created_at ?? o.createdAt ?? new Date().toISOString(),
          paymentMethod: o.paymentMethod ?? o.payment_method ?? o.pay_method ?? "",
          discount: o.discount ?? 0,
          taxes: o.taxes ?? 0,
          instructions: o.instructions ?? o.notes ?? "",
          items: Array.isArray(o.items) ? o.items : o.order_items ?? o.products ?? [],
          timeline: Array.isArray(o.timeline) ? o.timeline : o.events ?? (o.timeline ? [o.timeline] : []),
        };
      }));

      setOrders(normalized);
    } catch (err) {
      setError(err?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // intentionally no other dependencies: one-time fetch on mount
  }, []);

  // --- UI state & filters (kept intact) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadMenu, setDownloadMenu] = useState(null);

  useEffect(() => {
    if (!downloadMenu) return;
    const handleOutside = (event) => {
      if (!event.target.closest(`[data-download-date="${downloadMenu}"]`)) {
        setDownloadMenu(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [downloadMenu]);

  const toggleStatus = (status) => {
    setStatusFilter((prev) => {
      // Single select: if clicking same status, clear. Otherwise select only that status
      return prev.includes(status) ? [] : [status];
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  // NOTE: using orders (fetched) instead of mock ORDERS
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = searchTerm
        ? (order.id || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.phone || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customerName || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesStatus = statusFilter.length ? statusFilter.includes(order.status) : true;
      const matchesType = typeFilter === "all" ? true : order.type === typeFilter;

      const placed = new Date(order.timePlaced).getTime();
      const from = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null;
      const to = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null;
      const matchesDate = (from ? placed >= from : true) && (to ? placed <= to : true);

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, typeFilter, dateFrom, dateTo]);

  const groupedOrders = useMemo(() => {
    const sorted = [...filteredOrders].sort(
      (a, b) => new Date(b.timePlaced).getTime() - new Date(a.timePlaced).getTime()
    );

    const groups = [];
    sorted.forEach((order) => {
      const dateKey = new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(
        new Date(order.timePlaced)
      );
      const monthKey = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
        new Date(order.timePlaced)
      );

      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.date !== dateKey) {
        groups.push({ date: dateKey, month: monthKey, items: [order] });
      } else {
        lastGroup.items.push(order);
      }
    });

    return groups;
  }, [filteredOrders]);

  const renderStatus = (status) => {
    const statusUpperCase = status?.toUpperCase() || "";
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone[status]}`}>
        {statusUpperCase}
      </span>
    );
  };

  const renderPayment = (paymentStatus, orderStatus) => {
    const displayStatus = orderStatus === "COMPLETED" ? "Paid" : paymentStatus;
    const tone = orderStatus === "COMPLETED" ? paymentTone["Paid"] : paymentTone[paymentStatus];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tone}`}>
        {displayStatus}
      </span>
    );
  };

  const normalizeInvoiceRow = (order, invoice) => {
    return {
      invoiceId: invoice?.invoice_number ?? invoice?.invoiceNumber ?? invoice?.invoice_id ?? invoice?.id ?? "",
      orderId: order?.id ?? invoice?.order_id ?? invoice?.orderId ?? "",
      timePlaced:
        invoice?.timePlaced ?? invoice?.created_at ?? invoice?.createdAt ?? order?.timePlaced ?? "",
      customerName: invoice?.customerName ?? invoice?.customer_name ?? order?.customerName ?? "",
      phone: invoice?.phone ?? invoice?.customer_phone ?? order?.phone ?? "",
      paymentMethod: invoice?.paymentMethod ?? invoice?.payment_method ?? order?.paymentMethod ?? "",
      status: invoice?.status ?? order?.status ?? "",
      subtotal: invoice?.subtotal ?? invoice?.sub_total ?? 0,
      taxes: invoice?.tax_total ?? invoice?.taxes ?? 0,
      charges: invoice?.charges_total ?? invoice?.charges ?? 0,
      grandTotal: invoice?.grand_total ?? invoice?.grandTotal ?? invoice?.total ?? 0,
    };
  };

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const toCsv = (rows) => {
    const headers = [
      "invoiceId",
      "orderId",
      "timePlaced",
      "customerName",
      "phone",
      "paymentMethod",
      "status",
      "subtotal",
      "taxes",
      "charges",
      "grandTotal",
    ];
    const escapeCell = (value) => {
      const str = value === null || value === undefined ? "" : String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const lines = [headers.join(",")];
    rows.forEach((row) => {
      lines.push(headers.map((key) => escapeCell(row[key])).join(","));
    });
    return lines.join("\n");
  };

  const fetchInvoicesForOrders = async (ordersToFetch) => {
    const results = await Promise.all(
      ordersToFetch.map(async (order) => {
        try {
          const res = await fetch(`${API_BASE}/desk/orders/${order.id}/invoice`);
          if (!res.ok) return null;
          const data = await res.json();
          const hasInvoice =
            data?.invoice_number || data?.invoiceNumber || data?.invoice_id || data?.grand_total;
          if (!hasInvoice) return null;
          return normalizeInvoiceRow(order, data);
        } catch (err) {
          return null;
        }
      })
    );

    return results.filter(Boolean);
  };

  const handleDownloadInvoices = async (group) => {
    setDownloadMenu(null);
    const invoices = await fetchInvoicesForOrders(group.items);
    if (!invoices.length) {
      window.alert("No invoices found for this date.");
      return;
    }

    const safeDate = (group.date || "date").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const csv = toCsv(invoices);
    downloadFile(csv, `invoices-${safeDate}.csv`, "text/csv;charset=utf-8;");
  };

  const handleDownloadAllFiltered = async () => {
    const invoices = await fetchInvoicesForOrders(filteredOrders);
    if (!invoices.length) {
      window.alert("No invoices found for the current filters.");
      return;
    }

    const safeDate = new Date().toISOString().slice(0, 10);
    const csv = toCsv(invoices);
    downloadFile(csv, `invoices-filtered-${safeDate}.csv`, "text/csv;charset=utf-8;");
  };

  // Optional: show a small loading/error panel but keep main UI unchanged.
  // If you prefer zero UI change while loading, you can remove these early returns.
  if (loading) {
    return <div className="p-6 text-slate-600">Loading orders…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  // --- RENDER (exactly your original UI, untouched classes) ---
  return (
    <div className="space-y-6 text-slate-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Full operational history with live active queues and recent closures.
          </p>
        </div>
        <div className="flex flex-col gap-3 items-end">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#2AB0A3]/30 bg-[#e8f7f5] px-4 py-2 text-sm text-slate-800 shadow-sm">
              Auto-refreshing
            </div>
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-[#2AB0A3] hover:underline"
            >
              Clear filters
            </button>
          </div>
          <button
            onClick={handleDownloadAllFiltered}
            className="rounded-xl border border-[#2AB0A3]/30 bg-[#e8f7f5] px-4 py-2 text-sm text-slate-800 shadow-sm hover:border-[#2AB0A3] hover:bg-[#2AB0A3]/10 transition"
          >
            DOWNLOAD ALL
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500">Search</label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Order ID, phone, or customer"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#2AB0A3] focus:ring-2 focus:ring-[#2AB0A3]/20 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 md:w-80">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#2AB0A3] focus:ring-2 focus:ring-[#2AB0A3]/20 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#2AB0A3] focus:ring-2 focus:ring-[#2AB0A3]/20 outline-none"
              />
            </div>
          </div>
          <div className="w-full md:w-56 flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500">Order type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#2AB0A3] focus:ring-2 focus:ring-[#2AB0A3]/20 outline-none"
            >
              <option value="all">All</option>
              <option value="Dine-In">Dine-In</option>
              <option value="Takeaway">Takeaway</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Status
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 min-w-max py-1">
              <button
                onClick={() => setStatusFilter([])}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                  statusFilter.length === 0
                    ? "border-[#2AB0A3] bg-[#c0ece6] text-[#1f8b82]"
                    : "border-slate-200 text-slate-700 hover:border-[#2AB0A3] hover:bg-white"
                }`}
              >
                ALL
              </button>
              {[...ACTIVE_STATUSES, ...RECENT_STATUSES].map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                    statusFilter.includes(status)
                      ? "border-[#2AB0A3] bg-[#c0ece6] text-[#1f8b82]"
                      : "border-slate-200 text-slate-700 hover:border-[#2AB0A3] hover:bg-white"
                  }`}
                >
                  {status.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {groupedOrders.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-600">
            No orders match the selected filters.
          </div>
        )}

        {groupedOrders.map((group) => (
          <div key={group.date} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#1f8b82] uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2AB0A3]" />
                  {group.month}
                </p>
                <h3 className="text-lg font-semibold text-slate-900">{group.date}</h3>
              </div>
              <div
                className="flex items-center gap-2 relative"
                data-download-date={group.date}
              >
                <span className="text-xs bg-[#e8f7f5] text-[#1f8b82] px-3 py-1 rounded-full font-semibold border border-[#2AB0A3]/30">
                  {group.items.length} orders
                </span>
                <button
                  type="button"
                  className="rounded-full border border-[#2AB0A3]/40 bg-white p-2 text-[#1f8b82] hover:bg-[#e8f7f5] transition"
                  aria-label={`Download invoices for ${group.date}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDownloadMenu((prev) => (prev === group.date ? null : group.date));
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 3a1 1 0 112 0v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4A1 1 0 115.707 8.293L8 10.586V3z" />
                    <path d="M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                </button>
                {downloadMenu === group.date && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg z-20 overflow-hidden">
                    <div className="px-4 py-3 text-sm text-slate-700">
                      Download all invoices for {group.date}
                    </div>
                    <div className="px-4 pb-3">
                      <button
                        type="button"
                        className="w-full rounded-lg bg-[#2AB0A3] px-3 py-2 text-sm font-semibold text-white hover:bg-[#239488] transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadInvoices(group);
                        }}
                      >
                        Download all invoices
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#2AB0A3]/25 bg-white divide-y divide-slate-100 overflow-hidden shadow-sm">
              {group.items.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full text-left px-4 py-3 hover:bg-[#e8f7f5] transition flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">{order.id}</span>
                      <span className={`text-xs font-semibold ${
                        order.type === "DINE_IN" || order.type === "Dine-In"
                          ? "text-green-600"
                          : order.type === "TAKEAWAY" || order.type === "Takeaway"
                          ? "text-blue-600"
                          : order.type === "DELIVERY" || order.type === "Delivery"
                          ? "text-red-600"
                          : "text-slate-500"
                      }`}>{order.type}</span>
                      {(order.type === "DINE_IN" || order.type === "Dine-In") && order.tableNumber && (
                        <span className="text-xs text-slate-500">Table {order.tableNumber}</span>
                      )}
                      {(order.type !== "DINE_IN" && order.type !== "Dine-In") && order.phone && (
                        <span className="text-xs text-slate-500">{order.phone}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {order.customerName || order.phone || "Guest"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap sm:justify-end">
                    {order.status?.toUpperCase() !== "CANCELLED" && renderPayment(order.paymentStatus, order.status)}
                    {renderStatus(order.status)}
                    <span className="text-sm font-semibold text-slate-900">
                      {order.status?.toUpperCase() === "CANCELLED" ? "_" : formatCurrency(order.total)}
                    </span>
                    <span className="text-xs text-slate-500">{formatDateTime(order.timePlaced)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
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
    </div>
  );
}
