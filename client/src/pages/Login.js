import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../App.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      // ⭐ CALL BACKEND LOGIN API
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      // ⭐ SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      // redirect dashboard
      window.location.href = "/dashboard";

    } catch (err) {
  console.log(err.response?.data);
  alert(err.response?.data?.message || "Login failed");
}

  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-header">
          <h1>Data<span>Vault</span></h1>
          <p>Backup Management System</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>

          <p style={{ marginTop: "15px", textAlign: "center" }}>
            Don’t have an account? 
            <Link to="/register"> Register</Link>
          </p>

        </form>

      </div>
    </div>
  );
}

export default Login;
