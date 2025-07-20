// landing.jsx
import { useEffect, useState } from 'react'
import './Landing.css'
import { Navigate, useNavigate } from 'react-router-dom'
import axios from "axios";
import ReminderForm from '../components/ReminderForm';



const Landing = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('')
  const [id, setId] = useState('')
  const [query, setQuery] = useState("");
  const [medicine, setMedicine] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    const storedName = localStorage.getItem('name')
    if (storedName) {
      setName(storedName)
    }

    const storedId = localStorage.getItem('id')
    if(storedId) {
      setId(storedId)
    }
  }, [])
  const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  );
};

  const handleSearch = async () => {
    try {
      setError("");
      setMedicine(null);
      const token = localStorage.getItem("token"); // Or sessionStorage, depending on where you stored it
      setLoading(true); 
      const res = await axios.get(`${API_BASE_URL}/users/getMedicine?q=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMedicine(res.data); // assuming backend returns { name, description, etc. }
    } catch (err) {
      setError(err.response?.data?.error || "Medicine not found");
    }
    finally{
      setLoading(false)
    }
  };

  return (

    <div className="landing-container">
      <h1 className="landing-heading">Welcome to MediBot</h1>
      {name && <h2 className="landing-subheading">Hello, {name}! 👋</h2>}
      <p>
        <div className="tele-bot-link" onClick={() => navigate('/link-bot')}>
          Link Telegram Bot
        </div>
       </p> <p>
         <div className="tele-bot-link" onClick={() => navigate('/view-reminders')}>
          View reminders
        </div>
      </p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter medicine name"
        className="search-input"
      />

      <button onClick={handleSearch} className="search-button">
        Search
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {showForm && <ReminderForm medicine={medicine.generic_name}/>}
      {medicine && (
        <div className="medicine-result">
          <h2 className="found">Medicine found! </h2>
          <div className='reminder' onClick={() => setShowForm(true)}> Create reminder</div>
          <div className="info grid gap-4">
            <div className="info-box">
              <InfoRow label="Generic Name" value={medicine.generic_name} />
            </div>
            <div className="info-box">
              <InfoRow label="Active Ingredient" value={medicine.active_ingredient} />
            </div>
            <div className="info-box">
              <InfoRow label="Purpose" value={medicine.purpose} />
            </div>
            <div className="info-box">
              <InfoRow label="Indications" value={medicine.indications} />
            </div>
            <div className="info-box">
              <InfoRow label="Dosage & Administration" value={medicine.dosage} />
            </div>
            <div className="info-box">
              <InfoRow label="Warnings" value={medicine.warnings} />
            </div>
          </div>
        </div>
      )}
    </div>
);

}

export default Landing
