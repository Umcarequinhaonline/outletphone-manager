export interface Employee {
  id: number;
  name: string;
  role: 'administrador' | 'tecnico' | 'vendedor';
  email: string;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  cpf: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  model: string;
  description: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface ServiceOrder {
  id: number;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  device_model: string;
  device_password?: string;
  device_state: string;
  device_color: string;
  description: string;
  status: 'pendente' | 'em_andamento' | 'completo' | 'cancelado';
  cost: number;
  price: number;
  employee_id: number;
  employee_name?: string;
  created_at: string;
  items?: ServiceItem[];
}

export interface ServiceItem {
  id: number;
  service_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
}

export interface Activity {
  id: number;
  employee_id: number;
  employee_name: string;
  action: string;
  details: string;
  created_at: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  created_at: string;
}
