const express = require('express');
const router = express.Router();
const { createSale, getAllSales, getSalesMetrics, updateDeliveryStatus } = require('../controllers/salesController');
const { verifyToken } = require('../controllers/authController');

// POS endpoint
router.post('/', createSale);

// Analytics endpoints
router.get('/', verifyToken, getAllSales);
router.get('/metrics', verifyToken, getSalesMetrics);

// Update status
router.patch('/:id/delivery', verifyToken, updateDeliveryStatus);

module.exports = router;
