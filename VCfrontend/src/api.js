const API = import.meta.env.VITE_API_URL;
console.log("API URL from .env:", API);

export const registerUser = async (formData) => {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw new Error("Registration failed");
  return await res.json();
};

export const loginUser = async (credentials) => {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  localStorage.setItem("token", data.token); // store JWT
  return data;
};

export const getUsers = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/users`, {
    headers: {
      Authorization: token,
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