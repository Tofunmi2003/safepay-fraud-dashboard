import { useState } from 'react';
import { Send, Globe, MapPin, DollarSign, User } from 'lucide-react';

const TransactionForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        customer: '',
        amount: '',
        location: '',
        is_international: 0
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ customer: '', amount: '', location: '', is_international: 0 });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" />
                New Transaction
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Customer</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                            placeholder="Store Name"
                            value={formData.customer}
                            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Amount</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                            type="number"
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                            placeholder="City, Country"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                        type="checkbox"
                        id="international"
                        className="w-4 h-4 text-blue-600 rounded bg-gray-100 border-gray-300 focus:ring-blue-500"
                        checked={formData.is_international === 1}
                        onChange={(e) => setFormData({ ...formData, is_international: e.target.checked ? 1 : 0 })}
                    />
                    <label htmlFor="international" className="text-sm font-medium text-slate-600 flex items-center gap-2 cursor-pointer select-none">
                        <Globe className="w-4 h-4" />
                        International
                    </label>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95"
                >
                    Process
                </button>
            </form>
        </div>
    );
};

export default TransactionForm;
