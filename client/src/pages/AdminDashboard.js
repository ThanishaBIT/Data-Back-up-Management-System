import React, { useEffect, useState } from "react";
import "../App.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({});

  const token = localStorage.getItem("token");

  // =============================
  // 🔹 Load Data on Mount
  // =============================
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const usersRes = await fetch(
        "http://localhost:5000/api/admin/users",
        { headers }
      );

      const filesRes = await fetch(
        "http://localhost:5000/api/admin/files",
        { headers }
      );

      const statsRes = await fetch(
        "http://localhost:5000/api/admin/stats",
        { headers }
      );

      setUsers(await usersRes.json());
      setFiles(await filesRes.json());
      setStats(await statsRes.json());

    } catch (error) {
      console.error("Admin fetch error:", error);
    }
  };

  // =============================
  // 🔹 Delete User
  // =============================
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await fetch(`http://localhost:5000/api/admin/user/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchAllData();
  };

  // =============================
  // 🔹 Delete File
  // =============================
  const deleteFile = async (id) => {
    if (!window.confirm("Delete this file permanently?")) return;

    await fetch(`http://localhost:5000/api/admin/file/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchAllData();
  };

  // =============================
  // 🔹 Secure Download
  // =============================
  const downloadFile = async (id, fileName) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/download/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        alert("Download failed");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="admin-container">

      {/* HEADER */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Active Files</h3>
          <p>{stats.totalActiveFiles || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Deleted Files</h3>
          <p>{stats.totalDeletedFiles || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Storage Used (MB)</h3>
          <p>{stats.totalStorageUsedMB || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Uploads Today</h3>
          <p>{stats.filesToday || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Most Active User</h3>
          <p>{stats.mostActiveUser || "N/A"}</p>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="admin-section">
        <h2>Users</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
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
      </div>

      {/* FILES TABLE */}
      <div className="admin-section">
        <h2>Files</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>File</th>
              <th>Uploaded By</th>
              <th>Email</th>
              <th>Download</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file._id}>
                <td>{file.fileName}</td>
                <td>{file.userId?.name}</td>
                <td>{file.userId?.email}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() =>
                      downloadFile(file._id, file.fileName)
                    }
                  >
                    Download
                  </button>
                </td>
                <td>
                  <button
                    className="btn-danger"
                    onClick={() => deleteFile(file._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default AdminDashboard;