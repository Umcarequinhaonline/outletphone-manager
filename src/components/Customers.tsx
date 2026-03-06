import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, MapPin, Mail, CreditCard, Edit2, History } from 'lucide-react';
import { Customer } from '../types';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    address: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers);
  };

  const handleCpfCheck = async (cpf: string) => {
    if (cpf.length < 11) return;
    const res = await fetch(`/api/customers/check/${cpf}`);
    const existing = await res.json();
    if (existing) {
      setEditingCustomer(existing);
      setFormData({
        name: existing.name,
        cpf: existing.cpf,
        phone: existing.phone,
        email: existing.email,
        address: existing.address
      });
      setError('CPF já cadastrado. Editando registro existente.');
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
    const method = editingCustomer ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData({ name: '', cpf: '', phone: '', email: '', address: '' });
      fetchCustomers();
    } else {
      const data = await res.json();
      setError(data.error || 'Erro ao salvar cliente');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-neutral-500">Gerencie sua base de clientes e contatos.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCustomer(null);
            setFormData({ name: '', cpf: '', phone: '', email: '', address: '' });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">CPF</th>
                <th className="px-6 py-4 font-semibold">Contato</th>
                <th className="px-6 py-4 font-semibold">Endereço</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-neutral-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-medium text-neutral-900">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 font-mono">{customer.cpf}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Phone size={12} /> {customer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Mail size={12} /> {customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 truncate max-w-[200px]">{customer.address}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setEditingCustomer(customer);
                        setFormData({
                          name: customer.name,
                          cpf: customer.cpf,
                          phone: customer.phone,
                          email: customer.email,
                          address: customer.address
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg text-sm flex items-center gap-2">
                  <CreditCard size={16} /> {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">CPF (apenas números)</label>
                <input 
                  type="text" 
                  required
                  disabled={!!editingCustomer}
                  className="input-field disabled:bg-neutral-100"
                  value={formData.cpf}
                  onChange={(e) => {
                    setFormData({...formData, cpf: e.target.value});
                    if (e.target.value.length >= 11) handleCpfCheck(e.target.value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Telefone</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">E-mail</label>
                  <input 
                    type="email" 
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Endereço</label>
                <textarea 
                  className="input-field h-24 resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
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
                  {editingCustomer ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
