import React, { useState, useEffect } from "react";
import { fetchDeskOrders } from "../../api/admin.api";

const API_BASE = import.meta.env.DEV ? "/api" : "https://ordering-system-backend-a1az.onrender.com";

// API function to fetch detailed order information
const fetchOrderDetails = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE}/desk/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch order details');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// API function to generate invoice
const generateInvoice = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE}/desk/orders/${orderId}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate invoice');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

const formatTime = (value) => {
  const dt = new Date(value);
  return Number.isNaN(dt.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(dt);
};

const formatCurrency = (amount) => `₹${amount?.toLocaleString?.("en-IN") ?? amount}`;

// Helper function to check if order is from today
const isToday = (dateValue) => {
  if (!dateValue) return false;
  const orderDate = new Date(dateValue);
  const today = new Date();
  return (
    orderDate.getFullYear() === today.getFullYear() &&
    orderDate.getMonth() === today.getMonth() &&
    orderDate.getDate() === today.getDate()
  );
};

const renderStatus = (status) => {
  const statusTone = {
    "PLACED": "bg-[#3B82F6]/20 text-[#3B82F6]",
    "ACCEPTED": "bg-[#1E40AF]/20 text-[#1E40AF]",
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
      {statusUpperCase.replace(/_/g, " ")}
    </span>
  );
};

const renderOrderType = (type) => {
  const typeTone = {
    "Dine-in": "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20",
    "Takeout": "bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20",
    "Delivery": "bg-[#FF9A34]/10 text-[#FF9A34] border border-[#FF9A34]/20",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeTone[type] || "bg-slate-50 text-slate-700 border border-slate-200"}`}>
      {type}
    </span>
  );
};

export default function DeskDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Function to handle invoice generation
  const handleGenerateInvoice = async () => {
    if (!selectedOrder?.id) return;
    
    try {
      setInvoiceLoading(true);
      const invoice = await generateInvoice(selectedOrder.id);
      
      // Show success message or handle invoice data as needed
      console.log('Invoice generated:', invoice);
      alert(`Invoice generated successfully! Invoice Number: ${invoice.invoice_number}`);
      
      // Optionally close the modal after successful generation
      // setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Function to handle order click and fetch details
  const handleOrderClick = async (order) => {
    try {
      setOrderDetailsLoading(true);
      const orderDetails = await fetchOrderDetails(order.id);
      
      // Transform detailed order data for display
      const transformedOrder = {
        ...orderDetails,
        type: orderDetails.order_type === 'DINE_IN' ? 'Dine-in' : 
              orderDetails.order_type === 'TAKEOUT' ? 'Takeout' : 
              orderDetails.order_type === 'DELIVERY' ? 'Delivery' : orderDetails.order_type,
        tableNumber: orderDetails.table_number ? `Table ${orderDetails.table_number}` : null,
        customerName: 'Guest',
        phone: orderDetails.customer_phone || '',
        timePlaced: orderDetails.created_at,
        completedAt: orderDetails.completed_at,
        paymentStatus: 'Pending',
        items: orderDetails.items || [],
        // Calculate total from items
        total: orderDetails.items ? orderDetails.items.reduce((sum, item) => sum + (item.price_snapshot || 0), 0) : 0
      };
      
      setSelectedOrder(transformedOrder);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      // Still show basic order info if details fetch fails
      setSelectedOrder(order);
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  useEffect(() => {
    const loadTodayOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all orders from API - response is directly an array
        const ordersData = await fetchDeskOrders();
        
        // The API returns array directly based on schema
        const allOrders = Array.isArray(ordersData) ? ordersData : [];
        
        // Filter for today's orders only
        const todayOrders = allOrders.filter(order => {
          return isToday(order.created_at);
        });
        
        // Transform API data to match our display format
        const transformedOrders = todayOrders.map(order => ({
          id: order.id,
          type: order.order_type === 'DINE_IN' ? 'Dine-in' : 
                order.order_type === 'TAKEOUT' ? 'Takeout' : 
                order.order_type === 'DELIVERY' ? 'Delivery' : order.order_type,
          tableNumber: order.table_number ? `Table ${order.table_number}` : null,
          customerName: 'Guest', // Not provided in API, default value
          phone: order.customer_phone || '',
          total: 0, // Not provided in API schema
          status: order.status,
          paymentStatus: 'Pending', // Not provided in API, default value
          timePlaced: order.created_at
        }));
        
        setOrders(transformedOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(err.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadTodayOrders();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadTodayOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const todaysDate = new Intl.DateTimeFormat("en-IN", { 
    dateStyle: "full" 
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-slate-700 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Today's Orders</h1>
            <p className="text-slate-600 mt-1">{todaysDate}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
            <p className="text-sm text-slate-500">Total Orders</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white/90 rounded-lg shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Order List</h2>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-2">Error: {error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No orders found for today</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-100/90">
                    <th className="px-6 py-3 text-center text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-emerald-800 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-emerald-100/60 cursor-pointer transition-colors"
                        onClick={() => handleOrderClick(order)}>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-slate-900">#{order.id}</div>
                        {order.tableNumber && (
                          <div className="text-sm text-slate-500">{order.tableNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {renderOrderType(order.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {renderStatus(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-slate-900">{formatCurrency(order.total)}</div>
                        <div className="text-xs text-slate-500">{order.paymentStatus}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500">
                        {formatTime(order.timePlaced)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Popup */}
      {(selectedOrder || orderDetailsLoading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            {orderDetailsLoading ? (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
                <p className="text-slate-600">Loading order details...</p>
              </div>
            ) : selectedOrder && (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Order Details</h3>
                      <p className="text-xl font-medium text-slate-900 mb-1">{selectedOrder.id}</p>
                      <p className="text-sm text-slate-500">
                        Placed {new Date(selectedOrder.timePlaced).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}, {formatTime(selectedOrder.timePlaced)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {renderStatus(selectedOrder.status)}
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        {selectedOrder.paymentStatus}
                      </span>
                      <button 
                        onClick={() => setSelectedOrder(null)}
                        className="text-slate-400 hover:text-slate-600 transition-colors ml-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-6">
                  {/* Order Type & Payment Method */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Order Type</h4>
                      <p className="text-base font-medium text-slate-900">
                        {selectedOrder.order_type || selectedOrder.type?.toUpperCase().replace('-', '_')}
                        {selectedOrder.tableNumber && ` • ${selectedOrder.tableNumber}`}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Payment Method</h4>
                      <p className="text-base text-slate-900">—</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <p className="text-base text-slate-500">
                      Customer: <span className="font-medium text-slate-900">{selectedOrder.customerName || 'Guest'}</span>
                      {selectedOrder.phone && (
                        <span className="font-medium text-slate-900"> • {selectedOrder.phone}</span>
                      )}
                    </p>
                  </div>

                  {/* Items and Pricing Layout */}
                  <div className="grid grid-cols-2 gap-8">
                    {/* Items */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-medium text-slate-900">Items</h4>
                        <p className="text-sm text-slate-500">Qty • Modifiers • Notes</p>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-base font-medium text-slate-900">{item.quantity}×</span>
                                <span className="text-base text-slate-900">{item.name}</span>
                              </div>
                              <span className="text-base font-medium text-slate-900">{formatCurrency(item.price_snapshot || item.single_price || 0)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-base font-medium text-slate-900">1×</span>
                              <span className="text-base text-slate-900">No items available</span>
                            </div>
                            <span className="text-base font-medium text-slate-900">{formatCurrency(0)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div>
                      <div className="space-y-3 mt-9">
                        <div className="flex justify-between">
                          <span className="text-base text-slate-500">Subtotal</span>
                          <span className="text-base font-medium text-slate-900">{formatCurrency(selectedOrder.total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base text-slate-500">Taxes</span>
                          <span className="text-base text-slate-900">—</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base text-slate-500">Service Charge</span>
                          <span className="text-base text-slate-900">—</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3">
                          <div className="flex justify-between">
                            <span className="text-lg font-medium text-slate-900">Total</span>
                            <span className="text-xl font-semibold text-[#2AB0A3]">{formatCurrency(selectedOrder.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="text-base font-medium text-slate-900 mb-3">Actions</h4>
                    <button 
                      onClick={handleGenerateInvoice}
                      disabled={invoiceLoading}
                      className="w-full px-4 py-3 bg-[#2AB0A3] text-white rounded-lg hover:bg-[#229a8e] disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      {invoiceLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating Invoice...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Generate Invoice
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
