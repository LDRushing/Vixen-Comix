import { useEffect, useState } from "react";
import { getUsers } from "./api";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message || "Access denied.");
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {users.length ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td>{u.is_admin ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && <p>Loading users...</p>
      )}
    </div>
  );
}
