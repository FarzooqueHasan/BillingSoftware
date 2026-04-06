const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { parseBookListPdf } = require('../utils/pdfParser');
const db = require('../db/database');
const { verifyToken } = require('../controllers/authController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const classData = await parseBookListPdf(req.file.path);

    // Clean up
    fs.unlinkSync(req.file.path);

    // Ingest into Database
    let booksInserted = 0;
    let bundlesInserted = 0;

    const insertBundle = db.prepare('INSERT INTO bundles (name, class, total_price) VALUES (?, ?, ?)');
    const insertBook = db.prepare('INSERT INTO books (name, class, price, bundle_id) VALUES (?, ?, ?, ?)');

    db.transaction(() => {
        for (const [className, data] of Object.entries(classData)) {
            // Create bundle
            const bundleName = `${className} Full Set`;
            const bundleInfo = insertBundle.run(bundleName, className, data.total);
            bundlesInserted++;

            // Create books for this bundle
            for (const book of data.books) {
                insertBook.run(book.name || 'Unnamed Book', className, book.price || 0, bundleInfo.lastInsertRowid);
                booksInserted++;
            }
        }
    })();

    res.json({
      message: 'PDF data ingested successfully',
      stats: { bundles: bundlesInserted, books: booksInserted }
    });
  } catch (error) {
    console.error('PDF Parse Error:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

module.exports = router;
