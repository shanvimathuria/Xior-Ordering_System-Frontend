import { useMemo, useState } from "react";

const ACTIVE_STATUSES = ["New", "Accepted", "Preparing", "Ready", "Out for Delivery"];
const RECENT_STATUSES = ["Completed", "Cancelled"];

const ORDERS = [
  {
    id: "ORD-1045",
    type: "Dine-In",
    tableNumber: "5",
    customerName: "Anita Rao",
    phone: "9876543210",
    total: 1340,
    paymentStatus: "Paid",
    status: "Preparing",
    timePlaced: "2024-01-19T12:35:00Z",
    paymentMethod: "UPI",
    discount: 80,
    taxes: 102,
    instructions: "Less oil, no raw onions",
    items: [
      { name: "Paneer Butter Masala", qty: 1, price: 320, modifiers: ["Extra spicy"], notes: "" },
      { name: "Butter Naan", qty: 4, price: 60, modifiers: [], notes: "" },
      { name: "Masala Soda", qty: 2, price: 90, modifiers: ["Low ice"], notes: "" },
    ],
    timeline: [
      { label: "New", at: "2024-01-19T12:35:00Z" },
      { label: "Accepted", at: "2024-01-19T12:37:00Z" },
      { label: "Preparing", at: "2024-01-19T12:40:00Z" },
    ],
  },
  {
    id: "ORD-1044",
    type: "Delivery",
    tableNumber: null,
    customerName: "Rohan Das",
    phone: "9021090210",
    total: 1890,
    paymentStatus: "Pending",
    status: "Out for Delivery",
    timePlaced: "2024-01-19T11:50:00Z",
    paymentMethod: "Cash on delivery",
    discount: 0,
    taxes: 142,
    instructions: "Call on arrival",
    items: [
      { name: "Chicken Biryani Family", qty: 1, price: 780, modifiers: ["Leg piece"], notes: "" },
      { name: "Tandoori Chicken", qty: 1, price: 620, modifiers: ["Well done"], notes: "" },
      { name: "Thums Up 750ml", qty: 2, price: 120, modifiers: [], notes: "" },
    ],
    timeline: [
      { label: "New", at: "2024-01-19T11:50:00Z" },
      { label: "Accepted", at: "2024-01-19T11:52:00Z" },
      { label: "Preparing", at: "2024-01-19T12:05:00Z" },
      { label: "Ready", at: "2024-01-19T12:25:00Z" },
      { label: "Out for Delivery", at: "2024-01-19T12:30:00Z" },
    ],
  },
  {
    id: "ORD-1043",
    type: "Takeaway",
    tableNumber: null,
    customerName: "Walk-in",
    phone: "9811198111",
    total: 460,
    paymentStatus: "Paid",
    status: "Ready",
    timePlaced: "2024-01-19T12:10:00Z",
    paymentMethod: "Card",
    discount: 20,
    taxes: 32,
    instructions: "Pack sauces separately",
    items: [
      { name: "Veg Roll", qty: 2, price: 120, modifiers: ["Extra mint chutney"], notes: "" },
      { name: "Cold Coffee", qty: 2, price: 80, modifiers: ["Less sugar"], notes: "" },
    ],
    timeline: [
      { label: "New", at: "2024-01-19T12:10:00Z" },
      { label: "Accepted", at: "2024-01-19T12:12:00Z" },
      { label: "Preparing", at: "2024-01-19T12:18:00Z" },
      { label: "Ready", at: "2024-01-19T12:32:00Z" },
    ],
  },
  {
    id: "ORD-1042",
    type: "Dine-In",
    tableNumber: "12",
    customerName: "Corporate Group",
    phone: "",
    total: 4220,
    paymentStatus: "Paid",
    status: "Completed",
    timePlaced: "2024-01-18T20:05:00Z",
    paymentMethod: "Card",
    discount: 0,
    taxes: 310,
    instructions: "Serve starters together",
    items: [
      { name: "Veg Platter", qty: 2, price: 620, modifiers: ["Extra paneer"], notes: "" },
      { name: "Dal Makhani", qty: 3, price: 240, modifiers: ["Butter on side"], notes: "" },
      { name: "Garlic Naan", qty: 10, price: 70, modifiers: [], notes: "" },
    ],
    timeline: [
      { label: "New", at: "2024-01-18T20:05:00Z" },
      { label: "Accepted", at: "2024-01-18T20:07:00Z" },
      { label: "Preparing", at: "2024-01-18T20:12:00Z" },
      { label: "Ready", at: "2024-01-18T20:45:00Z" },
      { label: "Completed", at: "2024-01-18T21:40:00Z" },
    ],
  },
  {
    id: "ORD-1041",
    type: "Delivery",
    tableNumber: null,
    customerName: "Meera K",
    phone: "9810098100",
    total: 980,
    paymentStatus: "Paid",
    status: "Cancelled",
    timePlaced: "2024-01-18T18:50:00Z",
    paymentMethod: "UPI",
    discount: 0,
    taxes: 74,
    instructions: "Allergic to peanuts",
    items: [
      { name: "Veg Pulao", qty: 1, price: 260, modifiers: [], notes: "" },
      { name: "Paneer Tikka", qty: 1, price: 420, modifiers: ["Well roasted"], notes: "" },
    ],
    timeline: [
      { label: "New", at: "2024-01-18T18:50:00Z" },
      { label: "Accepted", at: "2024-01-18T18:55:00Z" },
      { label: "Cancelled", at: "2024-01-18T19:05:00Z" },
    ],
  },
  {
    id: "ORD-1040",
    type: "Takeaway",
    tableNumber: null,
    customerName: "Walk-in",
    phone: "7000070000",
    total: 560,
    paymentStatus: "Paid",
    status: "Completed",
    timePlaced: "2024-01-18T12:25:00Z",
    paymentMethod: "Cash",
    discount: 0,
    taxes: 42,
    instructions: "",
    items: [
      { name: "Chole Bhature", qty: 2, price: 180, modifiers: [], notes: "" },
      { name: "Sweet Lassi", qty: 2, price: 100, modifiers: ["Chilled"], notes: "" },
    ],
    timeline: [
      { label: "New", at: "2024-01-18T12:25:00Z" },
      { label: "Accepted", at: "2024-01-18T12:26:00Z" },
      { label: "Preparing", at: "2024-01-18T12:30:00Z" },
      { label: "Ready", at: "2024-01-18T12:50:00Z" },
      { label: "Completed", at: "2024-01-18T13:05:00Z" },
    ],
  },
];

