import { useEffect, useState } from "react";
import { getUsers, deleteUser, editUser } from "./api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    is_admin: false,
  });

  // Helper: simple email validator
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_admin: user.is_admin,
    });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveEdit = async () => {
    if (!editForm.first_name.trim() || !editForm.last_name.trim()) {
      toast.error("First and last name are required");
      return;
    }
    if (!validateEmail(editForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      await editUser(editingUserId, editForm);
      await loadUsers();
      setEditingUserId(null);
      toast.success("User updated successfully!");
    } catch (err) {
      toast.error("Failed to update user: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
      toast.success("User deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete user: " + err.message);
    }
  };

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <>
      <h2>User Management</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>First Name</th>
            <th style={thStyle}>Last Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Admin?</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: "1rem", textAlign: "center" }}>
                No users found.
              </td>
            </tr>
          )}
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: "1px solid #ddd" }}>
              {editingUserId === user.id ? (
                <>
                  <td style={tdStyle}>
                    <input
                      name="first_name"
                      value={editForm.first_name}
                      onChange={handleEditChange}
                      style={inputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      name="last_name"
                      value={editForm.last_name}
                      onChange={handleEditChange}
                      style={inputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      name="email"
                      type="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ textAlign: "center", ...tdStyle }}>
                    <input
                      name="is_admin"
                      type="checkbox"
                      checked={editForm.is_admin}
                      onChange={handleEditChange}
                      aria-label="Admin status"
                    />
                  </td>
                  <td style={tdStyle}>
                    <button onClick={saveEdit} style={buttonStyle}>
                      Save
                    </button>
                    <button onClick={cancelEditing} style={buttonStyle}>
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td style={tdStyle}>{user.first_name}</td>
                  <td style={tdStyle}>{user.last_name}</td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={{ textAlign: "center", ...tdStyle }}>
                    {user.is_admin ? "✅" : "❌"}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => startEditing(user)}
                      style={buttonStyle}
                      aria-label={`Edit user ${user.first_name} ${user.last_name}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{ ...buttonStyle, backgroundColor: "#e74c3c" }}
                      aria-label={`Delete user ${user.first_name} ${user.last_name}`}
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

// Styles
const thStyle = {
  padding: "0.5rem 1rem",
  borderBottom: "2px solid #ccc",
  textAlign: "left",
};

const tdStyle = {
  padding: "0.5rem 1rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.3rem",
  boxSizing: "border-box",
};

const buttonStyle = {
  marginRight: "0.5rem",
  padding: "0.3rem 0.7rem",
  border: "none",
  backgroundColor: "#4a90e2",
  color: "white",
  cursor: "pointer",
  borderRadius: "3px",
  transition: "background-color 0.3s ease",
};

