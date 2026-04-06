const db = require('../db/database');

// PDF parsing logic can be extended here later, but for now we focus on standard CRUD APIs
// the parser will be added as a separate service that populates the DB.

const getAllBooks = (req, res) => {
  try {
    const books = db.prepare('SELECT * FROM books').all();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

const getBooksByClass = (req, res) => {
  const { className } = req.params;
  try {
    const books = db.prepare('SELECT * FROM books WHERE class = ?').all(className);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

const getAllBundles = (req, res) => {
  try {
    const bundles = db.prepare('SELECT * FROM bundles').all();
    res.json(bundles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bundles' });
  }
};

const getBundlesByClass = (req, res) => {
  const { className } = req.params;
  try {
    const bundles = db.prepare('SELECT * FROM bundles WHERE class = ?').all(className);
    res.json(bundles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bundles' });
  }
};

// Admin endpoints for adding manually
const addBook = (req, res) => {
  const { name, class: className, price, bundle_id } = req.body;
  if (!name || !className || price === undefined) {
    return res.status(400).json({ error: 'Name, class, and price are required' });
  }
  try {
    const info = db.prepare('INSERT INTO books (name, class, price, bundle_id) VALUES (?, ?, ?, ?)')
                   .run(name, className, price, bundle_id || null);
    res.status(201).json({ id: info.lastInsertRowid, message: 'Book created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add book' });
  }
};

const addBundle = (req, res) => {
  const { name, class: className, total_price } = req.body;
  if (!name || !className || total_price === undefined) {
    return res.status(400).json({ error: 'Name, class, and total_price are required' });
  }
  try {
    const info = db.prepare('INSERT INTO bundles (name, class, total_price) VALUES (?, ?, ?)')
                   .run(name, className, total_price);
    res.status(201).json({ id: info.lastInsertRowid, message: 'Bundle created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add bundle' });
  }
};

module.exports = {
  getAllBooks,
  getBooksByClass,
  getAllBundles,
  getBundlesByClass,
  addBook,
  addBundle
};
