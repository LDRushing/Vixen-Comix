const API = import.meta.env.VITE_API_URL; // e.g., http://localhost:3000
console.log("API URL from .env:", API);


// Register user
export async function registerUser(userData) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Registration failed");
  }

  return res.json();
}
//login user
export async function loginUser(userData) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }

  return res.json();
}

export const getUsers = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/users`, {
    headers: {
      Authorization: `Bearer ${token}`,  // <-- FIX
    },
  });
  if (!res.ok) throw new Error("Access denied");
  return await res.json();
};
export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/auth/me`, {
    headers: {
      Authorization: token,
    },
  });
  if (!res.ok) throw new Error("Failed to get current user");
  return await res.json();
};
export const deleteUser = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token,
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
      Authorization: token,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return await res.json();
};
export const sendContactForm = async (formData) => {
  const res = await fetch(`${API}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) throw new Error("Failed to send contact form");
  return await res.json();
};