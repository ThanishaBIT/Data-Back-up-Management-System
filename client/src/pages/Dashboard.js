// src/pages/Dashboard.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [trash, setTrash] = useState([]);
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const fetchFiles = async () => {
    const res = await axios.get("http://localhost:5000/api/files", config);
    setFiles(res.data);
  };

  const fetchTrash = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/files/trash",
      config
    );
    setTrash(res.data);
  };

  const fetchProfile = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/auth/profile",
      config
    );
    setUserInfo(res.data);
  };

  const handleUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    await axios.post(
      "http://localhost:5000/api/files/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    fetchFiles();
    setIsUploading(false);
  };

  const deleteFile = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/files/delete/${id}`,
      {},
      config
    );
    fetchFiles();
    fetchTrash();
  };

  const restoreFile = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/files/restore/${id}`,
      {},
      config
    );
    fetchFiles();
    fetchTrash();
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const filteredFiles = files.filter((file) =>
    file.fileName.toLowerCase().includes(search.toLowerCase())
  );
  const handleView = async (id) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/files/download/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], {
      type: "application/pdf", // ⭐ VERY IMPORTANT
    });

    const url = window.URL.createObjectURL(blob);

    window.open(url);

  } catch (error) {
    console.error(error);
    alert("Unable to open file");
  }
};

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

      {/* PROFILE MODAL */}
      {showProfile && userInfo && (
        <div className="profile-overlay">
          <div className="profile-card">

            <div className="profile-header">
              <div className="profile-avatar">
                {userInfo.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3>{userInfo.name}</h3>
                <p className="profile-email">{userInfo.email}</p>
              </div>
            </div>

            <div className="profile-info">
              <div className="info-row">
                <span>Role</span>
                <span className="badge">{userInfo.role}</span>
              </div>

              <div className="profile-stats">
                <div className="stat-box">
                  <h4>{files.length}</h4>
                  <p>Total Files</p>
                </div>

                <div className="stat-box">
                  <h4>{trash.length}</h4>
                  <p>Deleted Files</p>
                </div>
              </div>
            </div>

            <button
              className="close-profile"
              onClick={() => setShowProfile(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD */}
      <div
        className="upload-zone"
        onClick={() => document.getElementById("fileInput").click()}
      >
        <input
          type="file"
          hidden
          id="fileInput"
          onChange={(e) => handleUpload(e.target.files[0])}
        />

        <div className="upload-icon">☁⬆</div>
        <p>
          {isUploading
            ? "Uploading..."
            : "Drag & Drop or Click to Upload"}
        </p>
      </div>

      {/* SEARCH */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ACTIVE FILES */}
      <h3 className="section-title">Active Files</h3>

      <div className="file-grid">
        {filteredFiles.map((file) => (
          <div key={file._id} className="file-card">
            <div className="file-icon">📄</div>

            <div className="file-details">
              <h4>{file.fileName}</h4>
              <p>{Math.round(file.fileSize / 1024)} KB</p>
            </div>
         <div className="file-actions">
  <button 
    className="view-btn"
    onClick={() => handleView(file._id)}
  >
    View
  </button>

  <button 
    className="trash-btn"
    onClick={() => deleteFile(file._id)}
  >
    Trash
  </button>
</div>
         
          </div>
        ))}
      </div>

      {/* TRASH */}
      <h3 className="section-title">Recently Deleted</h3>

      {trash.length === 0 ? (
        <div className="empty-state">
          🗑 No deleted files yet. Your vault is clean!
        </div>
      ) : (
        <div className="file-grid">
          {trash.map((file) => (
            <div key={file._id} className="file-card">
              <h4>{file.fileName}</h4>

              <button className="restore-btn"onClick={() => restoreFile(file._id)}>
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;