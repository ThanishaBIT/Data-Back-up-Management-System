import React, { useState } from "react";
import axios from "axios";
import "../App.css";

function Register() {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try{
      await axios.post(
        "http://localhost:5000/api/auth/register",
        { name,email,password }
      );

      alert("Registration successful");
      window.location.href = "/";

    }catch(err){
      alert("Register failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-header">
          <h1>Register</h1>
          <p>Create your DataVault account</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">

          <div className="input-group">
            <label>Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} required/>
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
          </div>

          <button className="login-button">Register</button>

        </form>

      </div>
    </div>
  );
}

export default Register;
