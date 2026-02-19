import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatsCard from './components/StatsCard';
import TransactionForm from './components/TransactionForm';
import AlertCard from './components/AlertCard';
import FraudModal from './components/FraudModal';
import { Bell, Search, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);

  // Fetch Alerts
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
  const handleTransactionSubmit = async (formData) => {
    try {
      await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Fraud Logic
      if (parseFloat(formData.amount) > 250 && formData.is_international === 1) {
        setCurrentAlert(formData);
        setShowModal(true);
      }

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
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:ml-0 transition-all w-full">

        {/* Top Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
            <p className="text-slate-500">Overview of recent transactions and fraud alerts.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all hover:w-72"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            </div>
            <button className="p-2 relative bg-white rounded-full text-slate-500 hover:text-blue-600 shadow-sm border border-slate-100">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Alerts" value={alerts.length} icon={AlertTriangle} color="bg-red-500" />
          <StatsCard title="Transactions" value="1,204" icon={Activity} color="bg-blue-500" />
          <StatsCard title="System Status" value="Online" icon={ShieldCheck} color="bg-green-500" />
          <StatsCard title="Pending Review" value="5" icon={Bell} color="bg-yellow-500" />
        </div>

        {/* Transaction Input */}
        <TransactionForm onSubmit={handleTransactionSubmit} />

        {/* Alerts Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Recent Alerts</h3>
            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Live Feed
            </span>
          </div>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400"
              >
                <ShieldCheck size={48} className="mb-2 text-green-500 opacity-50" />
                <p className="text-lg">All clean! No fraud detected.</p>
              </motion.div>
            ) : (
              alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onDelete={deleteAlert} />
              ))
            )}
          </div>
        </section>

      </main>

      {/* Fraud Modal */}
      {showModal && (
        <FraudModal
          alert={currentAlert}
          onClose={() => setShowModal(false)}
        />
      )}

    </div>
  );
}

export default App;