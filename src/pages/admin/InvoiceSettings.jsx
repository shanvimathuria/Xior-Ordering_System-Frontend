import { useEffect, useState } from "react";
import { fetchInvoiceSettings, updateInvoiceSettings } from "../../api/admin.api";

export default function InvoiceSettings() {
  const [settings, setSettings] = useState({
    prefix: "",
    next_number: "",
    business_name: "",
    address: "",
    gst_number: "",
    footer_text: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  async function loadSettings() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInvoiceSettings();
      console.log("Invoice settings data:", data);
      
      // Handle both direct object and nested response
      const settingsData = data?.data || data;
      
      setSettings({
        prefix: settingsData?.prefix || "",
        next_number: settingsData?.next_number || "",
        business_name: settingsData?.business_name || "",
        address: settingsData?.address || "",
        gst_number: settingsData?.gst_number || "",
        footer_text: settingsData?.footer_text || "",
      });
    } catch (err) {
      console.error("Failed to load invoice settings:", err);
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateInvoiceSettings({
        prefix: settings.prefix,
        next_number: parseInt(settings.next_number) || 1,
        business_name: settings.business_name,
        address: settings.address,
        gst_number: settings.gst_number,
        footer_text: settings.footer_text,
      });
      setSuccessMessage("Invoice settings updated successfully!");
      setEditing(false);
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadSettings();
    } catch (err) {
      console.error("Failed to update settings:", err);
      setError(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  // Generate sample invoice number
  const sampleInvoiceNumber = `${settings.prefix}${String(settings.next_number || 1).padStart(5, '0')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading invoice settings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Invoice Settings</h1>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Invoice Details</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 rounded-lg bg-teal-500 text-sm font-semibold text-white hover:bg-teal-600 transition"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Prefix */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Invoice Prefix
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="prefix"
                    value={settings.prefix}
                    onChange={handleChange}
                    placeholder="e.g., INV"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                ) : (
                  <div className="px-3 py-2.5 rounded-lg bg-slate-50 text-slate-900">
                    {settings.prefix || "-"}
                  </div>
                )}
              </div>

              {/* Next Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Next Invoice Number
                </label>
                {editing ? (
                  <input
                    type="number"
                    name="next_number"
                    value={settings.next_number}
                    onChange={handleChange}
                    placeholder="e.g., 1"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                ) : (
                  <div className="px-3 py-2.5 rounded-lg bg-slate-50 text-slate-900">
                    {settings.next_number || "-"}
                  </div>
                )}
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Business Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="business_name"
                    value={settings.business_name}
                    onChange={handleChange}
                    placeholder="Your restaurant name"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                ) : (
                  <div className="px-3 py-2.5 rounded-lg bg-slate-50 text-slate-900">
                    {settings.business_name || "-"}
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Business Address
                </label>
                {editing ? (
                  <textarea
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    placeholder="Street address, city, state, postal code"
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                ) : (
                  <div className="px-3 py-2.5 rounded-lg bg-slate-50 text-slate-900 whitespace-pre-wrap">
                    {settings.address || "-"}
                  </div>
                )}
              </div>

              {/* GST Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  GST Number
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="gst_number"
                    value={settings.gst_number}
                    onChange={handleChange}
                    placeholder="e.g., 27AAFFU5055K1ZO"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                ) : (
                  <div className="px-3 py-2.5 rounded-lg bg-slate-50 text-slate-900">
                    {settings.gst_number || "-"}
                  </div>
                )}
              </div>

              {/* Footer Text */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Footer Text
                </label>
                {editing ? (
                  <textarea
                    name="footer_text"
                    value={settings.footer_text}
                    onChange={handleChange}
                    placeholder="Thank you message or additional text"
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                ) : (
                  <div className="px-3 py-2.5 rounded-lg bg-slate-50 text-slate-900 whitespace-pre-wrap">
                    {settings.footer_text || "-"}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setEditing(false);
                      loadSettings();
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-teal-500 text-sm font-semibold text-white hover:bg-teal-600 transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Invoice Preview</h2>

            {/* Invoice Preview - Receipt Style */}
            <div className="bg-white border-2 border-slate-300 rounded-lg p-6 max-w-sm mx-auto" style={{ fontFamily: 'Courier New, monospace' }}>
              {/* Header */}
              <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  {settings.business_name || "BUSINESS NAME"}
                </h3>
                <p className="text-xs text-slate-700 mt-1 leading-tight">
                  {settings.address || "Address will appear here"}
                </p>
                {settings.gst_number && (
                  <p className="text-xs text-slate-700 mt-1">
                    GSTIN - {settings.gst_number}
                  </p>
                )}
              </div>

              {/* Customer and Bill Info */}
              <div className="border-b border-dashed border-slate-400 pb-2 mb-3 text-xs space-y-1">
                <div>Name: <span className="inline-block border-b border-dotted border-slate-400 w-40"></span></div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>Dine In:</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>Bill No.: {sampleInvoiceNumber}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-b border-dashed border-slate-400 pb-2 mb-2">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Item</span>
                  <span>Qty.</span>
                  <span className="w-20 text-right">Price Amount</span>
                </div>
              </div>

              {/* Totals */}
              <div className="text-xs space-y-1 mb-3">
                <div className="flex justify-between">
                  <span>Total Qty: -</span>
                  <span>Sub<br/>Total -</span>
                </div>
                <div className="flex justify-between pl-20">
                  <span>Tax</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between pl-20">
                  <span>Round off</span>
                  <span>-</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="border-t-2 border-slate-800 border-b-2 pt-2 pb-2 mb-3">
                <div className="flex justify-between text-sm font-bold">
                  <span>Grand Total ₹ -</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center border-t border-dashed border-slate-400 pt-3">
                <p className="text-xs text-slate-700 font-semibold">
                  {settings.footer_text || "Thank You Hope You Visit Again"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
