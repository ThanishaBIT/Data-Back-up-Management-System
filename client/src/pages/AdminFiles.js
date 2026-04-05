import React, { useEffect, useState } from "react";
import "../styles/Admin.css";

function AdminFiles() {

  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  /* =========================
     🔹 Fetch Files (WITH SEARCH)
  ========================== */
  const fetchFiles = async (query = "") => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/files?search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      setFiles(data);

    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  /* =========================
     🔹 Initial Load
  ========================== */
  useEffect(() => {
    fetchFiles();
  }, []);

  /* =========================
     🔹 Search Trigger
  ========================== */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchFiles(search);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  /* =========================
     🔹 Delete File
  ========================== */
  const deleteFile = async (id) => {
    if (!window.confirm("Delete this file?")) return;

    await fetch(
      `http://localhost:5000/api/admin/file/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    fetchFiles(search);
  };

  /* =========================
     🔹 Approve File
  ========================== */
  const approveFile = async (id) => {
    await fetch(
      `http://localhost:5000/api/admin/approve/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    fetchFiles(search);
  };

  /* =========================
     🔹 Reject File
  ========================== */
  const rejectFile = async (id) => {
    await fetch(
      `http://localhost:5000/api/admin/reject/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    fetchFiles(search);
  };

  /* =========================
     🔹 UI
  ========================== */
  return (
    <div className="admin-users">

      <h2>Files Management</h2>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />

      {/* 📊 TABLE */}
      {files.length === 0 ? (
        <p>No files found</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>File Name</th>
              <th>User</th>
              <th>Issuer</th>
              <th>Category</th>
              <th>Year</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {files.map((file, index) => (
              <tr key={file._id}>
                <td>{index + 1}</td>
                <td>{file.fileName}</td>
                <td>{file.userId?.name}</td>
                <td>{file.issuer || "N/A"}</td>
                <td>{file.category || "General"}</td>
                <td>{file.year || "-"}</td>

                <td>
                  <span
                    style={{
                      color:
                        file.status === "approved"
                          ? "lime"
                          : file.status === "rejected"
                          ? "red"
                          : "orange"
                    }}
                  >
                    {file.status}
                  </span>
                </td>

                <td>
                  <button className="btn-approve" onClick={() => approveFile(file._id)}>
  Approve
</button>

<button className="btn-reject" onClick={() => rejectFile(file._id)}>
  Reject
</button>

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
      )}

    </div>
  );
}

export default AdminFiles;