import React, { useEffect, useState } from "react";
import "../styles/Admin.css";

function AdminUsers() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // ➕ Add user states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const token = localStorage.getItem("token");

  /* =========================
     🔹 Fetch Users (FIXED)
  ========================== */
  const fetchUsers = async (query = "") => {
    try {
      const res = await fetch(
        `http://https://backup-backend-7ojm.onrender.com/api/admin/users?search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      setUsers(data);

    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  /* =========================
     🔹 Initial Load
  ========================== */
  useEffect(() => {
    fetchUsers(); // load all users first
  }, []);

  /* =========================
     🔹 Search Trigger
  ========================== */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers(search);
    }, 300); // debounce

    return () => clearTimeout(delay);
  }, [search]);

  /* =========================
     🔹 Delete User
  ========================== */
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await fetch(
      `http://https://backup-backend-7ojm.onrender.com/api/admin/user/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    fetchUsers(search);
  };

  /* =========================
     🔹 Add User
  ========================== */
  const addUser = async () => {
    if (!name || !email || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await fetch(
        "http://https://backup-backend-7ojm.onrender.com/api/admin/add-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name, email, password })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message);
      }

      alert("User added successfully");

      setName("");
      setEmail("");
      setPassword("");

      fetchUsers(search);

    } catch (err) {
      alert("Error adding user");
    }
  };

  /* =========================
     🔹 UI
  ========================== */
  return (
    <div className="admin-users">

      <h2>Users Management</h2>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />

      {/* ➕ ADD USER */}
      <div className="add-user">
        <h3>Add New User</h3>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={addUser}>Add User</button>
      </div>

      {/* 📊 USERS TABLE */}
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>

                <td>
                  <button
                    className="btn-danger"
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}

export default AdminUsers;