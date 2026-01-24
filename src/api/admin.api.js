const API_BASE = "https://ordering-system-backend-a1az.onrender.com";

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
