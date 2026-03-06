import React, { useState, useEffect } from 'react';
import { Plus, Search, UserCircle, Shield, Mail, Key, Trash2, Edit2 } from 'lucide-react';
import { Employee } from '../types';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'tecnico' as 'administrador' | 'tecnico' | 'vendedor',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(setEmployees);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setFormData({ name: '', role: 'tecnico', email: '', password: '' });
      fetchEmployees();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funcionários </h1>
          <p className="text-neutral-500">Gerencie sua equipe e níveis de acesso.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Funcionário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-primary font-bold text-xl">
                {emp.name.charAt(0)}
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                emp.role === 'administrador' ? 'bg-red-100 text-red-600' : 
                emp.role === 'tecnico' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {emp.role}
              </span>
            </div>
            <h3 className="font-bold text-lg text-neutral-900">{emp.name}</h3>
            <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
              <Mail size={14} /> {emp.email}
            </p>
            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-400">Desde {new Date(emp.created_at).toLocaleDateString()}</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-neutral-400 hover:text-primary transition-colors"><Edit2 size={16} /></button>
                <button className="p-2 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-xl font-bold">Novo Funcionário</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Nome Completo</label>
                <input 
                  type="text" required className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Cargo / Nível de Acesso</label>
                <select 
                  className="input-field"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                >
                  <option value="administrador">Administrador</option>
                  <option value="tecnico">Técnico</option>
                  <option value="vendedor">Vendedor / Atendimento</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">E-mail</label>
                <input 
                  type="email" required className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Senha Temporária</label>
                <input 
                  type="password" required className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
