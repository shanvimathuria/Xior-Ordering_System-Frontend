const API_BASE = import.meta.env.DEV ? "/api" : "https://ordering-system-backend-a1az.onrender.com";

/* =========================
   MENU CATEGORIES
========================= */

// GET all categories
export async function fetchMenuCategories() {
  const res = await fetch(`${API_BASE}/admin/menu/categories`);

  if (!res.ok) {
    throw new Error("Failed to fetch menu categories");
  }

  return res.json();
}

// CREATE category
export async function createMenuCategory(payload) {
  const res = await fetch(`${API_BASE}/admin/menu/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create menu category");
  }

  return res.json();
}

// UPDATE category
export async function updateMenuCategory(categoryId, payload) {
  const res = await fetch(
    `${API_BASE}/admin/menu/categories/${categoryId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update menu category");
  }

  return res.json();
}

// DELETE category
export async function deleteMenuCategory(categoryId) {
  const res = await fetch(
    `${API_BASE}/admin/menu/categories/${categoryId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete menu category");
  }

  return true;
}

/* =========================
   MENU ITEMS
========================= */

// CREATE item (inside a category)
export async function createMenuItem(categoryId, payload) {
  const res = await fetch(`${API_BASE}/admin/menu/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      category_id: categoryId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create menu item");
  }

  return res.json();
}


// UPDATE item
export async function updateMenuItem(itemId, payload) {
  const res = await fetch(
    `${API_BASE}/admin/menu/items/${itemId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update menu item");
  }

  return res.json();
}

// DELETE item
export async function deleteMenuItem(itemId) {
  const res = await fetch(
    `${API_BASE}/admin/menu/items/${itemId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete menu item");
  }

  return true;
}

/* =========================
   ORDERS
========================= */

// GET all desk orders
export async function fetchDeskOrders() {
  const res = await fetch(`${API_BASE}/desk/orders`);

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

/* =========================
   TABLES
========================= */

// GET all tables
export async function fetchAdminTables() {
  const primary = await fetch(`${API_BASE}/admin/table`);

  if (primary.ok) {
    return primary.json();
  }

  // fallback to legacy endpoint if primary fails
  const fallback = await fetch(`${API_BASE}/admin/tables`);
  if (!fallback.ok) {
    let message = "Failed to fetch tables";
    try {
      const data = await fallback.json();
      message = data?.message || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return fallback.json();
}

// CREATE table
export async function createAdminTable(payload) {
  const res = await fetch(`${API_BASE}/admin/tables`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMsg = "Failed to create table";
    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorData?.error || errorMsg;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// DELETE table
export async function deleteAdminTable(tableId) {
  const res = await fetch(`${API_BASE}/admin/tables/${tableId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    let errorMsg = "Failed to delete table";
    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorData?.error || errorMsg;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMsg);
  }

  return true;
}

// UPDATE table
export async function updateAdminTable(tableId, payload) {
  const res = await fetch(`${API_BASE}/admin/tables/${tableId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMsg = "Failed to update table";
    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorData?.error || errorMsg;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

/* =========================
   TAXES
========================= */

// GET all taxes
export async function fetchTaxes() {
  const res = await fetch(`${API_BASE}/admin/taxes`, {
    mode: 'cors',
  });

  if (!res.ok) {
    let errorMsg = "Failed to fetch taxes";
    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorData?.error || errorMsg;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// CREATE tax
export async function createTax(payload) {
  try {
    const res = await fetch(`${API_BASE}/admin/taxes`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      mode: 'cors',
    });

    if (!res.ok) {
      let errorMsg = "Failed to create tax";
      try {
        const errorData = await res.json();
        errorMsg = errorData?.message || errorData?.error || JSON.stringify(errorData);
      } catch (parseErr) {
        errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    if (err.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check your internet connection.");
    }
    throw err;
  }
}

// UPDATE tax
export async function updateTax(taxId, payload) {
  const res = await fetch(`${API_BASE}/admin/taxes/${taxId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: 'cors',
  });

  if (!res.ok) {
    let errorMsg = "Failed to update tax";
    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorData?.error || JSON.stringify(errorData);
    } catch {
      errorMsg = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// DELETE tax
export async function deleteTax(taxId) {
  const res = await fetch(`${API_BASE}/admin/taxes/${taxId}`, {
    method: "DELETE",
    mode: 'cors',
  });

  if (!res.ok) {
    let errorMsg = "Failed to delete tax";
    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorData?.error || JSON.stringify(errorData);
    } catch {
      errorMsg = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return true;
}

/* =========================
   CHARGES
========================= */

// GET all charges
export async function fetchCharges() {
  const res = await fetch(`${API_BASE}/admin/charges`, {
    mode: 'cors',
  });

  if (!res.ok) {
    let errorMsg = "Failed to fetch charges";
    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorData?.error || errorMsg;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// CREATE charge
export async function createCharge(payload) {
  try {
    const res = await fetch(`${API_BASE}/admin/charges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: 'cors',
    });

    if (!res.ok) {
      let errorMsg = "Failed to create charge";
      try {
        const errorData = await res.json();
        errorMsg = errorData?.message || errorData?.error || JSON.stringify(errorData);
      } catch (parseErr) {
        errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    if (err.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check your internet connection.");
    }
    throw err;
  }
}

// UPDATE charge
export async function updateCharge(chargeId, payload) {
  const res = await fetch(`${API_BASE}/admin/charges/${chargeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: 'cors',
  });

  if (!res.ok) {
    let errorMsg = "Failed to update charge";
    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorData?.error || JSON.stringify(errorData);
    } catch {
      errorMsg = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// DELETE charge
export async function deleteCharge(chargeId) {
  const res = await fetch(`${API_BASE}/admin/charges/${chargeId}`, {
    method: "DELETE",
    mode: 'cors',
  });

  if (!res.ok) {
    let errorMsg = "Failed to delete charge";
    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorData?.error || JSON.stringify(errorData);
    } catch {
      errorMsg = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return true;
}

/* =========================
   INVOICE SETTINGS
========================= */

// GET invoice settings
export async function fetchInvoiceSettings() {
  const res = await fetch(`${API_BASE}/admin/invoice-settings`, {
    mode: 'cors',
  });

  if (!res.ok) {
    let errorMsg = "Failed to fetch invoice settings";
    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorData?.error || errorMsg;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// UPDATE invoice settings
export async function updateInvoiceSettings(payload) {
  const res = await fetch(`${API_BASE}/admin/invoice-settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    mode: 'cors',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMsg = "Failed to update invoice settings";
    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorData?.error || errorMsg;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMsg);
  }

  return res.json();
}
