import React, { useState } from "react";
import "../App.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Simple frontend login check
    if (email === "thanisha@gmail.com" && password === "@@120000") {

      // store login status
      localStorage.setItem("user", "true");

      // IMPORTANT: reload app so protected route updates
      window.location.href = "/dashboard";

    } else {
      alert("Invalid login details");
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
              placeholder="admin@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" /> Remember me
            </label>

            <a href="#forgot" className="forgot-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
          <p style={{ marginTop: "15px", textAlign: "center" }}>
          Don’t have an account? 
          <a href="/register"> Register</a>
         </p>


        </form>

    

      </div>
    </div>
  );
}

export default Login;
