import React, { useState, useEffect } from 'react';
import { Plus, Search, Wrench, Smartphone, Key, Info, Palette, User, DollarSign, Clock, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { ServiceOrder, Customer, Employee, Product } from '../types';

export default function Services({ currentUser }: { currentUser: Employee | null }) {
  const [services, setServices] = useState<ServiceOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [itemToAdd, setItemToAdd] = useState({ product_id: '', quantity: 1 });

  const [formData, setFormData] = useState({
    customer_id: '',
    device_model: '',
    device_password: '',
    device_state: '',
    device_color: '',
    description: '',
    employee_id: currentUser?.id || '',
    price: 0,
    cost: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch('/api/services').then(res => res.json()),
      fetch('/api/customers').then(res => res.json()),
      fetch('/api/employees').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ]).then(([s, c, e, p]) => {
      setServices(s);
      setCustomers(c);
      setEmployees(e);
      setProducts(p);
    });
  };

  const fetchServiceDetails = async (id: number) => {
    const res = await fetch(`/api/services/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedService(data);
      setIsDetailsModalOpen(true);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedService) return;
    const res = await fetch(`/api/services/${selectedService.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, employee_id: currentUser?.id || 1 })
    });
    if (res.ok) {
      fetchServiceDetails(selectedService.id);
      fetchData();
    }
  };

  const addServiceItem = async () => {
    if (!selectedService || !itemToAdd.product_id) return;
    const res = await fetch(`/api/services/${selectedService.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        product_id: parseInt(itemToAdd.product_id), 
        quantity: itemToAdd.quantity,
        employee_id: currentUser?.id || 1 
      })
    });
    if (res.ok) {
      setItemToAdd({ product_id: '', quantity: 1 });
      fetchServiceDetails(selectedService.id);
      fetchData();
    } else {
      const err = await res.json();
      alert(err.error || 'Erro ao adicionar item');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setFormData({
        customer_id: '',
        device_model: '',
        device_password: '',
        device_state: '',
        device_color: '',
        description: '',
        employee_id: currentUser?.id || '',
        price: 0,
        cost: 0
      });
      fetchData();
    }
  };

  const filteredServices = services.filter(s => 
    s.device_model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completo': return { label: 'COMPLETO', class: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 };
      case 'pendente': return { label: 'PENDENTE', class: 'bg-orange-100 text-orange-600', icon: Clock };
      case 'em_andamento': return { label: 'EM ANDAMENTO', class: 'bg-blue-100 text-blue-600', icon: Wrench };
      case 'cancelado': return { label: 'CANCELADO', class: 'bg-red-100 text-red-600', icon: AlertCircle };
      default: return { label: status.toUpperCase(), class: 'bg-neutral-100 text-neutral-600', icon: Info };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-neutral-500">Acompanhe e gerencie os consertos e manutenções.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nova OS
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por aparelho ou cliente..." 
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
                <th className="px-6 py-4 font-semibold">Aparelho / Cliente</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Técnico</th>
                <th className="px-6 py-4 font-semibold">Valor</th>
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredServices.map((service) => {
                const badge = getStatusBadge(service.status);
                return (
                  <tr key={service.id} className="hover:bg-neutral-50/80 transition-all duration-200 group cursor-pointer hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
                    <td className="px-6 py-4 transition-transform group-hover:translate-x-1" onClick={() => fetchServiceDetails(service.id)}>
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900">{service.device_model}</span>
                        <span className="text-xs text-neutral-500">{service.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={() => fetchServiceDetails(service.id)}>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${badge.class}`}>
                        <badge.icon size={12} />
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600" onClick={() => fetchServiceDetails(service.id)}>{service.employee_name}</td>
                    <td className="px-6 py-4 text-sm font-bold" onClick={() => fetchServiceDetails(service.id)}>R$ {(service.price || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-400" onClick={() => fetchServiceDetails(service.id)}>{new Date(service.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => fetchServiceDetails(service.id)}
                        className="text-primary text-sm font-semibold hover:underline"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova OS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-xl font-bold">Nova Ordem de Serviço</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> Cliente
                  </h4>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-700">Selecionar Cliente</label>
                    <select 
                      required
                      className="input-field"
                      value={formData.customer_id}
                      onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.cpf})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Device Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <Smartphone size={14} /> Aparelho
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700">Modelo</label>
                      <input 
                        type="text" required className="input-field"
                        value={formData.device_model}
                        onChange={(e) => setFormData({...formData, device_model: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700">Cor</label>
                      <input 
                        type="text" className="input-field"
                        value={formData.device_color}
                        onChange={(e) => setFormData({...formData, device_color: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700">Senha</label>
                      <input 
                        type="text" className="input-field"
                        value={formData.device_password}
                        onChange={(e) => setFormData({...formData, device_password: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700">Estado</label>
                      <input 
                        type="text" className="input-field" placeholder="Ex: Riscos, quebrado"
                        value={formData.device_state}
                        onChange={(e) => setFormData({...formData, device_state: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <Info size={14} /> Detalhes do Serviço
                  </h4>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-700">Descrição do Problema / Serviço</label>
                    <textarea 
                      required className="input-field h-24 resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                {/* Financial Section */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">Custo de Peças (R$)</label>
                    <input 
                      type="number" step="0.01" className="input-field"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">Preço ao Cliente (R$)</label>
                    <input 
                      type="number" step="0.01" className="input-field"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">Técnico Responsável</label>
                    <select 
                      required className="input-field"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-3">
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
                  Abrir Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes da OS */}
      {isDetailsModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">OS #{selectedService.id} - {selectedService.device_model}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedService.status).class}`}>
                    {getStatusBadge(selectedService.status).label}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">Cliente: {selectedService.customer_name} | {selectedService.customer_phone}</p>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna Esquerda: Informações e Status */}
              <div className="lg:col-span-2 space-y-8">
                <section className="space-y-4">
                  <h4 className="font-bold text-neutral-900 flex items-center gap-2 border-b pb-2">
                    <Info size={18} className="text-primary" /> Descrição do Serviço
                  </h4>
                  <div className="bg-neutral-50 p-4 rounded-xl text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {selectedService.description}
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="font-bold text-neutral-900 flex items-center gap-2 border-b pb-2">
                    <Clock size={18} className="text-orange-500" /> Alterar Status
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: 'pendente', label: 'Pendente', class: 'hover:bg-orange-50 hover:text-orange-600 border-orange-200' },
                      { id: 'em_andamento', label: 'Em Andamento', class: 'hover:bg-blue-50 hover:text-blue-600 border-blue-200' },
                      { id: 'completo', label: 'Completo', class: 'hover:bg-emerald-50 hover:text-emerald-600 border-emerald-200' },
                      { id: 'cancelado', label: 'Cancelado', class: 'hover:bg-red-50 hover:text-red-600 border-red-200' }
                    ].map(btn => (
                      <button
                        key={btn.id}
                        onClick={() => updateStatus(btn.id)}
                        className={`px-4 py-2 border rounded-xl text-sm font-bold transition-all ${
                          selectedService.status === btn.id 
                            ? btn.class.replace('hover:', '').replace('border-', 'bg-').replace('text-', 'text-white bg-') 
                            : `text-neutral-500 ${btn.class}`
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="font-bold text-neutral-900 flex items-center gap-2 border-b pb-2">
                    <Package size={18} className="text-blue-500" /> Itens Utilizados (Estoque)
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <select 
                        className="input-field flex-1"
                        value={itemToAdd.product_id}
                        onChange={(e) => setItemToAdd({...itemToAdd, product_id: e.target.value})}
                      >
                        <option value="">Adicionar peça do estoque...</option>
                        {products.filter(p => p.quantity > 0).map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.quantity} em estoque) - R$ {p.price.toFixed(2)}</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        min="1"
                        className="input-field w-20"
                        value={itemToAdd.quantity}
                        onChange={(e) => setItemToAdd({...itemToAdd, quantity: parseInt(e.target.value)})}
                      />
                      <button 
                        onClick={addServiceItem}
                        className="btn-primary px-4"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="bg-neutral-50 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-neutral-100 text-neutral-500 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-2 text-left">Item</th>
                            <th className="px-4 py-2 text-center">Qtd</th>
                            <th className="px-4 py-2 text-right">Preço Un.</th>
                            <th className="px-4 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {selectedService.items && selectedService.items.length > 0 ? selectedService.items.map(item => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 font-medium">{item.product_name}</td>
                              <td className="px-4 py-3 text-center">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-neutral-500">R$ {item.price_at_time.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-bold">R$ {(item.quantity * item.price_at_time).toFixed(2)}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-neutral-400 italic">Nenhum item adicionado a esta OS.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>

              {/* Coluna Direita: Resumo Financeiro e Aparelho */}
              <div className="space-y-6">
                <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-lg">
                  <h4 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-4">Resumo Financeiro</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-400">Preço Cobrado</span>
                      <span className="text-xl font-bold">R$ {selectedService.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-400">Custo Total</span>
                      <span className="text-lg text-red-400 font-semibold">R$ {selectedService.cost.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-400 font-bold">Lucro</span>
                      <span className="text-2xl text-emerald-400 font-black">R$ {(selectedService.price - selectedService.cost).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Dados do Aparelho</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500 text-[10px] uppercase font-bold">Senha</p>
                      <p className="font-mono font-bold">{selectedService.device_password || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-[10px] uppercase font-bold">Cor</p>
                      <p className="font-bold">{selectedService.device_color || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-neutral-500 text-[10px] uppercase font-bold">Estado de Entrada</p>
                      <p className="font-medium text-neutral-600 italic">"{selectedService.device_state || 'Sem observações'}"</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Técnico Responsável</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {selectedService.employee_name?.charAt(0)}
                    </div>
                    <p className="font-bold text-blue-900">{selectedService.employee_name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
