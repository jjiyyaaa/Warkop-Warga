const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '.')));

// Database connection pool
// Railway provides MYSQL_* env vars automatically when you add a MySQL plugin.
// Falls back to XAMPP defaults for local development.
const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST     || 'localhost',
  port:     process.env.MYSQL_PORT     || 3306,
  user:     process.env.MYSQL_USER     || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'warkop_warga',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize Database Table Automatically
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        tableNumber VARCHAR(50),
        total INT,
        paymentMethod VARCHAR(20),
        status VARCHAR(20),
        printRequested BOOLEAN,
        createdAt DATETIME
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(50),
        item_id INT,
        name VARCHAR(100),
        price INT,
        quantity INT,
        notes VARCHAR(255),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    console.log('=============================================');
    console.log('[DATABASE] MySQL Connected & Normalized Tables ready.');
    console.log('=============================================');
    
    await seedDatabase();
    // Force cleanup: if there was VIP data, change it to table 6
    await pool.query('UPDATE orders SET tableNumber = "6" WHERE tableNumber = "VIP"');
  } catch (error) {
    console.error('=============================================');
    console.error('[DATABASE ERROR] Failed to connect or create table!');
    console.error('Pastikan XAMPP (Apache & MySQL) sudah menyala dan database "warkop_warga" sudah dibuat di phpMyAdmin.');
    console.error('Pesan Error:', error.message);
    console.error('=============================================');
  }
}
initDB();

async function seedDatabase() {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM orders');
  if (rows[0].count > 0) return; // Already seeded

  console.log('[DATABASE] Tabel kosong. Menyiapkan simulasi dummy data...');

  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;

  function getLocalTime(daysOffset, hour, minute) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysOffset);
    d.setHours(hour, minute, 0, 0);
    const local = new Date(d.getTime() - offset);
    return local.toISOString().slice(0, 19).replace('T', ' ');
  }

  const dummyOrders = [
    // Two days ago
    { id: 'Z-101', table: '1', total: 18000, method: 'qris', status: 'completed', print: false, time: getLocalTime(2, 10, 15),
      items: [{id: 1, name: 'Kopi Hitam', price: 4000, qty: 2}, {id: 29, name: 'Otak-otak Gowreng', price: 10000, qty: 1}] },
    { id: 'Z-102', table: 'takeaway', total: 34000, method: 'cash', status: 'completed', print: true, time: getLocalTime(2, 14, 30),
      items: [{id: 32, name: 'Mix Gowreng', price: 20000, qty: 1}, {id: 26, name: 'Indomie Kuah + Telur', price: 12000, qty: 1, notes: 'pedas gila'}, {id: 12, name: 'Teh Tawar', price: 2000, qty: 1}] },
    { id: 'Z-103', table: '4', total: 10000, method: 'qris', status: 'completed', print: false, time: getLocalTime(2, 19, 45),
      items: [{id: 7, name: 'Kopi Putih', price: 5000, qty: 2}] },

    // Yesterday
    { id: 'Y-201', table: '2', total: 27000, method: 'cash', status: 'completed', print: false, time: getLocalTime(1, 9, 20),
      items: [{id: 23, name: 'Indomie Goreng', price: 8000, qty: 1}, {id: 28, name: 'Indomie Double + Telur', price: 19000, qty: 1, notes: 'telur setengah mateng'}] },
    { id: 'Y-202', table: '6', total: 16000, method: 'qris', status: 'completed', print: true, time: getLocalTime(1, 15, 10),
      items: [{id: 3, name: 'Kopi ABC Klepon', price: 6000, qty: 1}, {id: 31, name: 'Sosis Gowreng', price: 10000, qty: 1}] },
    { id: 'Y-203', table: 'takeaway', total: 20000, method: 'cash', status: 'completed', print: false, time: getLocalTime(1, 21, 0),
      items: [{id: 35, name: 'Nasi Ayam Geprek', price: 15000, qty: 1}, {id: 14, name: 'Nutrisari Jeruk Peras', price: 5000, qty: 1}] },

    // Today
    { id: 'T-301', table: '3', total: 11000, method: 'qris', status: 'completed', print: false, time: getLocalTime(0, 8, 5),
      items: [{id: 5, name: 'Kopi Goodday Cappucino', price: 6000, qty: 1}, {id: 11, name: 'Teh Manis', price: 5000, qty: 1}] },
    { id: 'T-302', table: '5', total: 24000, method: 'cash', status: 'completed', print: true, time: getLocalTime(0, 11, 45),
      items: [{id: 24, name: 'Indomie Kuah', price: 8000, qty: 3}] },
    { id: 'T-303', table: 'takeaway', total: 18000, method: 'qris', status: 'paid', print: false, time: getLocalTime(0, 12, 30),
      items: [{id: 8, name: 'Chocolatos Matcha', price: 6000, qty: 3, notes: 'es dipisah'}] }, // active, paid
    { id: 'T-304', table: '1', total: 25000, method: 'cash', status: 'unpaid', print: false, time: getLocalTime(0, 12, 35),
      items: [{id: 34, name: 'Nasi Telur', price: 15000, qty: 1}, {id: 39, name: 'Susu Jahe', price: 5000, qty: 2}] } // active, unpaid
  ];

  for (const o of dummyOrders) {
    await pool.query(
      'INSERT INTO orders (id, tableNumber, total, paymentMethod, status, printRequested, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [o.id, o.table, o.total, o.method, o.status, o.print ? 1 : 0, o.time]
    );
    const itemsValues = o.items.map(i => [o.id, i.id, i.name, i.price, i.qty, i.notes || null]);
    await pool.query('INSERT INTO order_items (order_id, item_id, name, price, quantity, notes) VALUES ?', [itemsValues]);
  }
  
  console.log('[DATABASE] Dummy data berhasil di-inject untuk keperluan pameran!');
}

