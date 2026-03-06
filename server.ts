import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("database.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    model TEXT,
    description TEXT,
    price REAL NOT NULL,
    quantity INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    device_model TEXT,
    device_password TEXT,
    device_state TEXT,
    device_color TEXT,
    description TEXT,
    status TEXT DEFAULT 'pendente',
    cost REAL DEFAULT 0,
    price REAL DEFAULT 0,
    employee_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id),
    FOREIGN KEY(employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS service_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price_at_time REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(service_id) REFERENCES services(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    type TEXT CHECK(type IN ('entrada', 'saida')),
    quantity INTEGER,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    action TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(employee_id) REFERENCES employees(id)
  );
`);

// Seed default employees if none exist
const employeeCount = db.prepare("SELECT count(*) as count FROM employees").get() as { count: number };
if (employeeCount.count < 8) {
  const employees = [
    ["Admin", "administrador", "admin@outletphone.com", "admin123"],
    ["Ricardo Silva", "tecnico", "ricardo@outletphone.com", "tech123"],
    ["Amanda Souza", "tecnico", "amanda@outletphone.com", "tech123"],
    ["Lucas Oliveira", "vendedor", "lucas@outletphone.com", "sales123"],
    ["Juliana Lima", "vendedor", "juliana@outletphone.com", "sales123"],
    ["Marcos Oliveira", "tecnico", "marcos@outletphone.com", "tech123"],
    ["Beatriz Santos", "tecnico", "beatriz@outletphone.com", "tech123"],
    ["Fernando Rocha", "tecnico", "fernando@outletphone.com", "tech123"]
  ];
  const checkStmt = db.prepare("SELECT id FROM employees WHERE email = ?");
  const insertStmt = db.prepare("INSERT INTO employees (name, role, email, password) VALUES (?, ?, ?, ?)");
  
  employees.forEach(e => {
    const exists = checkStmt.get(e[2]);
    if (!exists) {
      insertStmt.run(...e);
    }
  });
}

// Seed default products if none exist
const productCount = db.prepare("SELECT count(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const examples = [
    ['T-001', 'Tela iPhone 13 Pro Max', 'Apple', 'Tela original com garantia de 90 dias', 1200.00, 10],
    ['B-002', 'Bateria Samsung S22 Ultra', 'Samsung', 'Bateria selada original', 350.00, 15],
    ['C-003', 'Conector de Carga Moto G60', 'Motorola', 'Conector tipo C original', 85.00, 25],
    ['P-004', 'Película de Vidro 3D', 'Universal', 'Película premium anti-impacto', 15.00, 100],
    ['A-005', 'Carregador Turbo 20W', 'Apple Style', 'Carregador rápido com cabo lightning', 120.00, 30]
  ];
  const stmt = db.prepare("INSERT INTO products (code, name, model, description, price, quantity) VALUES (?, ?, ?, ?, ?, ?)");
  examples.forEach(ex => stmt.run(...ex));
}

// Seed default customers if none exist
const customerCount = db.prepare("SELECT count(*) as count FROM customers").get() as { count: number };
if (customerCount.count === 0) {
  const customers = [
    ["João Silva", "123.456.789-00", "Rua das Flores, 123", "(11) 98888-7777", "joao@email.com"],
    ["Maria Oliveira", "987.654.321-11", "Av. Central, 500", "(11) 97777-6666", "maria@email.com"],
    ["Carlos Santos", "111.222.333-44", "Rua B, 45", "(11) 96666-5555", "carlos@email.com"],
    ["Ana Costa", "555.666.777-88", "Rua C, 89", "(11) 95555-4444", "ana@email.com"],
    ["Pedro Lima", "999.888.777-66", "Rua D, 12", "(11) 94444-3333", "pedro@email.com"]
  ];
  const stmt = db.prepare("INSERT INTO customers (name, cpf, address, phone, email) VALUES (?, ?, ?, ?, ?)");
  customers.forEach(c => stmt.run(...c));
}

// Seed default services if none exist
const serviceCount = db.prepare("SELECT count(*) as count FROM services").get() as { count: number };
if (serviceCount.count < 30) {
  // Get valid technician IDs to avoid FK errors
  const technicians = db.prepare("SELECT id FROM employees WHERE role = 'tecnico'").all() as { id: number }[];
  if (technicians.length > 0) {
    const services = [
      [1, "iPhone 13", "123456", "Tela quebrada", "Azul", "Troca de tela frontal", "completo", 400.00, 1200.00, technicians[0].id],
      [2, "Samsung S22", "0000", "Bateria estufada", "Preto", "Troca de bateria original", "completo", 150.00, 450.00, technicians[1 % technicians.length].id],
      [3, "Moto G60", "9876", "Não carrega", "Cinza", "Reparo no conector de carga", "completo", 30.00, 150.00, technicians[2 % technicians.length].id],
      [4, "iPhone 11", "admin", "Câmera trêmula", "Branco", "Troca do módulo de câmera traseira", "completo", 200.00, 550.00, technicians[0].id],
      [5, "Xiaomi Note 10", "1111", "Sem sinal", "Verde", "Reparo na placa (setor de RF)", "pendente", 100.00, 350.00, technicians[1 % technicians.length].id],
      [1, "iPhone 13", "123456", "Limpeza", "Azul", "Limpeza interna e desoxidação", "completo", 50.00, 180.00, technicians[2 % technicians.length].id],
      [2, "Samsung S22", "0000", "Tampa traseira riscada", "Preto", "Troca da tampa traseira", "completo", 80.00, 220.00, technicians[0].id],
      [3, "Moto G60", "9876", "Software travado", "Cinza", "Reinstalação de firmware", "completo", 0, 120.00, technicians[1 % technicians.length].id],
      [4, "iPhone 11", "admin", "Botão power duro", "Branco", "Troca do flex do botão power", "pendente", 40.00, 180.00, technicians[2 % technicians.length].id],
      [5, "Xiaomi Note 10", "1111", "Vidro da câmera quebrado", "Verde", "Troca do vidro da lente da câmera", "completo", 15.00, 80.00, technicians[0].id],
      [1, "iPad Air 4", "2580", "Não liga", "Cinza Espacial", "Análise de placa e reparo de curto", "pendente", 150.00, 450.00, technicians[1 % technicians.length].id],
      [2, "Apple Watch S7", "none", "Vidro quebrado", "Estelar", "Troca de vidro (refabricação)", "em_andamento", 300.00, 850.00, technicians[2 % technicians.length].id],
      [3, "MacBook Pro M1", "123123", "Teclado falhando", "Prata", "Troca do topcase completo", "pendente", 800.00, 1800.00, technicians[0].id],
      [4, "iPhone 14 Pro", "000000", "Face ID parou", "Roxo", "Reparo no projetor de pontos", "em_andamento", 250.00, 750.00, technicians[1 % technicians.length].id],
      [5, "Samsung Tab S8", "1234", "Touch fantasma", "Grafite", "Troca do módulo de display", "completo", 450.00, 1100.00, technicians[2 % technicians.length].id],
      [1, "iPhone 12", "147258", "Vidro traseiro quebrado", "Preto", "Troca de vidro traseiro a laser", "completo", 120.00, 450.00, technicians[0].id],
      [2, "Motorola Edge 30", "none", "Botões laterais", "Azul", "Troca do flex de volume e power", "completo", 45.00, 180.00, technicians[1 % technicians.length].id],
      [3, "iPhone XR", "998877", "Bateria", "Amarelo", "Troca de bateria premium", "completo", 110.00, 320.00, technicians[2 % technicians.length].id],
      [4, "Samsung A54", "0000", "Câmera frontal", "Lima", "Troca da câmera frontal", "completo", 90.00, 280.00, technicians[0].id],
      [5, "Poco X3 Pro", "admin123", "Reballing CPU", "Bronze", "Reparo de placa (Reballing)", "completo", 200.00, 650.00, technicians[1 % technicians.length].id],
      [1, "iPhone 15 Pro", "0000", "Vidro quebrado", "Titânio", "Troca de tela original", "completo", 600.00, 1800.00, technicians[2 % technicians.length].id],
      [2, "Samsung S23 Ultra", "1234", "Não carrega", "Verde", "Troca da subplaca de carga", "completo", 120.00, 380.00, technicians[0].id],
      [3, "iPhone 14", "none", "Câmera traseira", "Azul", "Troca da lente da câmera", "completo", 50.00, 150.00, technicians[1 % technicians.length].id],
      [4, "Moto Edge 40", "123456", "Tela quebrada", "Preto", "Troca de frontal original", "completo", 400.00, 1100.00, technicians[2 % technicians.length].id],
      [5, "iPhone 13 Mini", "0000", "Bateria", "Rosa", "Troca de bateria original", "completo", 180.00, 420.00, technicians[0].id],
      [1, "iPhone 12 Pro", "1234", "Face ID", "Dourado", "Reparo no Face ID", "completo", 250.00, 650.00, technicians[1 % technicians.length].id],
      [2, "Samsung Z Flip 4", "none", "Tela interna", "Roxo", "Troca de tela dobrável", "completo", 1200.00, 2800.00, technicians[2 % technicians.length].id],
      [3, "iPhone 11 Pro", "0000", "Carcaça", "Verde", "Troca de carcaça completa", "completo", 300.00, 750.00, technicians[0].id],
      [4, "Xiaomi 12", "1234", "Software", "Cinza", "Desbloqueio de conta Mi", "completo", 0, 150.00, technicians[1 % technicians.length].id],
      [5, "iPhone 14 Plus", "none", "Som baixo", "Roxo", "Limpeza e troca de auricular", "completo", 40.00, 180.00, technicians[2 % technicians.length].id]
    ];
    const stmt = db.prepare(`
      INSERT INTO services (customer_id, device_model, device_password, device_state, device_color, description, status, cost, price, employee_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    services.forEach(s => stmt.run(...s));
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  
  // Employees
  app.get("/api/employees", (req, res) => {
    const employees = db.prepare("SELECT * FROM employees").all();
    res.json(employees);
  });

  app.post("/api/employees", (req, res) => {
    const { name, role, email, password } = req.body;
    try {
      const result = db.prepare("INSERT INTO employees (name, role, email, password) VALUES (?, ?, ?, ?)").run(name, role, email, password);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Customers
  app.get("/api/customers", (req, res) => {
    const customers = db.prepare("SELECT * FROM customers").all();
    res.json(customers);
  });

  app.get("/api/customers/check/:cpf", (req, res) => {
    const customer = db.prepare("SELECT * FROM customers WHERE cpf = ?").get(req.params.cpf);
    res.json(customer || null);
  });

  app.post("/api/customers", (req, res) => {
    const { name, cpf, address, phone, email } = req.body;
    try {
      const result = db.prepare("INSERT INTO customers (name, cpf, address, phone, email) VALUES (?, ?, ?, ?, ?)").run(name, cpf, address, phone, email);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/customers/:id", (req, res) => {
    const { name, address, phone, email } = req.body;
    db.prepare("UPDATE customers SET name = ?, address = ?, phone = ?, email = ? WHERE id = ?").run(name, address, phone, email, req.params.id);
    res.json({ success: true });
  });

  // Products
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.get("/api/products/:id/movements", (req, res) => {
    const movements = db.prepare(`
      SELECT * FROM stock_movements 
      WHERE product_id = ? 
      ORDER BY created_at DESC
    `).all(req.params.id);
    res.json(movements);
  });

  app.post("/api/products/sale", (req, res) => {
    const { product_id, quantity, employee_id, customer_id } = req.body;
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(product_id) as any;
    
    if (!product || product.quantity < quantity) {
      return res.status(400).json({ error: "Estoque insuficiente" });
    }

    db.transaction(() => {
      db.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?").run(quantity, product_id);
      db.prepare("INSERT INTO stock_movements (product_id, type, quantity, reason) VALUES (?, 'saida', ?, 'venda')").run(product_id, quantity);
      db.prepare("INSERT INTO activities (employee_id, action, details) VALUES (?, 'venda', ?)").run(
        employee_id, `Venda de ${quantity}x ${product.name}${customer_id ? ' para cliente ID ' + customer_id : ''}`
      );
    })();

    res.json({ success: true });
  });

  app.post("/api/products/restock", (req, res) => {
    const { product_id, quantity, employee_id } = req.body;
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(product_id) as any;
    
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    db.prepare("UPDATE products SET quantity = quantity + ? WHERE id = ?").run(quantity, product_id);
    db.prepare("INSERT INTO stock_movements (product_id, type, quantity, reason) VALUES (?, 'entrada', ?, 'reposicao')").run(product_id, quantity);
    db.prepare("INSERT INTO activities (employee_id, action, details) VALUES (?, 'reposicao', ?)").run(
      employee_id, `Reposição de ${quantity}x ${product.name}`
    );

    res.json({ success: true });
  });

  app.post("/api/products", (req, res) => {
    const { code, name, model, description, price, quantity } = req.body;
    try {
      const result = db.prepare("INSERT INTO products (code, name, model, description, price, quantity) VALUES (?, ?, ?, ?, ?, ?)").run(code, name, model, description, price, quantity);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/products/:id", (req, res) => {
    const { code, name, model, description, price, quantity } = req.body;
    try {
      db.prepare("UPDATE products SET code = ?, name = ?, model = ?, description = ?, price = ?, quantity = ? WHERE id = ?")
        .run(code, name, model, description, price, quantity, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Services
  app.get("/api/services", (req, res) => {
    const services = db.prepare(`
      SELECT s.*, c.name as customer_name, e.name as employee_name 
      FROM services s 
      LEFT JOIN customers c ON s.customer_id = c.id 
      LEFT JOIN employees e ON s.employee_id = e.id
      ORDER BY s.created_at DESC
    `).all();
    res.json(services);
  });

  app.post("/api/services", (req, res) => {
    const { customer_id, device_model, device_password, device_state, device_color, description, employee_id, price, cost } = req.body;
    const result = db.prepare(`
      INSERT INTO services (customer_id, device_model, device_password, device_state, device_color, description, employee_id, price, cost) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(customer_id, device_model, device_password, device_state, device_color, description, employee_id, price, cost);
    
    // Log activity
    db.prepare("INSERT INTO activities (employee_id, action, details) VALUES (?, ?, ?)").run(
      employee_id, "criar_servico", `Serviço criado para cliente ID ${customer_id}`
    );

    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/services/:id", (req, res) => {
    const service = db.prepare(`
      SELECT s.*, c.name as customer_name, c.phone as customer_phone, e.name as employee_name 
      FROM services s 
      LEFT JOIN customers c ON s.customer_id = c.id 
      LEFT JOIN employees e ON s.employee_id = e.id
      WHERE s.id = ?
    `).get(req.params.id);

    if (!service) return res.status(404).json({ error: "Serviço não encontrado" });

    const items = db.prepare(`
      SELECT si.*, p.name as product_name, p.code as product_code
      FROM service_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.service_id = ?
    `).all(req.params.id);

    res.json({ ...service, items });
  });

  app.put("/api/services/:id/status", (req, res) => {
    const { status, employee_id } = req.body;
    db.prepare("UPDATE services SET status = ? WHERE id = ?").run(status, req.params.id);
    
    db.prepare("INSERT INTO activities (employee_id, action, details) VALUES (?, 'atualizar_status', ?)").run(
      employee_id, `Status da OS #${req.params.id} alterado para ${status}`
    );

    res.json({ success: true });
  });

  app.post("/api/services/:id/items", (req, res) => {
    const { product_id, quantity, employee_id } = req.body;
    const service_id = req.params.id;

    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(product_id) as any;
    if (!product || product.quantity < quantity) {
      return res.status(400).json({ error: "Estoque insuficiente" });
    }

    db.transaction(() => {
      db.prepare("INSERT INTO service_items (service_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)").run(
        service_id, product_id, quantity, product.price
      );
      db.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?").run(quantity, product_id);
      db.prepare("INSERT INTO stock_movements (product_id, type, quantity, reason) VALUES (?, 'saida', ?, ?)").run(
        product_id, quantity, `Utilizado na OS #${service_id}`
      );
      // Update service cost
      db.prepare("UPDATE services SET cost = cost + ? WHERE id = ?").run(product.price * quantity, service_id);
    })();

    res.json({ success: true });
  });

  // Reports / Financial
  app.get("/api/reports/financial", (req, res) => {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_services,
        SUM(price) as total_revenue,
        SUM(cost) as total_cost,
        (SUM(price) - SUM(cost)) as total_profit,
        AVG(price) as ticket_medio
      FROM services
    `).get();
    res.json(stats);
  });

  app.get("/api/reports/inventory", (req, res) => {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_products,
        SUM(quantity) as total_items,
        SUM(price * quantity) as total_value
      FROM products
    `).get();
    res.json(stats);
  });

  app.get("/api/reports/sales", (req, res) => {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(quantity) as total_items_sold,
        (SELECT SUM(quantity * price_at_time) FROM service_items) as items_revenue
      FROM stock_movements
      WHERE type = 'saida' AND reason = 'venda'
    `).get() as any;
    
    // Add direct sales revenue
    const directSales = db.prepare(`
      SELECT SUM(sm.quantity * p.price) as revenue
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      WHERE sm.type = 'saida' AND reason = 'venda'
    `).get() as any;

    res.json({
      ...stats,
      total_revenue: (stats.items_revenue || 0) + (directSales.revenue || 0)
    });
  });

  app.get("/api/reports/team", (req, res) => {
    const stats = db.prepare(`
      SELECT 
        e.name,
        e.role,
        COUNT(s.id) as total_services,
        SUM(s.price) as total_revenue,
        AVG(s.price) as avg_ticket
      FROM employees e
      LEFT JOIN services s ON e.id = s.employee_id
      WHERE e.role = 'tecnico'
      GROUP BY e.id
    `).all();
    res.json(stats);
  });

  // Activities
  app.get("/api/activities", (req, res) => {
    const activities = db.prepare(`
      SELECT a.*, e.name as employee_name 
      FROM activities a 
      JOIN employees e ON a.employee_id = e.id 
      ORDER BY a.created_at DESC LIMIT 50
    `).all();
    res.json(activities);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
