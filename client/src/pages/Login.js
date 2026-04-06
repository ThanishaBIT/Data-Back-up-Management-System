import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import "../styles/Login.css";
function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const res = await axios.post(
        "https://data-back-up-backened.onrender.com/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);

      if (res.data.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = "https://data-back-up-backened.onrender.com/api/auth/google";
  };

  return (
    <div className="login-container">

      <div className="login-card">

        {/* HEADER */}
        <div className="login-header">
          <h1>Data<span>Vault</span></h1>
          <p>Secure Backup & File Management</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="login-form">

          {/* EMAIL */}
          <div className="input-group">
            <label>Email Address</label>

            <div className="input-icon">
              <FaEnvelope className="icon" />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label>Password</label>

            <div className="input-icon">
              <FaLock className="icon" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button type="submit" className="login-button">
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* DIVIDER */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            className="google-button"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="google-icon" />
            Continue with Google
          </button>

          {/* REGISTER */}
          <p className="register-text">
            Don’t have an account?
            <Link to="/register"> Create Account</Link>
          </p>

        </form>

      </div>

    </div>
  );
}

export default Login;