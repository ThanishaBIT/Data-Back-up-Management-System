import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [trash, setTrash] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const token = localStorage.getItem("token");

const config = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};

const fetchFiles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/files",config);
      setFiles(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchTrash = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/files/trash",config);
      setTrash(res.data);
    } catch (err) { console.error(err); }
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    
  if (!token) {
    window.location.href = "/";
    return;
  }
    fetchFiles();
    fetchTrash();
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("http://localhost:5000/api/files/upload", formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" },
      });
      fetchFiles();
    } catch (err) { alert("Upload failed"); } 
    finally { setIsUploading(false); }
  };

  // Drag and Drop Handlers
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  const deleteFile = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/files/delete/${id}`,{},config);
      fetchFiles(); fetchTrash();
    } catch (err) { console.error(err); }
  };

  const restoreFile = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/files/restore/${id}`,{},config);
      fetchFiles(); fetchTrash();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="clean-dashboard">
      <nav className="nav-bar">
        <div className="nav-logo">Data<span>Vault</span></div>
        <button className="btn-logout" onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}>Logout</button>
      </nav>

      <main className="content-area">
        {/* DRAG AND DROP UPLOAD ZONE */}
        <div className="upload-container">
          <label 
            className={`upload-dropzone ${isDragging ? "dragging" : ""} ${isUploading ? "uploading" : ""}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <input type="file" hidden onChange={(e) => handleUpload(e.target.files[0])} />
            
            <div className="upload-content">
              {isUploading ? (
                <div className="upload-status">
                  <div className="spinner"></div>
                  <p>Securing your file...</p>
                </div>
              ) : (
                <>
                  <div className="upload-icon-circle">
                    <span className="icon">↑</span>
                  </div>
                  <div className="upload-text">
                    <h3>{isDragging ? "Release to Upload" : "Click or Drag Files"}</h3>
                    <p>SVG, PNG, JPG or PDF (max. 50MB)</p>
                  </div>
                </>
              )}
            </div>
          </label>
        </div>

        <h2 className="section-label">Active Backups</h2>
        <div className="modern-grid">
          {files.map(file => (
            <div key={file._id} className="modern-card">
              <div className="file-icon-box">📄</div>
              <div className="file-info">
                <p className="file-name" title={file.fileName}>{file.fileName}</p>
                <p className="file-size">{Math.round(file.fileSize / 1024)} KB</p>
              </div>
              <div className="file-actions">
                <a href={`http://localhost:5000/${file.filePath}`} target="_blank" rel="noreferrer">View</a>
                <button onClick={() => deleteFile(file._id)} className="text-red">Trash</button>
              </div>
            </div>
          ))}
        </div>

        <div className="trash-area">
          <h2 className="section-label">Recently Deleted</h2>
          <div className="modern-grid">
            {trash.map(file => (
              <div key={file._id} className="modern-card">
                <p className="file-name">{file.fileName}</p>
                <div className="file-actions">
                  <button onClick={() => restoreFile(file._id)} className="btn-restore">Restore</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;