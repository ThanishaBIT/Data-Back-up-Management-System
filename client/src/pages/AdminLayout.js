import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../App.css";

function AdminLayout() {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (

    <div className="admin-wrapper">

      {/* LEFT SIDEBAR */}
      <div className="admin-sidebar">

        <div className="logo">
          <h2>DV</h2>
        </div>

        <Link to="/admin/dashboard">🏠</Link>
        <Link to="/admin/users">👤</Link>
        <Link to="/admin/files">📁</Link>

        <button className="logout-icon" onClick={logout}>
          ⎋
        </button>

      </div>

      {/* MAIN CONTENT */}
      <div className="admin-main">

        {/* HEADER */}
        <div className="admin-header">

          <h2>DataVault Admin Panel</h2>
             <div className="admin-profile">
            <span className="admin-badge">Admin</span>
            </div>

        </div>

        {/* PAGE CONTENT */}
        <div className="admin-content">
          <Outlet />
        </div>

      </div>

    </div>

  );
}

export default AdminLayout;