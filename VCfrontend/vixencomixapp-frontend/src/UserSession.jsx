import React from "react";             // ✅ React must be imported
import { useEffect, useState } from "react";
import { getCurrentUser } from "./api";

export default function UserSession({ onLogout }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { user } = await getCurrentUser();
        setUser(user);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  if (!user) return <p>Loading user...</p>;

  return (
    <div>
      <p>
        Logged in as: <strong>{user.first_name} {user.last_name}</strong>{" "}
        ({user.email}) {user.is_admin && "🛡 Admin"}
      </p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
