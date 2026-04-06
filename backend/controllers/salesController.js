const db = require('../db/database');

const generateBillNumber = () => {
  const currentYear = new Date().getFullYear();
  const prefix = `BILL-${currentYear}-`;
  
  // Find the last bill of this year
  const lastSale = db.prepare(`
    SELECT bill_number FROM sales 
    WHERE bill_number LIKE ? 
    ORDER BY id DESC LIMIT 1
  `).get(`${prefix}%`);

  let nextNumber = 1;
  if (lastSale) {
    const lastNumberStr = lastSale.bill_number.split('-')[2];
    nextNumber = parseInt(lastNumberStr, 10) + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

const createSale = (req, res) => {
  const { student_name, class: className, items, total_amount, amount_paid, change_returned, delivered_status } = req.body;
  
  if (!student_name || !className || !items || total_amount === undefined || amount_paid === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Double check calculations for safety
  const expectedChange = Math.max(0, amount_paid - total_amount);
  
  try {
    const billNumber = generateBillNumber();
    const itemsJson = JSON.stringify(items);
    
    const info = db.prepare(`
      INSERT INTO sales (bill_number, student_name, class, items_json, total_amount, amount_paid, change_returned, delivered_status, is_locked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(billNumber, student_name, className, itemsJson, total_amount, amount_paid, change_returned || expectedChange, delivered_status === undefined ? 1 : (delivered_status ? 1 : 0));
    
    // Return the created sale
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(info.lastInsertRowid);
    
    res.status(201).json({ message: 'Sale created successfully', sale });
  } catch (error) {
    console.error('Sale creation error:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
};

const getAllSales = (req, res) => {
  try {
    const sales = db.prepare('SELECT * FROM sales ORDER BY id DESC').all();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
};

const getSalesMetrics = (req, res) => {
  try {
    // Basic metrics
    const totalRevenueRow = db.prepare('SELECT SUM(total_amount) as total FROM sales').get();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRevenueRow = db.prepare("SELECT SUM(total_amount) as total FROM sales WHERE DATE(timestamp) = ?").get(todayStr);
    
    const pendingDeliveriesRow = db.prepare('SELECT COUNT(*) as count FROM sales WHERE delivered_status = 0').get();

    res.json({
      totalRevenue: totalRevenueRow.total || 0,
      todayRevenue: todayRevenueRow.total || 0,
      pendingDeliveries: pendingDeliveriesRow.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

const updateDeliveryStatus = (req, res) => {
  const { id } = req.params;
  const { delivered_status } = req.body;
  
  if (delivered_status === undefined) {
    return res.status(400).json({ error: 'delivered_status is required' });
  }

  try {
    const info = db.prepare('UPDATE sales SET delivered_status = ? WHERE id = ?')
                   .run(delivered_status ? 1 : 0, id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json({ message: 'Delivery status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
};

module.exports = {
  createSale,
  getAllSales,
  getSalesMetrics,
  updateDeliveryStatus
};
