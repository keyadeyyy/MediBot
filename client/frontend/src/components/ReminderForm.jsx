import { useState, useEffect } from 'react'
import './ReminderForm.css'
import axios from "axios";


const ReminderForm = ({ medicine }) => {
  const [dose, setDose] = useState("")
  const [timesPerInterval, setTimesPerInterval] = useState(1)
  const [interval, setInterval] = useState(1)
  const [duration, setDuration] = useState(1)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [warning, setWarning] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    if (!startTime) {
      setWarning("")
      return
    }

    const now = new Date()
    const [hours, minutes] = startTime.split(":").map(Number)
    const selectedTime = new Date()
    selectedTime.setHours(hours)
    selectedTime.setMinutes(minutes)
    selectedTime.setSeconds(0)
    selectedTime.setMilliseconds(0)

    if (selectedTime < now) {
      setWarning("You picked a past time. Reminder might skip one or more doses for the day.")
    } else {
      setWarning("")
    }
  }, [startTime])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!dose || !startTime) {
      setError("Please fill in all required fields.")
      return
    }

    if (duration > 100) {
      setError("Duration cannot exceed 100 days.")
      return
    }
    const reminderDetails = {
      medicine,
      dose,
      timesPerInterval,
      interval,
      duration,
      startTime,
      endTime
    }
     //Send to backend
    const token = localStorage.getItem("token"); // or sessionStorage
      try {
      const res = await axios.post(`${API_BASE_URL}/users/createReminder`, reminderDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      setSuccessMessage("✅ Reminder created successfully!");
      console.log("Reminder saved:", res.data);
    } catch (error) {
       const errorData = error.response?.data || error.message || "Unknown error";
      const errorMsg = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);

      setSuccessMessage("❌ Failed to create reminder - " + errorMsg);
      console.error("Failed to save reminder:", errorMsg);
          }

   
  }

  return (
    <form onSubmit={handleSubmit} className="reminder-form">
      <h2 className="form-title">Create Reminder</h2>

      {error && <p className="error-text">{error}</p>}
     
      <div className="form-group">
        <label>Medicine</label>
        <input type="text" value={medicine} readOnly />
      </div>

      <div className="form-group">
        <label>Dose (e.g., 1 tab, 1/2 tab, 20ml)</label>
        <input
          type="text"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          placeholder="e.g., 1 tab"
        />
      </div>

      <div className="form-group">
        <label>How Often?</label>
        <div className="frequency-row">
          <span>Take</span>
          <select
            value={timesPerInterval}
            onChange={(e) => setTimesPerInterval(Number(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span>times every</span>
          <select
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span>day(s)</span>
        </div>
      </div>

      <div className="form-group">
        <label>Start Time</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        {warning && <p className="warning-text">{warning}</p>}
      </div>
            
    <div className="form-group">
        <label>End Time</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Duration (days)</label>
        <input
          type="number"
          min="1"
          max="100"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>

      <button type="submit" className="submit-btn">
        Save Reminder
      </button>
       {successMessage && (
        <p className="text-green-600 mt-2">{successMessage}</p>
      )}
    </form>
  )
}

export default ReminderForm
