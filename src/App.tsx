import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Package, 
  Wrench, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Menu,
  X,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, Employee, Product, ServiceOrder, Activity } from './types';

// Components
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Employees from './components/Employees';
import Inventory from './components/Inventory';
import Services from './components/Services';
import Reports from './components/Reports';
import Sales from './components/Sales';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<Employee | null>(null);

  // Mock login for now - in a real app we'd have a login screen
  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          // Try to find an admin for full access in this demo
          const admin = data.find((e: Employee) => e.role === 'administrador');
          setUser(admin || data[0]);
        }
      });
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Serviços', icon: Wrench },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'employees', label: 'Funcionários', icon: UserCircle, adminOnly: true },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} currentUser={user} />;
      case 'services': return <Services currentUser={user} />;
      case 'sales': return <Sales currentUser={user} />;
      case 'customers': return <Customers />;
      case 'inventory': return <Inventory />;
      case 'employees': return <Employees />;
      case 'reports': return <Reports />;
      default: return <Dashboard onNavigate={setActiveTab} currentUser={user} />;
    }
  };

  if (!user) return <div className="h-screen w-screen flex items-center justify-center bg-neutral-900 text-white">Carregando...</div>;

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-neutral-900 text-white flex flex-col transition-all duration-300 relative z-20"
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div 
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-xl">O</div>
                <span className="font-bold text-xl tracking-tight">OUTLET<span className="text-primary">PHONE</span></span>
              </motion.div>
            ) : (
              <motion.div 
                key="logo-mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-xl mx-auto"
              >
                O
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            if (item.adminOnly && user.role !== 'administrador') return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-primary transition-colors'} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                {isActive && isSidebarOpen && (
                  <motion.div layoutId="active-pill" className="ml-auto">
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-neutral-800/50 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-primary font-bold">
              {user.name.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
              </div>
            )}
          </div>
          <button className={`w-full flex items-center gap-4 p-3 mt-2 rounded-xl text-neutral-400 hover:bg-red-500/10 hover:text-red-500 transition-all ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="pl-10 pr-4 py-2 bg-neutral-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64 transition-all"
              />
            </div>
            <div className="w-px h-6 bg-neutral-200 mx-2" />
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
              <Clock size={16} className="text-primary" />
              {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
