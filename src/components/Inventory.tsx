import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Tag, Hash, DollarSign, Layers, Edit2, ArrowUpRight, ArrowDownRight, History, Clock } from 'lucide-react';
import { Product, StockMovement } from '../types';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    model: '',
    description: '',
    price: 0,
    quantity: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  };

  const fetchMovements = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}/movements`);
    if (res.ok) {
      const data = await res.json();
      setMovements(data);
      setSelectedProduct(product);
      setIsHistoryModalOpen(true);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      model: product.model || '',
      description: product.description || '',
      price: product.price,
      quantity: product.quantity
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `/api/products/${selectedProduct?.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setIsEditing(false);
      setSelectedProduct(null);
      setFormData({ code: '', name: '', model: '', description: '', price: 0, quantity: 0 });
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estoque & Produtos</h1>
          <p className="text-neutral-500">Controle de peças, acessórios e produtos à venda.</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setFormData({ code: '', name: '', model: '', description: '', price: 0, quantity: 0 });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Package size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">Total de Itens</span>
          </div>
          <h3 className="text-2xl font-bold">{products.reduce((acc, p) => acc + p.quantity, 0)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <DollarSign size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">Valor em Estoque</span>
          </div>
          <h3 className="text-2xl font-bold">R$ {products.reduce((acc, p) => acc + (p.price * p.quantity), 0).toFixed(2)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <Layers size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">Categorias</span>
          </div>
          <h3 className="text-2xl font-bold">{new Set(products.map(p => p.model)).size}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou código..." 
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
                <th className="px-6 py-4 font-semibold">Produto</th>
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Modelo</th>
                <th className="px-6 py-4 font-semibold">Preço</th>
                <th className="px-6 py-4 font-semibold">Qtd.</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50/80 transition-all duration-200 group cursor-pointer hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
                  <td className="px-6 py-4 transition-transform group-hover:translate-x-1" onClick={() => fetchMovements(product)}>
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-900">{product.name}</span>
                      <span className="text-xs text-neutral-400 truncate max-w-[200px]">{product.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-neutral-600" onClick={() => fetchMovements(product)}>{product.code}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500" onClick={() => fetchMovements(product)}>{product.model}</td>
                  <td className="px-6 py-4 text-sm font-bold" onClick={() => fetchMovements(product)}>R$ {product.price.toFixed(2)}</td>
                  <td className="px-6 py-4" onClick={() => fetchMovements(product)}>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      product.quantity < 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {product.quantity} un
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => fetchMovements(product)}
                        className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Histórico de Movimentações"
                      >
                        <History size={18} />
                      </button>
                      <button 
                        onClick={async () => {
                          const qty = prompt('Quantidade para repor:');
                          if (qty) {
                            const res = await fetch('/api/products/restock', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ product_id: product.id, quantity: parseInt(qty), employee_id: 1 })
                            });
                            if (res.ok) fetchProducts();
                            else alert('Erro na reposição');
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
                        title="Repor Estoque"
                      >
                        <ArrowUpRight size={14} /> Repor
                      </button>
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo/Editar Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-xl font-bold">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Código de Identificação</label>
                  <input 
                    type="text" 
                    required
                    className="input-field"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Modelo</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Nome do Produto</label>
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
                  <label className="text-sm font-semibold text-neutral-700">Preço de Venda (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="input-field"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Quantidade</label>
                  <input 
                    type="number" 
                    required
                    className="input-field"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Descrição</label>
                <textarea 
                  className="input-field h-24 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histórico de Movimentações */}
      {isHistoryModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div>
                <h3 className="text-xl font-bold">Histórico: {selectedProduct.name}</h3>
                <p className="text-sm text-neutral-500">Código: {selectedProduct.code} | Modelo: {selectedProduct.model}</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Data</th>
                    <th className="px-6 py-3 font-semibold">Tipo</th>
                    <th className="px-6 py-3 font-semibold">Qtd.</th>
                    <th className="px-6 py-3 font-semibold">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {movements.length > 0 ? movements.map((m) => (
                    <tr key={m.id} className="text-sm">
                      <td className="px-6 py-4 text-neutral-500 flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(m.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.type === 'entrada' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {m.type === 'entrada' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {m.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {m.reason === 'venda' ? 'Venda' : 
                         m.reason === 'reposicao' ? 'Reposição' : 
                         m.reason.startsWith('Utilizado na OS') ? m.reason : m.reason}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-neutral-400 italic">
                        Nenhuma movimentação registrada para este produto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex justify-end">
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-6 py-2 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