// Get all orders (Joining orders and order_items)
app.get('/api/orders', async (req, res) => {
  try {
    const [ordersResult] = await pool.query('SELECT * FROM orders ORDER BY createdAt ASC');
    const [itemsResult] = await pool.query('SELECT * FROM order_items');
    
    // Parse boolean and assemble items back into arrays for the frontend
    const orders = ordersResult.map(order => {
      const items = itemsResult
        .filter(i => i.order_id === order.id)
        .map(i => ({
          id: i.item_id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          notes: i.notes
        }));

      return {
        ...order,
        printRequested: order.printRequested === 1,
        items: items
      };
    });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  const connection = await pool.getConnection(); // Use transaction for multi-table insert
  try {
    await connection.beginTransaction();

    // Generate short, easily callable ID (e.g. "A-142")
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `${randomChar}-${randomNum}`;
    
    // Format to MySQL DATETIME (YYYY-MM-DD HH:mm:ss) with Local Timezone Adjustment
    const now = new Date();
    const localTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const createdAt = localTime.toISOString().slice(0, 19).replace('T', ' '); 
    
    const newOrder = {
      ...req.body,
      id: newId,
      status: 'unpaid',
      printRequested: false,
      createdAt: createdAt
    };
    
    // 1. Insert to orders table
    await connection.query(
      'INSERT INTO orders (id, tableNumber, total, paymentMethod, status, printRequested, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        newOrder.id,
        newOrder.tableNumber,
        newOrder.total,
        newOrder.paymentMethod,
        newOrder.status,
        newOrder.printRequested,
        newOrder.createdAt
      ]
    );

    // 2. Insert to order_items table
    if (newOrder.items && newOrder.items.length > 0) {
      const itemsValues = newOrder.items.map(item => [
        newOrder.id, 
        item.id, 
        item.name, 
        item.price, 
        item.quantity, 
        item.notes || null
      ]);
      
      await connection.query(
        'INSERT INTO order_items (order_id, item_id, name, price, quantity, notes) VALUES ?',
        [itemsValues]
      );
    }
    
    await connection.commit();
    res.status(201).json(newOrder);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// Admin endpoint: update order status manually
app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer endpoint: request physical receipt
app.post('/api/orders/:id/print', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE orders SET printRequested = 1 WHERE id = ?', [id]);
    res.json({ id, printRequested: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin endpoint: clear print request
app.post('/api/orders/:id/clear-print', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE orders SET printRequested = 0 WHERE id = ?', [id]);
    res.json({ id, printRequested: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint for Payment Gateway integration
app.post('/api/webhook/payment', async (req, res) => {
  const { orderId } = req.body;
  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['paid', orderId]);
    console.log(`[WEBHOOK] Order #${orderId} marked as PAID via MySQL Database.`);
    res.json({ message: 'Webhook received successfully', orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Warkop Warga Server running at http://localhost:${port}`);
  console.log('Database Mode: MySQL Normalized (phpMyAdmin)');
});
