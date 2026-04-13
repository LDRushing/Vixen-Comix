const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
console.log("API URL from .env:", API);

// --- AUTH FUNCTIONS ---

export async function registerUser(userData) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Registration failed");
  }
  return res.json();
}

export async function loginUser(userData) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  return res.json();
}

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`, // Consistent Bearer format
    },
  });
  if (!res.ok) throw new Error("Failed to get current user");
  return await res.json();
};

// --- USER MANAGEMENT (ADMIN) ---

export const getUsers = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Access denied");
  return await res.json();
};

export const deleteUser = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return await res.json();
};

export const editUser = async (id, updates) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return await res.json();
};

// --- CONTACT & PROGRESS ---

export const sendContactForm = async (formData) => {
  const res = await fetch(`${API}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw new Error("Failed to send contact form");
  return await res.json();
};

// Combined into one clear function for saving
export const updateReadingProgress = async (comicSlug, chapterIndex) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      comic_slug: comicSlug,
      last_chapter_index: chapterIndex,
    }),
  });
  if (!res.ok) throw new Error("Failed to update progress");
  return res.json();
};

// Combined into one clear function for fetching
export const getProgress = async () => {
  const token = localStorage.getItem("token");

  // Safety check: if there's no token, don't even try to fetch
  if (!token) return [];

  const res = await fetch(`${API}/api/progress`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Check if the server says "No Content" (Successful, but empty)
  if (res.status === 204) {
    return [];
  }

  // Check for other errors
  if (!res.ok) {
    throw new Error("Failed to fetch progress");
  }

  // Only parse if we have content
  return await res.json();
};
