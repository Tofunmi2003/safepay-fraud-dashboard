import { ShieldCheck, LayoutDashboard, CreditCard, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="w-full md:w-64 bg-slate-900 text-white min-h-0 md:min-h-screen p-6 flex flex-col shadow-xl">
            <div className="flex items-center gap-3 mb-10">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
                <h1 className="text-2xl font-bold tracking-tight">SafePay</h1>
            </div>

            <nav className="flex-1 space-y-2 mt-4 md:mt-0">
                <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                <NavItem icon={<CreditCard size={20} />} label="Transactions" />
                <NavItem icon={<Settings size={20} />} label="Settings" />
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-800">
                <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full p-2 rounded-lg hover:bg-slate-800">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

const NavItem = ({ icon, label, active }) => (
    <button
        className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 justify-start
      ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
    >
        {icon}
        <span className="font-medium text-sm md:text-base">{label}</span>
    </button>
);

export default Sidebar;
