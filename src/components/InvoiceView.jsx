export default function InvoiceView({ invoice, onClose, formatCurrency, formatDateTime, renderStatus, renderPayment }) {
  const handlePrint = () => {
    window.print();
  };

  const isCancelled = invoice.status?.toUpperCase() === "CANCELLED";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-500">Invoice</p>
                <h3 className="text-xl font-semibold text-slate-900">{invoice.id}</h3>
              </div>
              {renderStatus && invoice.status && renderStatus(invoice.status)}
              {renderPayment && invoice.paymentStatus && renderPayment(invoice.paymentStatus)}
            </div>
            <p className="text-sm text-slate-500">Placed {formatDateTime(invoice.timePlaced)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 text-slate-500"
            aria-label="Close invoice"
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
                    {invoice.type}
                    {invoice.type === "Dine-In" && invoice.tableNumber ? ` · Table ${invoice.tableNumber}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500">Payment Method</p>
                  <p className="text-sm font-semibold text-slate-800">{invoice.paymentMethod}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Customer: {invoice.customerName || "Guest"}
                {invoice.phone ? ` • ${invoice.phone}` : ""}
              </p>
              {invoice.instructions && (
                <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg px-3 py-2">
                  Special instructions: {invoice.instructions}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-100">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900">Items</h4>
                <span className="text-xs text-slate-500">Qty · Modifiers · Notes</span>
              </div>
              <div className="divide-y divide-slate-100">
                {(invoice.items || []).map((item, idx) => (
                  <div key={`${item.name ?? idx}-${idx}`} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.qty && (
                          <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-semibold">
                            {item.qty}×
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          {(item.modifiers || []).length > 0 && (
                            <p className="text-xs text-slate-500">{(item.modifiers || []).join(", ")}</p>
                          )}
                          {item.notes && <p className="text-xs text-slate-500">Note: {item.notes}</p>}
                        </div>
                      </div>
                      <div className="text-right font-semibold text-slate-800">
                        {item.price ? formatCurrency((item.qty || 1) * item.price) : "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.subtotal || 0)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Taxes</span>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.taxes || 0)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Restaurant Charges</span>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.charges || 0)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-base font-semibold text-slate-900">Grand Total</span>
                <span className="text-lg font-bold text-[#2AB0A3]">{formatCurrency(invoice.grandTotal || 0)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Actions</h4>
              <button 
                onClick={handlePrint}
                className="w-full rounded-xl bg-[#2AB0A3] text-white text-sm font-semibold px-4 py-2 shadow-sm hover:bg-[#239488] transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
