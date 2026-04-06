const path = require('path');
const { parseBookListPdf } = require('./utils/pdfParser');
const db = require('./db/database');

async function seed() {
    const pdfPath = path.resolve(__dirname, '../Book 2026-27.pdf');
    try {
        console.log('Parsing PDF...');
        const classData = await parseBookListPdf(pdfPath);
        
        console.log('Ingesting data into database...');
        let booksInserted = 0;
        let bundlesInserted = 0;

        const insertBundle = db.prepare('INSERT INTO bundles (name, class, total_price) VALUES (?, ?, ?)');
        const insertBook = db.prepare('INSERT INTO books (name, class, price, bundle_id) VALUES (?, ?, ?, ?)');

        db.transaction(() => {
            for (const [className, data] of Object.entries(classData)) {
                // Check if bundle already exists
                const existing = db.prepare('SELECT id FROM bundles WHERE class = ?').get(className);
                if (existing) continue; // Skip if already there

                const bundleName = `${className} Full Set`;
                const bundleInfo = insertBundle.run(bundleName, className, data.total);
                bundlesInserted++;

                for (const book of data.books) {
                    insertBook.run(book.name || 'Unnamed Book', className, book.price || 0, bundleInfo.lastInsertRowid);
                    booksInserted++;
                }
            }
        })();

        console.log(`Successfully seeded ${bundlesInserted} bundles and ${booksInserted} books.`);
    } catch (err) {
        console.error('Failed to seed DB:', err);
    }
}

seed();
