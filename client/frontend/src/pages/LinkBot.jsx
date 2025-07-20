// src/pages/LinkBot.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'
import './LinkBot.css'
function LinkBot() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchLinkCode = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/users/generateCode`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCode(res.data.code);
      } catch (err) {
        console.error("Failed to fetch link code:", err);
      }
    };

    fetchLinkCode();
  }, []);

  return (
    <div className='link-bot-container'>
      <h2>Link Your Telegram Bot</h2>
      <p>
        Start the bot: <a href="https://t.me/medi2003_bot" target="_blank" rel="noopener noreferrer">t.me/medibot</a>
      </p>
      {code ? (
        <>
          <p><strong>Step 1:</strong> Open the bot.</p>
          <p><strong>Step 2:</strong> Type the following command:</p>
          <code style={{ background: "#f1f1f1", padding: "0.5rem", display: "inline-block" }}>
            /link {code}
          </code>
        </>
      ) : (
        <p>Generating your unique link code...</p>
      )}
      <p className = "register-lin" onClick={() => {
        navigate('/landing')
      }}>
        Back to landing page
      </p>
    </div>
  );
}

export default LinkBot;
