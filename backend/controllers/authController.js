const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-billing-key-2026';

const login = (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const inputHash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
  if (inputHash !== user.password_hash) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
  
  res.json({ token, username: user.username });
};

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
  if (!token) return res.status(403).json({ message: 'Malformed token' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.userId = decoded.id;
    next();
  });
};

module.exports = {
  login,
  verifyToken
};
