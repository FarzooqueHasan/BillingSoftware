const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const salesRoutes = require('./routes/sales');
const pdfRoutes = require('./routes/pdf');

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/pdf', pdfRoutes);

app.get('/', (req, res) => {
  res.send('Billing System API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
