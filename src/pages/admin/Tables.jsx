import { useEffect, useMemo, useState } from "react";
import { createAdminTable, fetchAdminTables, deleteAdminTable, updateAdminTable } from "../../api/admin.api";

function normalizeTable(table) {
  return {
    id: table?.id ?? table?._id ?? table?.uuid ?? table?.table_id ?? null,
    tableNumber: table?.tableNumber ?? table?.table_number ?? table?.number ?? null,
    isActive: table?.isActive ?? table?.is_active ?? table?.active ?? false,
    createdAt: table?.createdAt ?? table?.created_at ?? table?.created ?? null,
    qrCodeUrl: table?.qrCodeUrl ?? table?.qr_code_url ?? table?.qrCode ?? null,
  };
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [editTableNumber, setEditTableNumber] = useState("");
  const [updating, setUpdating] = useState(false);
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);
  const [toggling, setToggling] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTables();
      console.log("Raw table data from backend:", data);
      const arr = Array.isArray(data) ? data : data?.tables || [];
      console.log("Tables array:", arr);
      if (arr.length > 0) {
        console.log("First table object structure:", arr[0]);
      }
      setTables(arr);
    } catch (err) {
      setError(err?.message || "Failed to load tables");
      setTables([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const normalizedTables = useMemo(() => {
    return tables.map(normalizeTable).filter((t) => t.tableNumber !== null);
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (filterStatus === "all") return normalizedTables;
    return normalizedTables.filter((t) => {
      if (filterStatus === "active") return t.isActive === true;
      if (filterStatus === "inactive") return t.isActive === false;
      return true;
    });
  }, [normalizedTables, filterStatus]);

  async function handleCreateTable() {
    if (!newTableNumber || Number.isNaN(Number(newTableNumber))) {
      setErrorModal("Please enter a valid table number");
      return;
    }

    const tableNum = Number(newTableNumber);
    const exists = normalizedTables.some(t => t.tableNumber === tableNum);
    
    if (exists) {
      setErrorModal("This table already exists");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        table_number: tableNum,
      };
      console.log("Creating table with payload:", payload);
      await createAdminTable(payload);
      console.log("Table created successfully");
      setNewTableNumber("");
      setShowModal(false);
      setFilterStatus("all");
      await refresh();
    } catch (err) {
      console.error("Failed to create table:", err);
      setErrorModal("Failed to create table: " + err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteTable() {
    console.log("Delete confirmation object:", deleteConfirm);
    console.log("Table ID to delete:", deleteConfirm?.id);
    
    if (!deleteConfirm?.id) {
      setErrorModal("Table ID is missing. Cannot delete table.");
      setDeleteConfirm(null);
      return;
    }
    
    setDeleting(true);
    try {
      console.log("Attempting to delete table with ID:", deleteConfirm.id);
      await deleteAdminTable(deleteConfirm.id);
      setDeleteConfirm(null);
      await refresh();
    } catch (err) {
      console.error("Failed to delete table:", err);
      setErrorModal("Failed to delete table: " + err.message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpdateTable() {
    if (!editTableNumber || Number.isNaN(Number(editTableNumber))) {
      setErrorModal("Please enter a valid table number");
      return;
    }

    const tableNum = Number(editTableNumber);
    const exists = normalizedTables.some(t => t.tableNumber === tableNum && t.id !== editingTable.id);
    
    if (exists) {
      setErrorModal("This table already exists");
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        table_number: tableNum,
      };
      await updateAdminTable(editingTable.id, payload);
      setEditingTable(null);
      setEditTableNumber("");
      await refresh();
    } catch (err) {
      console.error("Failed to update table:", err);
      setErrorModal("Failed to update table: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleToggleTableStatus() {
    if (!selectedTableDetails?.id) return;
    
    setToggling(true);
    try {
      const payload = {
        is_active: !selectedTableDetails.isActive,
      };
      await updateAdminTable(selectedTableDetails.id, payload);
      setSelectedTableDetails(null);
      await refresh();
    } catch (err) {
      console.error("Failed to toggle table status:", err);
      setErrorModal("Failed to toggle table status: " + err.message);
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fff7f1] px-0 py-0 sm:px-0 sm:py-0">
      <div className="max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Table Management</h1>
            <p className="text-sm text-slate-500 mt-1">Create and view dining tables.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">Table Status</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`px-5 py-2 rounded-full font-semibold text-sm transition ${
                    filterStatus === "all"
                      ? "bg-slate-700 text-white"
                      : "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                  }`}
                  aria-pressed={filterStatus === "all"}
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`px-5 py-2 rounded-full font-semibold text-sm transition ${
                    filterStatus === "active"
                      ? "bg-emerald-500 text-white"
                      : "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                  }`}
                  aria-pressed={filterStatus === "active"}
                  onClick={() => setFilterStatus("active")}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`px-5 py-2 rounded-full font-semibold text-sm transition ${
                    filterStatus === "inactive"
                      ? "bg-rose-500 text-white"
                      : "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                  }`}
                  aria-pressed={filterStatus === "inactive"}
                  onClick={() => setFilterStatus("inactive")}
                >
                  Inactive
                </button>
              </div>
            </div>
            <div>
              <button
                className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
                onClick={() => {
                  const nextNumber = normalizedTables.length > 0 
                    ? Math.max(...normalizedTables.map(t => t.tableNumber || 0)) + 1 
                    : 1;
                  setNewTableNumber(String(nextNumber));
                  setShowModal(true);
                }}
              >
                Create Table
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-amber-100 bg-white p-6 text-slate-700 shadow-sm">Loading…</div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 shadow-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTables.map((table) => {
              const active = !!table.isActive;
              const cardClasses = active
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-300 bg-rose-100 text-rose-700";
              return (
                <div
                  key={table.id ?? table.tableNumber}
                  className={`rounded-lg border p-4 ${cardClasses} min-h-[110px] flex items-center justify-center text-lg font-semibold relative cursor-pointer hover:opacity-80 transition`}
                  onClick={() => setSelectedTableDetails(table)}
                >
                  <button
                    className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(table);
                    }}
                    aria-label="Delete table"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    className="absolute top-2 right-10 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTable(table);
                      setEditTableNumber(String(table.tableNumber));
                    }}
                    aria-label="Edit table"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  Table {table.tableNumber}
                </div>
              );
            })}

            {filteredTables.length === 0 && (
              <div className="col-span-full rounded-xl border border-amber-100 bg-white p-6 text-slate-600">
                No {filterStatus === "all" ? "" : filterStatus} tables found.
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Create New Table</h2>
                <p className="text-xs text-slate-500 mt-1">Enter the table number</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">Table Number</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g., 1"
                  autoFocus
                />
              </div>

              <button
                className="w-full rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
                onClick={handleCreateTable}
                disabled={creating || !newTableNumber}
              >
                {creating ? "Creating..." : "Create Table"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Delete Table</h2>
              <p className="text-sm text-slate-600 mt-2">
                Do you want to delete Table {deleteConfirm.tableNumber}?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
                onClick={handleDeleteTable}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTableDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedTableDetails(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900">Table {selectedTableDetails.tableNumber}</h2>
                <p className="text-sm text-slate-600 mt-1">ID: {selectedTableDetails.id ?? "-"}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                selectedTableDetails.isActive 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-rose-100 text-rose-700"
              }`}>
                {selectedTableDetails.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      )}

      {editingTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditingTable(null)}
        >
          <div
            className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Edit Table</h2>
                <p className="text-xs text-slate-500 mt-1">Update table number</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                onClick={() => setEditingTable(null)}
                aria-label="Close"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1.5">Table Number</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={editTableNumber}
                  onChange={(e) => setEditTableNumber(e.target.value)}
                  placeholder="e.g., 1"
                  autoFocus
                />
              </div>

              <button
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                onClick={handleUpdateTable}
                disabled={updating || !editTableNumber}
              >
                {updating ? "Updating..." : "Update Table"}
              </button>
            </div>
          </div>
        </div>
      )}

      {errorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setErrorModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-rose-600">Error</h2>
              <p className="text-sm text-slate-700 mt-2">
                {errorModal}
              </p>
            </div>

            <button
              className="w-full rounded-lg bg-slate-500 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
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
