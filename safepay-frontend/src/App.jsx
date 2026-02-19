

import { useState, useEffect } from 'react';
import './App.css';

// 1. MODAL COMPONENT (Defined outside main App)
const Modal = ({ alert, onClose }) => {
  if (!alert) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>⚠️ FRAUD DETECTED!</h2>
        <hr />
        <p><strong>Customer:</strong> {alert.customer}</p>
        <p><strong>Amount:</strong> ${alert.amount}</p>
        <p><strong>Location:</strong> {alert.location}</p>
        <p><strong>Risk:</strong> High-Value International Transaction</p>
        <button onClick={onClose} className="close-modal-btn">Acknowledge & Clear</button>
      </div>
    </div>
  );
};

function App() {
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    amount: '',
    location: '',
    is_international: 0
  });

  // Fetch Alerts from Backend
  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/fraudAlert');
      const data = await response.json();
      setAlerts(data.alerts || data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Logic: Trigger Pop-up if it meets Fraud Criteria
      if (parseFloat(formData.amount) > 250 && formData.is_international === 1) {
        setCurrentAlert(formData);
        setShowModal(true);
      }

      // Reset form and refresh list
      setFormData({ customer: '', amount: '', location: '', is_international: 0 });
      fetchAlerts();
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  // Delete Alert
  const deleteAlert = async (id) => {
    if (window.confirm("Are you sure you want to resolve this alert?")) {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'DELETE'
      });
      fetchAlerts();
    }
  };

  return (
    <div className="App">
      {/* POPUP MODAL */}
      {showModal && <Modal alert={currentAlert} onClose={() => setShowModal(false)} />}

      <h1>🛡️ SafePay Fraud Dashboard</h1>

      {/* MODERN FORM */}
      <form onSubmit={handleSubmit} className="transaction-form">
        <input 
          placeholder="Customer Name" 
          value={formData.customer}
          onChange={(e) => setFormData({...formData, customer: e.target.value})}
          required 
        />
        <input 
          type="number" 
          placeholder="Amount ($)" 
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          required 
        />
        <input 
          placeholder="Location" 
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          required 
        />
        <div className="checkbox-group">
          <span>International?</span>
          <input 
            type="checkbox" 
            checked={formData.is_international === 1}
            onChange={(e) => setFormData({...formData, is_international: e.target.checked ? 1 : 0})}
          />
        </div>
        <button type="submit">Process Payment</button>
      </form>

      {/* DASHBOARD CARDS */}
      <div className="dashboard">
        {alerts.length === 0 ? (
          <p>No fraud detected. Stay safe!</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="alert-card">
              <div className="card-header">
                <h3>🚩 Fraud Alert: {alert.customer}</h3>
                <button className="delete-btn" onClick={() => deleteAlert(alert.id)}>×</button>
              </div>
              <p>Detected in <strong>{alert.location}</strong> | Amount: <strong>${alert.amount}</strong></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;