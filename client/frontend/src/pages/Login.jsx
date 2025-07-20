import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, formData);

      // Save token + user name
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("name", response.data.name); // <- backend must send name too
      localStorage.setItem("id", response.data.id); // <- backend must send name too


      navigate("/landing"); // Redirect to landing
    } catch (err) {
      const message = err.response?.data?.message || "Login failed.";
      setError(message);
    }
  };

  return (
    <div className="login-page-bg">
      <div className="form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <br />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <br />
        <button type="submit">Login</button>
         <div className="register-option">
            <p>Dont have an account?
              <div className="register-link" onClick={() => navigate("/register")}>Register instead</div>
            </p>
            
        </div>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
    </div>
      
    
    
  );
};

export default Login;
