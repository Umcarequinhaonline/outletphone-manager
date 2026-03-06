import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Wrench, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ServiceOrder, Activity, Employee } from '../types';

export default function Dashboard({ onNavigate, currentUser }: { onNavigate: (tab: string) => void, currentUser: Employee | null }) {
  const [stats, setStats] = useState({ revenue: 0, profit: 0, services: 0, customers: 0 });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [recentServices, setRecentServices] = useState<ServiceOrder[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/reports/financial').then(res => res.json()),
      fetch('/api/services').then(res => res.json()),
      fetch('/api/customers').then(res => res.json()),
      fetch('/api/activities').then(res => res.json())
    ]).then(([financial, services, customers, activities]) => {
      setStats({
        revenue: financial.total_revenue || 0,
        profit: financial.total_profit || 0,
        services: services.length,
        customers: customers.length
      });
      setRecentServices(services.slice(0, 5));
      setRecentActivities(activities.slice(0, 5));
    });
  }, []);

  const cards = [
    { id: 'reports', label: 'Receita Total', value: `R$ ${(stats.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'reports', label: 'Lucro Estimado', value: `R$ ${(stats.profit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'services', label: 'Serviços', value: stats.services, icon: Wrench, color: 'text-primary', bg: 'bg-orange-50' },
    { id: 'customers', label: 'Clientes', value: stats.customers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {currentUser?.name || 'Usuário'}</h1>
        <p className="text-neutral-500 mt-1">Aqui está o que está acontecendo na sua assistência hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div 
            key={i} 
            onClick={() => onNavigate(card.id)}
            className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Ver Detalhes</span>
            </div>
            <p className="text-neutral-500 text-sm font-medium">{card.label}</p>
            <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Services */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold text-lg">Serviços Recentes</h3>
            <button 
              onClick={() => onNavigate('services')}
              className="text-primary text-sm font-semibold hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentServices.length > 0 ? recentServices.map((service) => (
              <div key={service.id} className="p-4 flex items-center gap-4 hover:bg-neutral-50 hover:shadow-inner transition-all duration-200 cursor-pointer group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                  service.status === 'completo' ? 'bg-emerald-100 text-emerald-600' : 
                  service.status === 'pendente' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {service.status === 'completo' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{service.device_model}</p>
                  <p className="text-sm text-neutral-500">{service.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">R$ {(service.price || 0).toFixed(2)}</p>
                  <p className="text-xs text-neutral-400 capitalize">{service.status.replace('_', ' ')}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-neutral-400">Nenhum serviço registrado.</div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h3 className="font-bold text-lg">Atividades do Sistema</h3>
          </div>
          <div className="p-6 space-y-6">
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-4 relative">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    <span className="font-bold">{activity.employee_name}</span> {activity.action.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">{activity.details}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <div className="text-center text-neutral-400">Nenhuma atividade recente.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
