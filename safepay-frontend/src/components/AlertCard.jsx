import { AlertTriangle, Trash2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const AlertCard = ({ alert, onDelete }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white border-l-4 border-red-500 rounded-r-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-shadow"
        >
            <div className="flex items-start gap-4">
                <div className="bg-red-100 p-2 rounded-full text-red-500 mt-1">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">{alert.customer}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                        <span className="flex items-center gap-1">
                            <MapPin size={14} /> {alert.location}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="font-mono text-slate-700 font-semibold">${alert.amount}</span>
                    </div>
                    <p className="text-xs text-red-500 font-semibold mt-2 uppercase tracking-wide">High Risk Transaction</p>
                </div>
            </div>

            <button
                onClick={() => onDelete(alert.id)}
                className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                title="Resolve Alert"
            >
                <Trash2 size={20} />
            </button>
        </motion.div>
    );
};

export default AlertCard;
