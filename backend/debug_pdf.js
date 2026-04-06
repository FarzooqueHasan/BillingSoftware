const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pdfPath = path.resolve(__dirname, '../Book 2026-27.pdf');

if (!fs.existsSync(pdfPath)) {
    console.error('File not found:', pdfPath);
    process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);
pdf(dataBuffer).then(data => {
    console.log('--- START PDF TEXT ---');
    console.log(data.text.substring(0, 5000));
    console.log('--- END PDF TEXT ---');
}).catch(err => {
    console.error('PDF Parse Error:', err);
});