const statusTone = {
  New: "bg-slate-200 text-slate-800",
  Accepted: "bg-blue-100 text-blue-700",
  Preparing: "bg-[#FF9A34]/20 text-[#FF9A34]",
  Ready: "bg-[#2AB0A3]/20 text-[#2AB0A3]",
  "Out for Delivery": "bg-[#FFE650]/40 text-[#9b7a00]",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
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

const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const toggleStatus = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const filteredOrders = useMemo(() => {
    return ORDERS.filter((order) => {
      const matchesSearch = searchTerm
        ? order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesStatus = statusFilter.length ? statusFilter.includes(order.status) : true;
      const matchesType = typeFilter === "all" ? true : order.type === typeFilter;

      const placed = new Date(order.timePlaced).getTime();
      const from = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null;
      const to = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null;
      const matchesDate =
        (from ? placed >= from : true) &&
        (to ? placed <= to : true);

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [searchTerm, statusFilter, typeFilter, dateFrom, dateTo]);

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

  const renderStatus = (status) => (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone[status]}`}>
      {status}
    </span>
  );

  const renderPayment = (paymentStatus) => (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentTone[paymentStatus]}`}>
      {paymentStatus}
    </span>
  );

  return (
    <div className="space-y-6 text-slate-700">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Full operational history with live active queues and recent closures.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
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
            <span className="text-[11px] bg-[#d8f3ef] text-[#1e7f77] px-2 py-1 rounded-full">
              {statusFilter.length ? `${statusFilter.length} selected` : "All"}
            </span>
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 min-w-max py-1">
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
                  {status}
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
              <span className="text-xs bg-[#e8f7f5] text-[#1f8b82] px-3 py-1 rounded-full font-semibold border border-[#2AB0A3]/30">
                {group.items.length} orders
              </span>
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
                      <span className="text-xs font-semibold text-slate-500">{order.type}</span>
                      {order.type === "Dine-In" && order.tableNumber && (
                        <span className="text-xs text-slate-500">Table {order.tableNumber}</span>
                      )}
                      {order.type !== "Dine-In" && order.phone && (
                        <span className="text-xs text-slate-500">{order.phone}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {order.customerName || order.phone || "Guest"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap sm:justify-end">
                    {renderPayment(order.paymentStatus)}
                    {renderStatus(order.status)}
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(order.total)}</span>
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
          renderPayment={renderPayment}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, renderStatus, renderPayment, formatCurrency, formatDateTime }) {
  const subtotal = order.items.reduce((acc, item) => acc + item.qty * item.price, 0);
  const totalWithAdjustments = subtotal - order.discount + order.taxes;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white max-w-5xl w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-slate-900">{order.id}</h3>
              {renderStatus(order.status)}
              {renderPayment(order.paymentStatus)}
            </div>
            <p className="text-sm text-slate-500">Placed {formatDateTime(order.timePlaced)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 text-slate-500"
            aria-label="Close order detail"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Order Type</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {order.type}
                    {order.type === "Dine-In" && order.tableNumber ? ` · Table ${order.tableNumber}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500">Payment Method</p>
                  <p className="text-sm font-semibold text-slate-800">{order.paymentMethod}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Customer: {order.customerName || "Guest"}
                {order.phone ? ` • ${order.phone}` : ""}
              </p>
              {order.instructions && (
                <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg px-3 py-2">
                  Special instructions: {order.instructions}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-100">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900">Items</h4>
                <span className="text-xs text-slate-500">Qty · Modifiers · Notes</span>
              </div>
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.name} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-semibold">
                          {item.qty}×
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          {item.modifiers.length > 0 && (
                            <p className="text-xs text-slate-500">{item.modifiers.join(", ")}</p>
                          )}
                          {item.notes && <p className="text-xs text-slate-500">Note: {item.notes}</p>}
                        </div>
                      </div>
                      <div className="text-right font-semibold text-slate-800">
                        {formatCurrency(item.qty * item.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Order Timeline</h4>
              <div className="space-y-2">
                {order.timeline.map((event) => (
                  <div key={`${order.id}-${event.label}`} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-[#2AB0A3]" />
                    <span className="font-semibold text-slate-800 w-28">{event.label}</span>
                    <span className="text-slate-500">{formatDateTime(event.at)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Discount</span>
                <span className="text-sm font-semibold text-slate-900">- {formatCurrency(order.discount)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Taxes</span>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(order.taxes)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-base font-semibold text-slate-900">Grand Total</span>
                <span className="text-lg font-bold text-[#2AB0A3]">{formatCurrency(totalWithAdjustments)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Actions</h4>
              <div className="flex flex-col gap-2">
                <button className="rounded-xl bg-[#2AB0A3] text-white text-sm font-semibold px-4 py-2 shadow-sm hover:bg-[#239488] transition">
                  Reprint invoice
                </button>
                <button className="rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 px-4 py-2 hover:border-[#2AB0A3] hover:text-[#2AB0A3] transition">
                  View payment receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
