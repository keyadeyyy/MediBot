import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const container = document.getElementById("telegram-login-button");

    if (container) {
      container.innerHTML = ""; // Clear any existing button

      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?7";
      script.async = true;
      script.setAttribute("data-telegram-login", import.meta.env.VITE_TELEGRAM_BOT_USERNAME);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-userpic", "false");
      script.setAttribute("data-request-access", "write");
      script.setAttribute("data-onauth", "handleTelegramAuth");

      container.appendChild(script);
    }

    // Make window.handleTelegramAuth available globally
    window.handleTelegramAuth = async (user) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/users/telegramLogin`, user);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("name", response.data.user.name);
        localStorage.setItem("id", response.data.user.id);

        navigate("/landing");
      } catch (err) {
        console.error("Telegram login failed:", err);
        setError("Telegram login failed.");
      }
    };

    return () => {
      if (window.handleTelegramAuth) {
        delete window.handleTelegramAuth;
      }
    };
  }, []);

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

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("id", response.data.id);

      navigate("/landing");
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
            <p>Don't have an account?
              <div className="register-link" onClick={() => navigate("/register")}>Register instead</div>
            </p>
          </div>

          <p style={{ textAlign: "center", marginTop: "1rem" }}>OR</p>
          <div id="telegram-login-button" style={{ display: "flex", justifyContent: "center" }}></div>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
