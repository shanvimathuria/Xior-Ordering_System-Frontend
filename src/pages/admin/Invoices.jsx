import { useMemo, useState } from "react";

const STATUS_OPTIONS = ["Paid", "Pending"];

const invoices = [
  {
    id: "INV-001",
    order: "ORD-1045",
    table: "Table 5",
    amount: 1340,
    status: "Paid",
    date: "2024-01-19T12:50:00Z",
    customer: "Anita Rao",
    phone: "9876543210",
    paymentMethod: "UPI",
    items: [
      { name: "Paneer Butter Masala", qty: 1, price: 320 },
      { name: "Butter Naan", qty: 4, price: 60 },
      { name: "Masala Soda", qty: 2, price: 90 },
    ],
    taxes: 102,
    discount: 80,
  },
  {
    id: "INV-002",
    order: "ORD-1044",
    table: "Delivery",
    amount: 1890,
    status: "Pending",
    date: "2024-01-19T12:30:00Z",
    customer: "Rohan Das",
    phone: "9021090210",
    paymentMethod: "Cash on delivery",
    items: [
      { name: "Chicken Biryani Family", qty: 1, price: 780 },
      { name: "Tandoori Chicken", qty: 1, price: 620 },
      { name: "Thums Up 750ml", qty: 2, price: 120 },
    ],
    taxes: 142,
    discount: 0,
  },
  {
    id: "INV-003",
    order: "ORD-1042",
    table: "Table 12",
    amount: 4220,
    status: "Paid",
    date: "2024-01-18T21:45:00Z",
    customer: "Corporate Group",
    phone: "",
    paymentMethod: "Card",
    items: [
      { name: "Veg Platter", qty: 2, price: 620 },
      { name: "Dal Makhani", qty: 3, price: 240 },
      { name: "Garlic Naan", qty: 10, price: 70 },
    ],
    taxes: 310,
    discount: 0,
  },
];

const statusTone = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
};

const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function Invoices() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setDateFrom("");
    setDateTo("");
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = searchTerm
        ? invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.order.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (invoice.customer || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (invoice.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesStatus = statusFilter.length ? statusFilter.includes(invoice.status) : true;

      const issued = new Date(invoice.date).getTime();
      const from = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null;
      const to = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null;
      const matchesDate = (from ? issued >= from : true) && (to ? issued <= to : true);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  const grouped = useMemo(() => {
    const sorted = [...filteredInvoices].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const groups = [];
    sorted.forEach((invoice) => {
      const dateKey = new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(new Date(invoice.date));
      const monthKey = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
        new Date(invoice.date)
      );
      const last = groups[groups.length - 1];
      if (!last || last.date !== dateKey) {
        groups.push({ date: dateKey, month: monthKey, items: [invoice] });
      } else {
        last.items.push(invoice);
      }
    });
    return groups;
  }, [filteredInvoices]);

  return (
    <div className="space-y-6 text-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">Track issued invoices and download them as needed.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearFilters}
            className="text-sm font-semibold text-[#2AB0A3] hover:underline"
          >
            Clear filters
          </button>
          <button className="rounded-xl border border-[#2AB0A3]/40 bg-[#e8f7f5] px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-[#2AB0A3] transition shadow-sm">
            Export all
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
              placeholder="Invoice ID, Order ID, customer or phone"
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
            <label className="text-xs font-semibold text-slate-500">Status</label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter((prev) =>
                      prev.includes(status)
                        ? prev.filter((s) => s !== status)
                        : [...prev, status]
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
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
        {grouped.map((group) => (
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
                {group.items.length} invoices
              </span>
            </div>

            <div className="rounded-2xl border border-[#2AB0A3]/25 bg-white divide-y divide-slate-100 overflow-hidden shadow-sm">
              {group.items.map((invoice) => (
                <button
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className="w-full text-left px-4 py-3 hover:bg-[#e8f7f5] transition flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">{invoice.id}</span>
                      <span className="text-xs font-semibold text-slate-500">{invoice.order}</span>
                      <span className="text-xs text-slate-500">{invoice.table}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {invoice.customer || invoice.phone || "Guest"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap sm:justify-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone[invoice.status]}`}>
                      {invoice.status}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.amount)}</span>
                    <span className="text-xs text-slate-500">{formatDateTime(invoice.date)}</span>
                    <button
                      className="rounded-full border border-[#2AB0A3]/50 bg-white px-3 py-1 text-xs font-semibold text-[#1f8b82] hover:bg-[#e8f7f5] transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        // integrate actual download handler here
                      }}
                      aria-label={`Download ${invoice.id}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 3a1 1 0 112 0v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4A1 1 0 115.707 8.293L8 10.586V3z" />
                        <path d="M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                      </svg>
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
        />
      )}
    </div>
  );
}

function InvoiceModal({ invoice, onClose, formatCurrency, formatDateTime }) {
  const subtotal = invoice.items.reduce((acc, item) => acc + item.qty * item.price, 0);
  const total = subtotal - invoice.discount + invoice.taxes;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-slate-900">{invoice.id}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone[invoice.status]}`}>
                {invoice.status}
              </span>
            </div>
            <p className="text-sm text-slate-500">Issued {formatDateTime(invoice.date)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 text-slate-500"
            aria-label="Close invoice detail"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm text-slate-600">
                Order: <span className="font-semibold text-slate-900">{invoice.order}</span>
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Customer: <span className="font-semibold text-slate-900">{invoice.customer || "Guest"}</span>
                {invoice.phone ? ` • ${invoice.phone}` : ""}
              </p>
              <p className="text-sm text-slate-600 mt-1">Payment: {invoice.paymentMethod}</p>
              <p className="text-sm text-slate-600 mt-1">Table / Type: {invoice.table}</p>
            </div>

            <div className="rounded-xl border border-slate-100">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900">Items</h4>
                <span className="text-xs text-slate-500">Qty · Rate · Amount</span>
              </div>
              <div className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <div key={item.name} className="px-4 py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-semibold">
                        {item.qty}×
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">Rate: {formatCurrency(item.price)}</p>
                      </div>
                    </div>
                    <div className="font-semibold text-slate-900">{formatCurrency(item.qty * item.price)}</div>
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
                <span className="text-sm font-semibold text-slate-900">- {formatCurrency(invoice.discount)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Taxes</span>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.taxes)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-base font-semibold text-slate-900">Total</span>
                <span className="text-lg font-bold text-[#2AB0A3]">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-4 space-y-2">
              <button className="w-full rounded-xl bg-[#2AB0A3] text-white text-sm font-semibold px-4 py-2 shadow-sm hover:bg-[#239488] transition">
                Download invoice
              </button>
              <button className="w-full rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 px-4 py-2 hover:border-[#2AB0A3] hover:text-[#2AB0A3] transition">
                Email invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
