const ongoingOrders = [
  { id: "#1023", type: "Dine-in", ref: "Table 5", status: "In Progress", time: "12 mins ago" },
  { id: "#1024", type: "Takeout", ref: "9876543210", status: "In Progress", time: "8 mins ago" },
  { id: "#1025", type: "Delivery", ref: "Ram · 90210", status: "In Progress", time: "5 mins ago" },
];

const completedOrders = [
  { id: "#1022", type: "Dine-in", ref: "Table 2", status: "Completed", time: "1 hr ago" },
  { id: "#1021", type: "Takeout", ref: "9876543211", status: "Completed", time: "2 hrs ago" },
];

export default function Dashboard() {
  const totalOrders = ongoingOrders.length + completedOrders.length;
  const activeOrders = ongoingOrders.length;

  const kpis = [
    { label: "Total Orders", value: totalOrders.toString(), sub: "Today" },
    { label: "Active Orders", value: activeOrders.toString(), sub: "In Progress" },
    { label: "Revenue", value: "₹12,500", sub: "Today" },
    { label: "Pending Invoices", value: "7", sub: "Awaiting payment" },
  ];

  return (
    <div className="space-y-8 text-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Today’s overview at a glance.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          Last synced: 2 mins ago
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500 group-hover:text-[#2AB0A3] transition-colors">{kpi.label}</p>
            <p className="text-2xl font-semibold text-slate-900 group-hover:text-[#2AB0A3] transition-colors">{kpi.value}</p>
            <p className="text-sm text-slate-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        {/* Ongoing Orders */}
        <div className="bg-[#FFF4F0] rounded-2xl border border-[#FF9A34]/20 shadow-sm p-5 h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Ongoing Orders</h2>
              <p className="text-sm text-slate-500">Orders currently in progress</p>
            </div>
            <span className="text-xs bg-[#FF9A34]/20 text-[#FF9A34] px-3 py-1 rounded-full font-semibold">
              {ongoingOrders.length} active
            </span>
          </div>
          <div className="bg-white rounded-xl border border-[#FF9A34]/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#FF9A34] to-[#FFB366] text-white">
                <tr>
                  <th className="p-3 text-center font-semibold">Order ID</th>
                  <th className="p-3 text-center font-semibold">Type</th>
                  <th className="p-3 text-center font-semibold">Table ID</th>
                  <th className="p-3 text-center font-semibold">Status</th>
                  <th className="p-3 text-center font-semibold">Time</th>
                  <th className="p-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ongoingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFF8F0] transition-colors">
                    <td className="p-3 font-semibold text-slate-800 text-center">{order.id}</td>
                    <td className="p-3 text-slate-600 text-center">{order.type}</td>
                    <td className="p-3 font-semibold text-slate-800 text-center">
                      {order.ref.includes('Table') ? order.ref.replace('Table ', '') : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FF9A34]/20 text-[#FF9A34]">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-xs text-center">{order.time}</td>
                    <td className="p-3 text-center">
                      <button className="text-[#2f5f3b] font-semibold hover:underline text-xs">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-[#E8F7F5] rounded-2xl border border-[#2AB0A3]/20 shadow-sm p-5 h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Completed Orders</h2>
              <p className="text-sm text-slate-500">Recently completed transactions</p>
            </div>
            <span className="text-xs bg-[#2AB0A3]/20 text-[#2AB0A3] px-3 py-1 rounded-full font-semibold">
              {completedOrders.length} done
            </span>
          </div>
          <div className="bg-white rounded-xl border border-[#2AB0A3]/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#2AB0A3] to-[#3cc4b6] text-white">
                <tr>
                  <th className="p-3 text-center font-semibold">Order ID</th>
                  <th className="p-3 text-center font-semibold">Type</th>
                  <th className="p-3 text-center font-semibold">Table ID</th>
                  <th className="p-3 text-center font-semibold">Status</th>
                  <th className="p-3 text-center font-semibold">Time</th>
                  <th className="p-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#E8F7F5] transition-colors">
                    <td className="p-3 font-semibold text-slate-800 text-center">{order.id}</td>
                    <td className="p-3 text-slate-600 text-center">{order.type}</td>
                    <td className="p-3 font-semibold text-slate-800 text-center">
                      {order.ref.includes('Table') ? order.ref.replace('Table ', '') : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2AB0A3]/20 text-[#2AB0A3]">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-xs text-center">{order.time}</td>
                    <td className="p-3 text-center">
                      <button className="text-[#2AB0A3] font-semibold hover:underline text-xs hover:scale-110 transition-transform inline-block">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
