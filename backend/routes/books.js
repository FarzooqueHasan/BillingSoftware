const express = require('express');
const router = express.Router();
const { getAllBooks, getBooksByClass, getAllBundles, getBundlesByClass, addBook, addBundle } = require('../controllers/booksController');
const { verifyToken } = require('../controllers/authController');

router.get('/', getAllBooks);
router.get('/class/:className', getBooksByClass);

router.get('/bundles', getAllBundles);
router.get('/bundles/class/:className', getBundlesByClass);

// Protected routes for managing books manually
router.post('/', verifyToken, addBook);
router.post('/bundles', verifyToken, addBundle);

module.exports = router;
