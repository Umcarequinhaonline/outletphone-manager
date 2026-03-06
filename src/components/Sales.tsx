import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Package, DollarSign, User, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Product, Employee, Customer } from '../types';

export default function Sales({ currentUser }: { currentUser: Employee | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/customers').then(res => res.json())
    ]).then(([p, c]) => {
      setProducts(p);
      setCustomers(c);
    });
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity < product.quantity) {
        setCart(cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        ));
      } else {
        alert('Estoque insuficiente');
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: number, qty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (qty > product.quantity) {
      alert('Estoque insuficiente');
      return;
    }

    setCart(cart.map(item => 
      item.product.id === productId ? { ...item, quantity: qty } : item
    ));
  };

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/products/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            product_id: item.product_id || item.product.id,
            quantity: item.quantity
          })),
          employee_id: currentUser?.id || 1,
          customer_id: selectedCustomerId || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao processar venda');
      }

      alert('Venda realizada com sucesso!');
      setCart([]);
      setSelectedCustomerId('');
      fetchData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
      {/* Product Selection */}
      <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vendas</h1>
            <p className="text-neutral-500">Selecione os produtos para realizar uma venda.</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar produto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-2">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => product.quantity > 0 && addToCart(product)}
              className={`bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm transition-all group cursor-pointer ${
                product.quantity > 0 ? 'hover:shadow-md hover:border-primary/30' : 'opacity-60 grayscale'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-neutral-50 rounded-lg text-neutral-400 group-hover:text-primary transition-colors">
                  <Package size={20} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  product.quantity > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {product.quantity} em estoque
                </span>
              </div>
              <h3 className="font-bold text-neutral-900 truncate">{product.name}</h3>
              <p className="text-xs text-neutral-500 mt-1">{product.model || 'Sem modelo'}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-black text-primary">R$ {product.price.toFixed(2)}</span>
                <button 
                  disabled={product.quantity <= 0}
                  className="p-2 bg-primary text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart / Checkout */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary" /> Carrinho
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length > 0 ? cart.map(item => (
            <div key={item.product.id} className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400">
                <Package size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{item.product.name}</p>
                <p className="text-xs text-neutral-500">R$ {item.product.price.toFixed(2)} un</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={item.quantity}
                  onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value))}
                  className="w-12 text-center text-sm font-bold bg-neutral-50 border border-neutral-200 rounded-lg p-1"
                />
                <button 
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-2">
              <ShoppingCart size={48} strokeWidth={1} />
              <p className="text-sm">Seu carrinho está vazio</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-neutral-50 border-t border-neutral-100 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <User size={12} /> Cliente (Opcional)
            </label>
            <select 
              className="w-full bg-white border border-neutral-200 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Consumidor Final</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-neutral-500 font-medium">Total</span>
              <span className="text-2xl font-black text-neutral-900">R$ {total.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Finalizar Venda
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
