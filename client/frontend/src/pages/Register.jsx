import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Register.css'

const Register = () => {
  const navigate = useNavigate(); // ← ✅ Hook for navigation
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    telegramId: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    try {
      const response = await axios.post(`${API_BASE_URL}/users/register`, formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("name", response.data.name); // if backend sends name
      setSuccess("Registration successful! ✅");

      // ✅ Navigate to landing page after short delay (optional)
      setTimeout(() => navigate("/landing"), 1000);

    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      setError(message);
    }
  };

  return (
  
    <div className="register-page-bg">
      <div className="form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <br />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <br />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <br />
        <input name="telegramId" placeholder="Telegram ID (optional)" onChange={handleChange} />
        <br />
        <button type="submit">Register</button>
        <div className="login-option">
            <p>Already have an account?
              <div className="login-link" onClick={() => navigate("/login")}>Login instead</div>
            </p>
            
        </div>
        
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      
    </div>
    </div>
    

    
    
  );
};

export default Register;
