import { useState, useEffect } from "react";
import InvoiceView from "./InvoiceView";

const API_BASE = "https://ordering-system-backend-a1az.onrender.com";

export default function OrderDetailModal({ order, onClose, renderStatus, renderPayment, formatCurrency, formatDateTime, forceInvoiceView = false }) {
  const [orderData, setOrderData] = useState(order);
  const [invoice, setInvoice] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasInvoice, setHasInvoice] = useState(null);

  // Fetch invoice by order ID
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`${API_BASE}/desk/orders/${order.id}/invoice`);
        
        if (res.ok) {
          const invoiceData = await res.json();
          console.log("Invoice data from API:", invoiceData); // Debug log
          
          // Check if this is an actual invoice (has invoice_number field) or just order data
          if (!invoiceData.invoice_number) {
            console.log("No invoice_number found, fetching order details instead");
            setHasInvoice(false);
            // Call fetchOrderDetailsData and wait for it
            return fetchOrderDetailsData();
          }
          
          // Normalize items with proper field mapping
          const normalizedItems = (invoiceData.items || []).map(item => ({
            name: item.name || item.item_name || item.itemName || "",
            qty: item.quantity ?? item.qty ?? item.Quantity ?? item.Qty ?? 0,
            price: item.single_price ?? item.price ?? item.unit_price ?? item.unitPrice ?? 0,
            modifiers: item.modifiers || item.modifier || item.modifications || [],
            notes: item.notes || item.special_notes || item.specialNotes || item.instructions || ""
          }));

          // Normalize invoice data
          const normalizedInvoice = {
            id: invoiceData.id ?? invoiceData.order_id ?? order.id,
            type: invoiceData.type ?? order.type,
            tableNumber: invoiceData.tableNumber ?? order.tableNumber,
            customerName: invoiceData.customerName ?? order.customerName,
            phone: invoiceData.phone ?? order.phone,
            paymentStatus: invoiceData.paymentStatus ?? order.paymentStatus,
            status: invoiceData.status ?? order.status,
            timePlaced: invoiceData.timePlaced ?? order.timePlaced,
            paymentMethod: invoiceData.paymentMethod ?? order.paymentMethod,
            subtotal: invoiceData.subtotal ?? 0,
            taxes: invoiceData.tax_total ?? invoiceData.taxes ?? 0,
            charges: invoiceData.charges_total ?? invoiceData.charges ?? 0,
            grandTotal: invoiceData.grand_total ?? invoiceData.grandTotal ?? 0,
            instructions: invoiceData.instructions ?? order.instructions,
            items: normalizedItems,
          };
          setInvoice(normalizedInvoice);
          console.log("Normalized invoice:", normalizedInvoice); // Debug log
          setHasInvoice(true);
          setLoading(false);
        } else {
          // Invoice doesn't exist, fetch order details instead
          setHasInvoice(false);
          fetchOrderDetailsData();
        }
      } catch (err) {
        // Invoice fetch failed or doesn't exist, fetch order details
        setHasInvoice(false);
        fetchOrderDetailsData();
      }
    };

    const fetchOrderDetailsData = async () => {
      try {
        const res = await fetch(`${API_BASE}/desk/orders/${order.id}`);
        
        if (res.ok) {
          const detailsData = await res.json();
          console.log("Order details from API:", detailsData); // Debug log
          
          // Normalize items with proper field mapping
          const normalizedItems = (detailsData.items || []).map(item => ({
            name: item.name || item.item_name || item.itemName || "",
            qty: item.quantity ?? item.qty ?? item.Quantity ?? item.Qty ?? 0,
            price: item.single_price ?? item.price ?? item.unit_price ?? item.unitPrice ?? 0,
            modifiers: item.modifiers || item.modifier || item.modifications || [],
            notes: item.notes || item.special_notes || item.specialNotes || item.instructions || ""
          }));

          // Normalize order details
          const normalizedDetails = {
            id: detailsData.id ?? detailsData.order_id ?? order.id,
            type: detailsData.order_type ?? detailsData.type ?? order.type,
            tableNumber: detailsData.table_number ?? detailsData.tableNumber ?? order.tableNumber,
            customerName: detailsData.customer_name ?? detailsData.customerName ?? order.customerName,
            phone: detailsData.customer_phone ?? detailsData.phone ?? order.phone,
            paymentStatus: detailsData.payment_status ?? detailsData.paymentStatus ?? order.paymentStatus,
            status: (detailsData.status ?? order.status)?.toUpperCase?.() || "PLACED",
            timePlaced: detailsData.created_at ?? detailsData.timePlaced ?? order.timePlaced,
            paymentMethod: detailsData.payment_method ?? detailsData.paymentMethod ?? order.paymentMethod,
            subtotal: detailsData.subtotal ?? 0,
            taxes: detailsData.tax_total ?? detailsData.taxes ?? 0,
            charges: detailsData.charges_total ?? detailsData.charges ?? detailsData.service_charge ?? 0,
            total: detailsData.total ?? detailsData.grand_total ?? detailsData.grandTotal ?? 0,
            instructions: detailsData.instructions ?? detailsData.notes ?? order.instructions,
            items: normalizedItems,
          };
          setOrderDetails(normalizedDetails);
          console.log("Normalized order details:", normalizedDetails); // Debug log
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (order?.id) {
      fetchInvoice();
    }
  }, [order?.id]);

  // Build timeline from order data
  const buildTimeline = (ord) => {
    const events = [];
    
    // Order placed
    if (ord.timePlaced) {
      events.push({
        label: "Placed",
        at: ord.timePlaced,
        status: "PLACED"
      });
    }

    // If timeline exists in order, use it
    if (Array.isArray(ord.timeline) && ord.timeline.length > 0) {
      events.push(...ord.timeline);
    } else if (ord.status) {
      // Otherwise, add current status as last event
      events.push({
        label: ord.status.charAt(0).toUpperCase() + ord.status.slice(1).toLowerCase(),
        at: new Date().toISOString(),
        status: ord.status
      });
    }

    // Remove duplicates and sort by time
    const uniqueEvents = Array.from(new Map(
      events.map(e => [e.label, e])
    ).values()).sort((a, b) => new Date(a.at) - new Date(b.at));

    return uniqueEvents;
  };

  const handlePrint = () => {
    window.print();
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="bg-white max-w-5xl w-full rounded-2xl shadow-xl overflow-hidden p-6">
          <div className="text-center text-slate-600">Loading...</div>
        </div>
      </div>
    );
  }

  // If invoice exists or forceInvoiceView is true, show invoice view
  if ((hasInvoice && invoice) || (forceInvoiceView && invoice)) {
    return (
      <InvoiceView
        invoice={invoice}
        onClose={onClose}
        formatCurrency={formatCurrency}
        formatDateTime={formatDateTime}
        renderStatus={renderStatus}
        renderPayment={renderPayment}
      />
    );
  }

  // If forceInvoiceView is true but no invoice data yet, try to show invoice view with available data
  if (forceInvoiceView && !invoice && orderDetails) {
    // Convert order details to invoice format
    const invoiceFromOrder = {
      id: orderDetails.id,
      type: orderDetails.type,
      tableNumber: orderDetails.tableNumber,
      customerName: orderDetails.customerName,
      phone: orderDetails.phone,
      paymentStatus: orderDetails.paymentStatus,
      status: orderDetails.status,
      timePlaced: orderDetails.timePlaced,
      paymentMethod: orderDetails.paymentMethod || "N/A",
      subtotal: orderDetails.subtotal || 0,
      taxes: orderDetails.taxes || 0,
      charges: orderDetails.charges || 0,
      grandTotal: orderDetails.total || 0,
      instructions: orderDetails.instructions,
      items: orderDetails.items || [],
    };
    
    return (
      <InvoiceView
        invoice={invoiceFromOrder}
        onClose={onClose}
        formatCurrency={formatCurrency}
        formatDateTime={formatDateTime}
        renderStatus={renderStatus}
        renderPayment={renderPayment}
      />
    );
  }

  // If order details exist, show order details view
  if (!hasInvoice && orderDetails) {
    const data = orderDetails;
    const subtotal = (data.items || []).reduce((acc, item) => acc + (item.qty || 0) * (item.price || 0), 0);
    const isCancelled = data.status?.toUpperCase() === "CANCELLED";

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="bg-white max-w-5xl w-full rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-500">Order Details</p>
                  <h3 className="text-xl font-semibold text-slate-900">{data.id}</h3>
                </div>
                {renderStatus(data.status)}
                {renderPayment(data.paymentStatus)}
              </div>
              <p className="text-sm text-slate-500">Placed {formatDateTime(data.timePlaced)}</p>
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
                      {data.type}
                      {data.type === "DINE_IN" && data.tableNumber ? ` · Table ${data.tableNumber}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500">Payment Method</p>
                    <p className="text-sm font-semibold text-slate-800">{data.paymentMethod || "—"}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Customer: {data.customerName || "Guest"}
                  {data.phone ? ` • ${data.phone}` : ""}
                </p>
                {data.instructions && (
                  <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg px-3 py-2">
                    Special instructions: {data.instructions}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900">Items</h4>
                  <span className="text-xs text-slate-500">Qty · Modifiers · Notes</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {(data.items || []).map((item, idx) => (
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
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                {data.status === "COMPLETED" ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Taxes</span>
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(data.taxes || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Service Charge</span>
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(data.charges || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <span className="text-base font-semibold text-slate-900">Total</span>
                      <span className="text-lg font-bold text-[#2AB0A3]">{formatCurrency(data.total || subtotal)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Taxes</span>
                      <span className="text-sm font-semibold text-slate-900">—</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Service Charge</span>
                      <span className="text-sm font-semibold text-slate-900">—</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <span className="text-base font-semibold text-slate-900">Total</span>
                      <span className="text-lg font-bold text-[#2AB0A3]">{formatCurrency(subtotal)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Actions</h4>
                <button 
                  onClick={() => window.print()}
                  className="w-full rounded-xl bg-[#2AB0A3] text-white text-sm font-semibold px-4 py-2 shadow-sm hover:bg-[#239488] transition flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  Print Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show order details

  const subtotal = (orderData.items || []).reduce((acc, item) => acc + (item.qty || 0) * (item.price || 0), 0);
  const totalWithAdjustments = subtotal - (orderData.discount || 0) + (orderData.taxes || 0);
  const timeline = buildTimeline(orderData);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white max-w-5xl w-full rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">Order</p>
                <h3 className="text-xl font-semibold text-slate-900">{orderData.id}</h3>
              </div>
              {renderStatus(orderData.status)}
              {renderPayment(orderData.paymentStatus)}
            </div>
            <p className="text-sm text-slate-500">Placed {formatDateTime(orderData.timePlaced)}</p>
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
                    {orderData.type}
                    {orderData.type === "Dine-In" && orderData.tableNumber ? ` · Table ${orderData.tableNumber}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500">Payment Method</p>
                  <p className="text-sm font-semibold text-slate-800">{orderData.paymentMethod}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Customer: {orderData.customerName || "Guest"}
                {orderData.phone ? ` • ${orderData.phone}` : ""}
              </p>
              {orderData.instructions && (
                <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg px-3 py-2">
                  Special instructions: {orderData.instructions}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-100">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900">Items</h4>
                <span className="text-xs text-slate-500">Qty · Modifiers · Notes</span>
              </div>
              <div className="divide-y divide-slate-100">
                {(orderData.items || []).map((item, idx) => (
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

            <div className="rounded-xl border border-slate-100 p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Order Timeline</h4>
              <div className="space-y-3">
                {timeline.length > 0 ? (
                  timeline.map((event, idx) => (
                    <div key={`${orderData.id}-${idx}`} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-[#2AB0A3] mt-1" />
                        {idx < timeline.length - 1 && (
                          <div className="w-0.5 h-8 bg-slate-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-semibold text-slate-800 text-sm">{event.label}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(event.at)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No timeline data available</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {orderData.status === "COMPLETED" ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Taxes</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(orderData.taxes || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Service Charge</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(orderData.charges || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-base font-semibold text-slate-900">Total</span>
                    <span className="text-lg font-bold text-[#2AB0A3]">{formatCurrency(totalWithAdjustments)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Taxes</span>
                    <span className="text-sm font-semibold text-slate-900">—</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Service Charge</span>
                    <span className="text-sm font-semibold text-slate-900">—</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-base font-semibold text-slate-900">Total</span>
                    <span className="text-lg font-bold text-[#2AB0A3]">{formatCurrency(subtotal)}</span>
                  </div>
                </>
              )}
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
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
