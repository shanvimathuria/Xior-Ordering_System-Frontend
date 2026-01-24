const highlights = [
  { label: "Today’s Sales", value: "₹12,500" },
  { label: "Total Orders", value: "120" },
  { label: "Top Item", value: "Paneer Butter Masala" },
];

export default function Reports() {
  return (
    <div className="space-y-6 text-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Snapshots and notes for leadership.</p>
        </div>
        <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:border-[#7ba27f] hover:bg-[#e9f1e6] transition shadow-sm">
          Download summary
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {highlights.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
        <p className="text-sm uppercase tracking-wide text-slate-500">Notes</p>
        <p className="text-slate-700 leading-relaxed">
          Detailed charts, trends, and comparative analytics will be placed here. Use this
          section for leadership-ready summaries and exportable insights.
        </p>
      </div>
    </div>
  );
}
