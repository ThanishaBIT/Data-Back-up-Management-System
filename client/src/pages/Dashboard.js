// src/pages/Dashboard.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [trash, setTrash] = useState([]);
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ⭐ STATES
  const [file, setFile] = useState(null);
  const [issuer, setIssuer] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchFiles();
    fetchTrash();
    fetchProfile();
  }, []);

  // 📌 FETCH DATA
  const fetchFiles = async () => {
    const res = await axios.get("http://https://backup-backend-7ojm.onrender.com/api/files", config);
    setFiles(res.data);
  };

  const fetchTrash = async () => {
    const res = await axios.get(
      "http://https://backup-backend-7ojm.onrender.com/api/files/trash",
      config
    );
    setTrash(res.data);
  };

  const fetchProfile = async () => {
    const res = await axios.get(
      "http://https://backup-backend-7ojm.onrender.com/api/auth/profile",
      config
    );
    setUserInfo(res.data);
  };

  // 📌 UPLOAD CERTIFICATE
  const handleUpload = async () => {
    if (!file) return alert("Select file");

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("issuer", issuer);
    formData.append("category", category);
     formData.append("year", year);
    await axios.post(
      "http://https://backup-backend-7ojm.onrender.com/api/files/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // ✅ RESET
    setFile(null);
    setIssuer("");
    setCategory("");
    setYear("");

    fetchFiles();
    setIsUploading(false);
  };

  // 📌 DELETE
  const deleteFile = async (id) => {
    await axios.patch(
      `http://https://backup-backend-7ojm.onrender.com/api/files/delete/${id}`,
      {},
      config
    );
    fetchFiles();
    fetchTrash();
  };

  // 📌 RESTORE
  const restoreFile = async (id) => {
    try {
      await axios.patch(
        `http://https://backup-backend-7ojm.onrender.com/api/files/restore/${id}`,
        {},
        config
      );

      fetchFiles();
      fetchTrash();

    } catch (err) {
      alert(err.response?.data?.message);
    }
  };
  // permanently delete 
  const permanentDelete = async (id) => {
  try {
    await axios.delete(
  `http://https://backup-backend-7ojm.onrender.com/api/files/permanent/${id}`,
  config
);

    fetchTrash();
    fetchFiles();

  } catch (err) {
    alert("Permanent delete failed");
  }
};   

  // 📌 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // 📌 SEARCH
  const filteredFiles = files.filter((f) => {
  const name = f.fileName?.toLowerCase() || "";
  const issuer = f.issuer?.toLowerCase() || "";
  const category = f.category?.toLowerCase() || "";

  const query = search.toLowerCase().trim();

  return (
    name.includes(query) ||
    issuer.includes(query) ||
    category.includes(query)
  );
});

  // 📄 VIEW FILE
  const handleView = async (id) => {
    try {
      const response = await axios.get(
        `http://https://backup-backend-7ojm.onrender.com/api/files/download/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      window.open(url);

    } catch (error) {
      alert("Unable to open certificate");
    }
  };

  // Utility function to safely access properties
  const safe = (value) => value || "";

  return (
    <div className="modern-dashboard">

      {/* TOP BAR */}
      <div className="top-bar">
        <h2 className="logo">
          Data<span>Vault</span>
        </h2>

        <div className="top-actions">
          <button
            className="profile-btn"
            onClick={() => setShowProfile(true)}
          >
            👤 Profile
          </button>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* PROFILE */}
      {showProfile && userInfo && (
        <div className="profile-overlay">
          <div className="profile-card">

            <div className="profile-header">
              <div className="profile-avatar">
                {userInfo.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3>{userInfo.name}</h3>
                <p>{userInfo.email}</p>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-box">
                <h4>{files.length}</h4>
                <p>Total Certificates</p>
              </div>

              <div className="stat-box">
                <h4>{trash.length}</h4>
                <p>Deleted</p>
              </div>
            </div>
            <div className="profile-close">
  <button onClick={() => setShowProfile(false)}>
    Close
  </button>
</div>
            
          </div>
        </div>
      )}

      {/* UPLOAD */}
      <div className="upload-card">

  <div className="upload-header">
    <div className="upload-icon">⬆️</div>
    <h3>Upload Certificate</h3>
    <p>Select your certificate and enter details</p>
  </div>

  <div className="upload-fields">

    <input
      type="file"
      onChange={(e) => setFile(e.target.files[0])}
    />

    <input
      type="text"
      placeholder="Issuer (e.g., NPTEL)"
      value={issuer}
      onChange={(e) => setIssuer(e.target.value)}
    />

    <input
      type="text"
      placeholder="Category (e.g., AI)"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
    />

    <input
      type="number"
      placeholder="Year (e.g., 2025)"
      value={year}
      onChange={(e) => setYear(e.target.value)}
    />

    <button className="upload-btn" onClick={handleUpload}>
      🚀 Upload Certificate
    </button>

  </div>
</div>
      {/* SEARCH */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search certificates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FILES */}
      <h3 className="section-title">My Certificates</h3>

      <div className="file-grid">
        {filteredFiles.map((file) => {
          const fileName = safe(file.fileName) || "No Name";
          const issuer = safe(file.issuer) || "N/A";
          const category = safe(file.category) || "General";
          const year = safe(file.year) || "-";
          const status = safe(file.status) || "pending";

          return (
            <div key={file._id} className="file-card">

              <h4>{fileName}</h4>

              <p>Issuer: {issuer}</p>
              <p>Category: {category}</p>
              <p>Year: {year}</p>

              <p className="status">
                {status === "pending" && "🟡 Pending"}
                {status === "approved" && "🟢 Verified"}
                {status === "rejected" && "🔴 Rejected"}
              </p>

              <div className="file-actions">
                <button onClick={() => handleView(file._id)}>View</button>
                <button onClick={() => deleteFile(file._id)}>Trash</button>
              </div>

            </div>
          );
        })}
      </div>

      {/* TRASH */}
     <h3 className="section-title">Recently Deleted</h3>

{trash.length === 0 ? (
  <p>No deleted certificates</p>
) : (
  <table className="file-table">
    <thead>
      <tr>
        <th>S.NO</th>
        <th>File Name</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {trash.map((file, index) => (
        <tr key={file._id}>
          <td>{index + 1}</td>
          <td>{file.fileName}</td>

          <td>
            <button onClick={() => restoreFile(file._id)}>
              Restore
            </button>

            <button onClick={() => permanentDelete(file._id)}>
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

export default Dashboard;