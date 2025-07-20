import { useEffect, useState } from "react";
import axios from "axios";
import "./Reminders.css";
import { useNavigate } from "react-router-dom";
const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  
  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/users/getReminder`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load reminders.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/users/deleteReminder?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete reminder:", err);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  if (loading) return <p>Loading reminders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="reminders-container">
      <h2>Your Reminders</h2>
      <h3 onClick={() => {navigate('/landing')}}>Back to landing page</h3>
      {reminders.length === 0 ? (
        <p>No reminders found.</p>
      ) : (
        <table className="reminder-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Dose</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Times/Day</th>
              <th>Cycle (Days)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((r) => (
              <tr key={r.id}>
                <td>{r.medicine}</td>
                <td>{r.dose}</td>
                <td>{r.startDate}</td>
                <td>{r.endDate}</td>
                <td>{r.timesPerCycle}</td>
                <td>{r.cycleDays}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(r.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Reminders;
