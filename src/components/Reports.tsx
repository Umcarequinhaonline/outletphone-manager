import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Download, 
  Calendar, 
  Package, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Layers,
  Users,
  Activity,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Reports() {
  const [financial, setFinancial] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [sales, setSales] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<'financial' | 'inventory' | 'sales' | 'team'>('financial');

  useEffect(() => {
    Promise.all([
      fetch('/api/reports/financial').then(res => res.json()),
      fetch('/api/reports/inventory').then(res => res.json()),
      fetch('/api/reports/sales').then(res => res.json()),
      fetch('/api/reports/team').then(res => res.json())
    ]).then(([f, i, s, t]) => {
      setFinancial(f);
      setInventory(i);
      setSales(s);
      setTeam(t);
    });
  }, []);

  if (!financial || !inventory || !sales) return <div className="p-8 text-center text-neutral-400">Carregando relatórios...</div>;

  const reportTabs = [
    { id: 'financial', label: 'Financeiro', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'inventory', label: 'Estoque', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'team', label: 'Equipe', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-neutral-900">INTELIGÊNCIA DE NEGÓCIO</h1>
          <p className="text-neutral-500 font-medium">Dados consolidados e análise de performance em tempo real.</p>
        </div>
        <div className="flex bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200 shadow-inner">
          {reportTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeReport === tab.id 
                  ? `bg-white ${tab.color} shadow-sm border border-neutral-200` 
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeReport}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {activeReport === 'financial' && (
            <>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <DollarSign size={80} />
                </div>
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Receita Bruta</p>
                <h3 className="text-3xl font-black text-neutral-900">R$ {(financial.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-4">
                  <ArrowUpRight size={14} /> +12.5% <span className="text-neutral-400 font-medium ml-1">vs mês anterior</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ArrowDownRight size={80} />
                </div>
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Custos Operacionais</p>
                <h3 className="text-3xl font-black text-red-600">R$ {(financial.total_cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <div className="flex items-center gap-1 text-red-400 text-xs font-bold mt-4">
                  <ArrowDownRight size={14} /> +3.2% <span className="text-neutral-400 font-medium ml-1">inflação de peças</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp size={80} />
                </div>
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Lucro Líquido</p>
                <h3 className="text-3xl font-black text-emerald-600">R$ {(financial.total_profit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Activity size={80} />
                </div>
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">aumento de lucro </p>
                <h3 className="text-3xl font-black text-blue-600">R$ {(financial.ticket_medio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <p className="text-[10px] text-neutral-400 mt-4 font-bold uppercase tracking-widest">Baseado em {financial.total_services} OS</p>
              </div>
            </>
          )}

          {activeReport === 'inventory' && (
            <>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">categorias de produtos</p>
                <h3 className="text-3xl font-black text-blue-600">{inventory.total_products || 0}</h3>
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-neutral-100 border-2 border-white" />)}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Novos itens este mês</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Unidades Totais</p>
                <h3 className="text-3xl font-black text-neutral-900">{inventory.total_items || 0}</h3>
                <div className="flex items-center gap-1 text-orange-500 text-xs font-bold mt-4">
                  <ArrowDownRight size={14} /> 12 itens <span className="text-neutral-400 font-medium ml-1">abaixo do estoque crítico</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Patrimônio em Estoque</p>
                <h3 className="text-3xl font-black text-emerald-600">R$ {(inventory.total_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <p className="text-[10px] text-neutral-400 mt-4 font-bold uppercase tracking-widest">Preço de revenda estimado</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Giro de Peças</p>
                <h3 className="text-3xl font-black text-orange-600">8.2x</h3>
                <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </>
          )}

          {activeReport === 'sales' && (
            <>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Vendas Diretas</p>
                <h3 className="text-3xl font-black text-purple-600">{sales.total_sales || 0}</h3>
                <p className="text-[10px] text-neutral-400 mt-4 font-bold uppercase tracking-widest">Acessórios e periféricos</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Volume de Itens</p>
                <h3 className="text-3xl font-black text-neutral-900">{sales.total_items_sold || 0}</h3>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-4">
                  <ArrowUpRight size={14} /> +24% <span className="text-neutral-400 font-medium ml-1">vs média trimestral</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Faturamento Vendas</p>
                <h3 className="text-3xl font-black text-emerald-600">R$ {(sales.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Conversão de Balcão</p>
                <h3 className="text-3xl font-black text-blue-600">32%</h3>
                <p className="text-[10px] text-neutral-400 mt-4 font-bold uppercase tracking-widest">Visitantes que compram</p>
              </div>
            </>
          )}

          {activeReport === 'team' && (
            <>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Técnicos Ativos</p>
                <h3 className="text-3xl font-black text-orange-600">{team.length}</h3>
                <p className="text-[10px] text-neutral-400 mt-4 font-bold uppercase tracking-widest">Equipe técnica</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total de OS</p>
                <h3 className="text-3xl font-black text-neutral-900">{team.reduce((acc, curr) => acc + curr.total_services, 0)}</h3>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-4">
                  <ArrowUpRight size={14} /> +15% <span className="text-neutral-400 font-medium ml-1">produtividade</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Receita Técnica</p>
                <h3 className="text-3xl font-black text-emerald-600">R$ {team.reduce((acc, curr) => acc + (curr.total_revenue || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">sumento da produtividade da Equipe</p>
                <h3 className="text-3xl font-black text-blue-600">R$ {(team.reduce((acc, curr) => acc + (curr.avg_ticket || 0), 0) / (team.length || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <p className="text-[10px] text-neutral-400 mt-4 font-bold uppercase tracking-widest">Média por técnico</p>
              </div>

              <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm mt-4">
                <h3 className="font-black text-xl mb-6 flex items-center gap-3 uppercase tracking-tighter">
                  <Users size={24} className="text-orange-500" /> Ranking de Produtividade
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {team.map((member, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center font-black text-primary">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-neutral-900 uppercase text-sm">{member.name}</h4>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{member.role}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500 font-medium">Serviços:</span>
                          <span className="font-black text-neutral-900">{member.total_services}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500 font-medium">Faturamento:</span>
                          <span className="font-black text-emerald-600">R$ {(member.total_revenue || 0).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="h-1.5 bg-white rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500" 
                            style={{ width: `${Math.min(100, (member.total_services / 15) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-black text-xl flex items-center gap-3">
                <TrendingUp size={24} className="text-primary" /> FLUXO DE CAIXA ANUAL
              </h3>
              <p className="text-neutral-400 text-sm font-medium mt-1">Comparativo de faturamento mensal consolidado.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-neutral-100" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Meta</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 flex items-end gap-3">
            {[40, 65, 45, 90, 55, 75, 85, 60, 95, 70, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full relative flex items-end justify-center h-full">
                  {/* Meta line background */}
                  <div className="absolute bottom-0 w-full bg-neutral-50 rounded-2xl h-[80%]" />
                  
                  {/* Actual value bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                    className="w-full bg-neutral-900 group-hover:bg-primary transition-all rounded-2xl relative z-10"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap shadow-xl">
                      R$ {(h * 150).toLocaleString('pt-BR')}
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] text-neutral-400 font-black uppercase tracking-tighter">
                  {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-neutral-200 shadow-sm">
            <h3 className="font-black text-xl mb-8 flex items-center gap-3">
              <PieChart size={24} className="text-blue-500" /> MIX DE SERVIÇOS
            </h3>
            <div className="space-y-8">
              {[
                { label: 'Troca de Tela', value: 45, color: 'bg-blue-500', icon: Layers },
                { label: 'Baterias', value: 30, color: 'bg-emerald-500', icon: Activity },
                { label: 'Reparo de Placa', value: 15, color: 'bg-orange-500', icon: Briefcase },
                { label: 'Outros', value: 10, color: 'bg-neutral-400', icon: CheckCircle2 }
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${item.color} bg-opacity-10`}>
                        <item.icon size={14} className={item.color.replace('bg-', 'text-')} />
                      </div>
                      <span className="text-sm font-black text-neutral-700 uppercase tracking-tight">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-neutral-400">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-neutral-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ delay: 0.5 + (i * 0.1), duration: 0.8 }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <Download size={120} className="text-white" />
            </div>
            <div className="relative z-10">
              <h4 className="text-white font-black text-xl mb-2">RELATÓRIO EXECUTIVO</h4>
              <p className="text-neutral-400 text-sm font-medium mb-8">Baixe a análise completa em PDF para reuniões de diretoria.</p>
              <button className="w-full bg-primary hover:bg-white text-neutral-900 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
                <Download size={18} />
                Gerar PDF Completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
