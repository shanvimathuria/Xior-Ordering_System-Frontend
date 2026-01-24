import { useEffect, useMemo, useState } from "react";
import {
  fetchMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../api/admin.api";

function VegBadge({ isVeg }) {
  const color = isVeg ? "bg-emerald-500" : "bg-rose-500";
  const label = isVeg ? "Veg" : "Non-Veg";
  return (
    <span className="inline-flex items-center gap-2 text-xs text-slate-600">
      <span className={`w-2 h-2 rounded-full ${color}`}></span>
      {label}
    </span>
  );
}

function CategoryForm({ initialName = "", onSubmit, onCancel }) {
  const [name, setName] = useState(initialName);
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-800">Category Name</label>
      <input
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Starters"
      />
      <div className="flex gap-2 justify-end">
        <button className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onCancel}>Cancel</button>
        <button
          className="px-3 py-2 rounded-lg bg-teal-500 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
          onClick={() => onSubmit({ name })}
          disabled={!name.trim()}
        >
          Save
        </button>
      </div>
    </div>
  );
}

function ItemForm({ initial = {}, onSubmit, onCancel }) {
  const [name, setName] = useState(initial.name || "");
  const [description, setDescription] = useState(initial.description || "");
  const [price, setPrice] = useState(
    typeof initial.price === "number" ? String(initial.price) : ""
  );
  const [isVeg, setIsVeg] = useState(!!initial.isVeg);
  const canSave = name.trim() && price && !Number.isNaN(Number(price));

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-800">Item Name</label>
        <input
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Paneer Tikka"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-800">Description</label>
        <textarea
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-800">Price</label>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 199"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">Type</label>
          <div className="flex rounded-xl border border-amber-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              className={`${isVeg ? "bg-teal-500 text-white shadow" : "text-slate-700"} flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-teal-50`}
              aria-pressed={isVeg}
              onClick={() => setIsVeg(true)}
            >
              Veg
            </button>
            <button
              type="button"
              className={`${!isVeg ? "bg-teal-500 text-white shadow" : "text-slate-700"} flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-teal-50`}
              aria-pressed={!isVeg}
              onClick={() => setIsVeg(false)}
            >
              Non-Veg
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onCancel}>Cancel</button>
        <button
          className="px-3 py-2 rounded-lg bg-teal-500 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
          onClick={() => onSubmit({ name, description, price: Number(price), isVeg, is_veg: isVeg })}
          disabled={!canSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMenuCategories();
      const arr = Array.isArray(data) ? data : data?.categories || [];
      setCategories(arr);
      if (arr.length && !selectedId) {
        setSelectedId(arr[0]?.id ?? arr[0]?._id ?? arr[0]?.uuid ?? 0);
      }
    } catch (err) {
      setError(err?.message || "Failed to load menu");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function getId(entity) {
    return entity?.id ?? entity?._id ?? entity?.uuid ?? entity?.key ?? null;
  }

  function getCategoryName(cat) {
    return cat?.name || cat?.title || cat?.categoryName || "Untitled";
  }

  function getItems(cat) {
    return cat?.items || cat?.menuItems || cat?.products || [];
  }

  function getItemName(item) {
    return item?.name || item?.title || item?.productName || "Item";
  }

  function getItemDesc(item) {
    return item?.description || item?.desc || "";
  }

  function getItemPrice(item) {
    const p = item?.price ?? item?.cost ?? item?.amount;
    return typeof p === "number" ? p : undefined;
  }


  function getItemVeg(item) {
  // handle different backend field names safely
  const value =
    item?.isVeg ??
    item?.is_veg ??
    item?.veg ??
    item?.vegetarian;

  // ensure boolean handling
  if (value === true) return true;
  if (value === false) return false;

  // fallback (optional)
  return false;
}



  const selectedCategory = useMemo(() => {
    return categories.find((c) => getId(c) === selectedId) || null;
  }, [categories, selectedId]);

  const vegItems = useMemo(() => {
    const items = getItems(selectedCategory);
    return items.filter((i) => getItemVeg(i)).sort((a, b) => getItemName(a).localeCompare(getItemName(b)));
  }, [selectedCategory]);

  const nonVegItems = useMemo(() => {
    const items = getItems(selectedCategory);
    return items.filter((i) => !getItemVeg(i)).sort((a, b) => getItemName(a).localeCompare(getItemName(b)));
  }, [selectedCategory]);

  async function handleCreateCategory({ name }) {
    await createMenuCategory({ name });
    setModal(null);
    await refresh();
  }

  async function handleRenameCategory(cat, { name }) {
    const id = getId(cat);
    await updateMenuCategory(id, { name });
    setModal(null);
    await refresh();
  }

  async function handleDeleteCategory(cat) {
    const id = getId(cat);
    await deleteMenuCategory(id);
    setModal(null);
    await refresh();
  }

  async function handleCreateItem(cat, itemPayload) {
    const id = getId(cat);
    await createMenuItem(id, itemPayload);
    setModal(null);
    await refresh();
  }

  async function handleUpdateItem(item, payload) {
    const id = getId(item);
    await updateMenuItem(id, payload);
    setModal(null);
    await refresh();
  }

  async function handleDeleteItem(item) {
    const id = getId(item);
    await deleteMenuItem(id);
    setModal(null);
    await refresh();
  }

  return (
    <div className="min-h-screen bg-[#fff7f1] px-0 py-0 sm:px-0 sm:py-0">
      <div className="max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Menu Management</h1>
            <p className="text-sm text-slate-500 mt-1">Curate categories and items for your guests.</p>
          </div>
          <div>
            <button
              className="rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
              onClick={refresh}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-amber-100 bg-white p-6 text-slate-700 shadow-sm">Loading…</div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 shadow-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-amber-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-amber-100 px-4 py-3">
                  <h2 className="text-base font-bold text-slate-900">Categories</h2>
                  <button
                    className="rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-teal-600"
                    onClick={() => setModal({ type: "add-category" })}
                  >
                    Add
                  </button>
                </div>
                <ul className="max-h-[60vh] overflow-y-auto px-3 py-3 space-y-2">
                  {categories.map((cat) => {
                    const id = getId(cat);
                    const isActive = id === selectedId;
                    return (
                      <li
                        key={id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-3 transition ${
                          isActive
                            ? "border-teal-300 bg-teal-50"
                            : "border-amber-100 hover:border-teal-300 hover:bg-teal-50"
                        }`}
                        onClick={() => setSelectedId(id)}
                      >
                        <span className="truncate text-sm font-semibold text-slate-900">{getCategoryName(cat)}</span>
                        <div className="flex gap-1.5">
                          <button
                            aria-label="Edit category"
                            title="Edit"
                            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModal({ type: "edit-category", category: cat });
                            }}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4 20h4l10.5-10.5-4-4L4 16v4z" />
                              <path d="M14.5 5.5l4 4" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </button>
                          <button
                            aria-label="Delete category"
                            title="Delete"
                            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModal({ type: "delete-category", category: cat });
                            }}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                  {categories.length === 0 && (
                    <li className="px-3 py-2 text-sm text-slate-500">No categories</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-xl border border-amber-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-amber-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {selectedCategory ? getCategoryName(selectedCategory) : "Select a category"}
                    </div>
                    {selectedCategory && (
                      <div className="text-sm text-slate-600">
                        {getItems(selectedCategory).length} items
                      </div>
                    )}
                  </div>
                  <div>
                    <button
                      className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
                      onClick={() =>
                        selectedCategory &&
                        setModal({ type: "add-item", category: selectedCategory })
                      }
                      disabled={!selectedCategory}
                    >
                      Add Item
                    </button>
                  </div>
                </div>

                {!selectedCategory ? (
                  <div className="px-6 py-10 text-center text-slate-600">Choose a category to manage items.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-2">
                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">Veg</div>
                        <VegBadge isVeg={true} />
                      </div>
                      <div className="space-y-3">
                        {vegItems.length === 0 && (
                          <div className="text-sm text-slate-500">No veg items</div>
                        )}
                        {vegItems.map((item) => (
                          <div
                            key={getId(item)}
                            className="flex items-start justify-between rounded-lg border border-amber-100 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                          >
                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-slate-900">{getItemName(item)}</div>
                              {getItemDesc(item) && (
                                <div className="text-sm text-slate-600">{getItemDesc(item)}</div>
                              )}
                              {getItemPrice(item) !== undefined && (
                                <div className="text-sm font-semibold text-slate-900">₹{getItemPrice(item)}</div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                onClick={() => setModal({ type: "edit-item", item })}
                              >
                                Edit
                              </button>
                              <button
                                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                onClick={() => setModal({ type: "delete-item", item })}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">Non-Veg</div>
                        <VegBadge isVeg={false} />
                      </div>
                      <div className="space-y-3">
                        {nonVegItems.length === 0 && (
                          <div className="text-sm text-slate-500">No non-veg items</div>
                        )}
                        {nonVegItems.map((item) => (
                          <div
                            key={getId(item)}
                            className="flex items-start justify-between rounded-lg border border-amber-100 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                          >
                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-slate-900">{getItemName(item)}</div>
                              {getItemDesc(item) && (
                                <div className="text-sm text-slate-600">{getItemDesc(item)}</div>
                              )}
                              {getItemPrice(item) !== undefined && (
                                <div className="text-sm font-semibold text-slate-900">₹{getItemPrice(item)}</div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                onClick={() => setModal({ type: "edit-item", item })}
                              >
                                Edit
                              </button>
                              <button
                                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                onClick={() => setModal({ type: "delete-item", item })}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-amber-100 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {modal.type === "add-category" && (
              <>
                <div className="text-lg font-semibold mb-4 text-slate-900">Add Category</div>
                <CategoryForm
                  onCancel={() => setModal(null)}
                  onSubmit={handleCreateCategory}
                />
              </>
            )}

            {modal.type === "edit-category" && (
              <>
                <div className="text-lg font-semibold mb-4 text-slate-900">Edit Category</div>
                <CategoryForm
                  initialName={getCategoryName(modal.category)}
                  onCancel={() => setModal(null)}
                  onSubmit={(payload) => handleRenameCategory(modal.category, payload)}
                />
              </>
            )}

            {modal.type === "delete-category" && (
              <>
                <div className="text-lg font-semibold mb-4 text-slate-900">Delete Category</div>
                <p className="text-sm text-slate-700 mb-4">
                  Are you sure you want to delete "{getCategoryName(modal.category)}"?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg bg-rose-500 text-sm font-semibold text-white hover:bg-rose-600"
                    onClick={() => handleDeleteCategory(modal.category)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {modal.type === "add-item" && (
              <>
                <div className="text-lg font-semibold mb-4 text-slate-900">Add Item</div>
                <ItemForm
                  onCancel={() => setModal(null)}
                  onSubmit={(payload) => handleCreateItem(modal.category, payload)}
                />
              </>
            )}

            {modal.type === "edit-item" && (
              <>
                <div className="text-lg font-semibold mb-4 text-slate-900">Edit Item</div>
                <ItemForm
                  initial={{
                    name: getItemName(modal.item),
                    description: getItemDesc(modal.item),
                    price: getItemPrice(modal.item),
                    isVeg: getItemVeg(modal.item),
                  }}
                  onCancel={() => setModal(null)}
                  onSubmit={(payload) => handleUpdateItem(modal.item, payload)}
                />
              </>
            )}

            {modal.type === "delete-item" && (
              <>
                <div className="text-lg font-semibold mb-4 text-slate-900">Delete Item</div>
                <p className="text-sm text-slate-700 mb-4">
                  Are you sure you want to delete "{getItemName(modal.item)}"?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg bg-rose-500 text-sm font-semibold text-white hover:bg-rose-600"
                    onClick={() => handleDeleteItem(modal.item)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
