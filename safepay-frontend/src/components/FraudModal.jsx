import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle, ShieldAlert } from 'lucide-react';

const FraudModal = ({ alert, onClose }) => {
    if (!alert) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                >
                    <div className="bg-red-500 p-6 text-white text-center">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                            className="inline-block mb-2"
                        >
                            <ShieldAlert size={48} />
                        </motion.div>
                        <h2 className="text-2xl font-bold">Fraud Detected!</h2>
                        <p className="text-red-100 opacity-90">High-value international transaction flagged.</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Customer</span>
                                <span className="font-semibold text-slate-800">{alert.customer}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Amount</span>
                                <span className="font-bold text-red-600">${alert.amount}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Location</span>
                                <span className="font-semibold text-slate-800">{alert.location}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Risk Factor</span>
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">INTERNATIONAL</span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            <CheckCircle size={20} />
                            Acknowledge & Clear
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FraudModal;
