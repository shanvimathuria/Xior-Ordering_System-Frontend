import { useEffect, useState } from "react";
import {
  fetchTaxes,
  createTax,
  updateTax,
  deleteTax,
  fetchCharges,
  createCharge,
  updateCharge,
  deleteCharge,
} from "../../api/admin.api";

export default function TaxesCharges() {
  const [taxes, setTaxes] = useState([]);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tax modals
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [deleteTaxConfirm, setDeleteTaxConfirm] = useState(null);

  // Charge modals
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [editingCharge, setEditingCharge] = useState(null);
  const [deleteChargeConfirm, setDeleteChargeConfirm] = useState(null);

  const [errorModal, setErrorModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  const formatApplyTo = (value) => {
    const normalized = (value || "").toString().toUpperCase().replace(/\s+/g, "_").replace(/-+/g, "_");
    if (normalized === "ALL") return "All";
    if (normalized === "DINE_IN") return "Dine-In";
    if (normalized === "TAKEAWAY") return "Takeaway";
    if (normalized === "DELIVERY") return "Delivery";
    return value || "—";
  };

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [taxData, chargeData] = await Promise.all([
        fetchTaxes(),
        fetchCharges(),
      ]);
      setTaxes(Array.isArray(taxData) ? taxData : taxData?.taxes || []);
      setCharges(Array.isArray(chargeData) ? chargeData : chargeData?.charges || []);
    } catch (err) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // Tax handlers
  async function handleSaveTax(data) {
    setProcessing(true);
    try {
      if (editingTax) {
        await updateTax(editingTax.id, data);
      } else {
        await createTax(data);
      }
      setShowTaxModal(false);
      setEditingTax(null);
      await refresh();
    } catch (err) {
      setErrorModal(err?.message || "Failed to save tax");
      setProcessing(false);
      return;
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteTax() {
    if (!deleteTaxConfirm?.id) return;
    setProcessing(true);
    try {
      await deleteTax(deleteTaxConfirm.id);
      setDeleteTaxConfirm(null);
      await refresh();
    } catch (err) {
      setErrorModal(err?.message || "Failed to delete tax");
    } finally {
      setProcessing(false);
    }
  }

  async function handleToggleTaxStatus(tax) {
    setProcessing(true);
    try {
      await updateTax(tax.id, { is_active: !tax.is_active });
      await refresh();
    } catch (err) {
      setErrorModal(err?.message || "Failed to toggle tax status");
    } finally {
      setProcessing(false);
    }
  }

  // Charge handlers
  async function handleSaveCharge(data) {
    setProcessing(true);
    try {
      if (editingCharge) {
        await updateCharge(editingCharge.id, data);
      } else {
        await createCharge(data);
      }
      setShowChargeModal(false);
      setEditingCharge(null);
      await refresh();
    } catch (err) {
      setErrorModal(err?.message || "Failed to save charge");
      setProcessing(false);
      return;
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteCharge() {
    if (!deleteChargeConfirm?.id) return;
    setProcessing(true);
    try {
      await deleteCharge(deleteChargeConfirm.id);
      setDeleteChargeConfirm(null);
      await refresh();
    } catch (err) {
      setErrorModal(err?.message || "Failed to delete charge");
    } finally {
      setProcessing(false);
    }
  }

  async function handleToggleChargeStatus(charge) {
    setProcessing(true);
    try {
      await updateCharge(charge.id, { is_active: !charge.is_active });
      await refresh();
    } catch (err) {
      setErrorModal(err?.message || "Failed to toggle charge status");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fff7f1] px-0 py-0 sm:px-0 sm:py-0">
      <div className="max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Taxes & Charges Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage taxes and additional charges for invoices and orders.</p>
        </div>

        {loading && (
          <div className="rounded-xl border border-amber-100 bg-white p-6 text-slate-700">Loading…</div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* TAXES SECTION */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-slate-900">Taxes</h2>
                <button
                  className="rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-600"
                  onClick={() => {
                    setEditingTax(null);
                    setShowTaxModal(true);
                  }}
                >
                  Add Tax
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tax Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Value</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {taxes.map((tax) => (
                      <tr key={tax.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">{tax.name || tax.tax_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 capitalize">{tax.type || tax.tax_type}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {tax.type === "PERCENT" || tax.tax_type === "PERCENT" ? `${tax.value || tax.tax_value}%` : `₹${tax.value || tax.tax_value}`}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={tax.is_active}
                            onClick={() => handleToggleTaxStatus(tax)}
                            disabled={processing}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              tax.is_active ? "bg-emerald-500" : "bg-slate-300"
                            } ${processing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                tax.is_active ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            className="text-sm text-teal-600 hover:text-teal-700 mr-3"
                            onClick={() => {
                              setEditingTax(tax);
                              setShowTaxModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-sm text-rose-600 hover:text-rose-700"
                            onClick={() => setDeleteTaxConfirm(tax)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {taxes.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
                          No taxes found. Create your first tax.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* CHARGES SECTION */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-slate-900">Additional Charges</h2>
                <button
                  className="rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-600"
                  onClick={() => {
                    setEditingCharge(null);
                    setShowChargeModal(true);
                  }}
                >
                  Add Charge
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Charge Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Value</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Apply To</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {charges.map((charge) => (
                      <tr key={charge.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">{charge.name || charge.charge_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 capitalize">{charge.type || charge.charge_type}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {charge.type === "PERCENT" || charge.charge_type === "PERCENT" ? `${charge.value || charge.charge_value}%` : `₹${charge.value || charge.charge_value}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatApplyTo(charge.applies_to || charge.apply_to)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={charge.is_active}
                            onClick={() => handleToggleChargeStatus(charge)}
                            disabled={processing}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              charge.is_active ? "bg-emerald-500" : "bg-slate-300"
                            } ${processing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                charge.is_active ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            className="text-sm text-teal-600 hover:text-teal-700 mr-3"
                            onClick={() => {
                              setEditingCharge(charge);
                              setShowChargeModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-sm text-rose-600 hover:text-rose-700"
                            onClick={() => setDeleteChargeConfirm(charge)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {charges.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500">
                          No charges found. Create your first charge.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Tax Modal */}
      {showTaxModal && (
        <TaxModal
          tax={editingTax}
          onSave={handleSaveTax}
          onClose={() => {
            setShowTaxModal(false);
            setEditingTax(null);
          }}
          processing={processing}
        />
      )}

      {/* Charge Modal */}
      {showChargeModal && (
        <ChargeModal
          charge={editingCharge}
          onSave={handleSaveCharge}
          onClose={() => {
            setShowChargeModal(false);
            setEditingCharge(null);
          }}
          processing={processing}
        />
      )}

      {/* Delete Tax Confirmation */}
      {deleteTaxConfirm && (
        <ConfirmModal
          title="Delete Tax"
          message={`Are you sure you want to delete "${deleteTaxConfirm.name || deleteTaxConfirm.tax_name}"?`}
          onConfirm={handleDeleteTax}
          onCancel={() => setDeleteTaxConfirm(null)}
          processing={processing}
        />
      )}

      {/* Delete Charge Confirmation */}
      {deleteChargeConfirm && (
        <ConfirmModal
          title="Delete Charge"
          message={`Are you sure you want to delete "${deleteChargeConfirm.name || deleteChargeConfirm.charge_name}"?`}
          onConfirm={handleDeleteCharge}
          onCancel={() => setDeleteChargeConfirm(null)}
          processing={processing}
        />
      )}

      {/* Error Modal */}
      {errorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setErrorModal(null)}
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-rose-600">Error</h2>
            <p className="text-sm text-slate-700 mt-2">{errorModal}</p>
            <button
              className="w-full mt-4 rounded-lg bg-slate-500 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
              onClick={() => setErrorModal(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TaxModal({ tax, onSave, onClose, processing }) {
  const [name, setName] = useState(tax?.name || tax?.tax_name || "");
  const [type, setType] = useState(tax?.type || tax?.tax_type || "PERCENT");
  const [value, setValue] = useState(tax?.value || tax?.tax_value || "");

  function handleSubmit() {
    if (!name || !value) return;
    onSave({ name, type, value: Number(value), is_active: true });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">{tax ? "Edit Tax" : "Add New Tax"}</h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">Tax Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., GST"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">Tax Type</label>
            <select
              className="w-full appearance-none rounded-full border border-slate-200 bg-white px-5 py-2.5 pr-10 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-slate-300"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="PERCENT">Percentage</option>
              <option value="FIXED">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">Value</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "PERCENT" ? "e.g., 18" : "e.g., 50"}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
              onClick={handleSubmit}
              disabled={processing || !name || !value}
            >
              {processing ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChargeModal({ charge, onSave, onClose, processing }) {
  const [name, setName] = useState(charge?.name || charge?.charge_name || "");
  const [type, setType] = useState(charge?.type || charge?.charge_type || "PERCENT");
  const [value, setValue] = useState(charge?.value || charge?.charge_value || "");
  const [applyTo, setApplyTo] = useState(charge?.applies_to || charge?.apply_to || "ALL");

  function handleSubmit() {
    if (!name || !value) return;
    onSave({ name, type, value: Number(value), applies_to: applyTo });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">{charge ? "Edit Charge" : "Add New Charge"}</h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">Charge Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Delivery Fee"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">Charge Type</label>
            <select
              className="w-full appearance-none rounded-full border border-slate-200 bg-white px-5 py-2.5 pr-10 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-slate-300"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="PERCENT">Percentage</option>
              <option value="FIXED">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">Value</label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "PERCENT" ? "e.g., 5" : "e.g., 30"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5">Apply To</label>
            <select
              className="w-full appearance-none rounded-full border border-slate-200 bg-white px-5 py-2.5 pr-10 text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 hover:border-slate-300"
              value={applyTo}
              onChange={(e) => setApplyTo(e.target.value)}
            >
              <option value="ALL">All Orders</option>
              <option value="DINE_IN">Dine-In Only</option>
              <option value="TAKEAWAY">Takeaway Only</option>
              <option value="DELIVERY">Delivery Only</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
              onClick={handleSubmit}
              disabled={processing || !name || !value}
            >
              {processing ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel, processing }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600 mt-2">{message}</p>
        <div className="flex gap-3 mt-4">
          <button
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </button>
          <button
            className="flex-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
            onClick={onConfirm}
            disabled={processing}
          >
            {processing ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
