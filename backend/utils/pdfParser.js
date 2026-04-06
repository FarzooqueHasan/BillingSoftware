const fs = require('fs');
const pdf = require('pdf-parse');

async function parseBookListPdf(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const classes = {};
    let currentClass = null;
    let currentItem = null;
    let expectingPrice = false;

    // Simple heuristic parser for this specific PDF format
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.includes('BOOK LIST')) {
            // Next line usually is class
            const nextLine = lines[i + 1]?.trim();
            if (nextLine && !nextLine.match(/^\d+$/)) {
                currentClass = nextLine;
                if (!classes[currentClass]) {
                    classes[currentClass] = { books: [], total: 0 };
                }
                i++; // Skip class line
            }
            continue;
        }

        if (line === 'TOTAL') {
            const nextLine = lines[i + 1]?.trim();
            if (nextLine && nextLine.match(/^\d+$/)) {
                if (currentClass) {
                    classes[currentClass].total = parseInt(nextLine, 10);
                }
                i++;
            }
            continue;
        }

        if (currentClass) {
            // If line is a number, it's either an index or a price
            if (line.match(/^\d+$/)) {
                const num = parseInt(line, 10);
                if (expectingPrice) {
                    if (currentItem) {
                        currentItem.price = num;
                        classes[currentClass].books.push(currentItem);
                        expectingPrice = false;
                        currentItem = null;
                    }
                } else if (num < 100) {
                    // It's likely an index number (1, 2, 3...)
                    currentItem = { name: '', publisher: '', price: 0 };
                } else {
                    // It's a price without a context, maybe fallback
                    if (currentItem) {
                        currentItem.price = num;
                        classes[currentClass].books.push(currentItem);
                        currentItem = null;
                    }
                }
            } else {
                if (currentItem) {
                    // It's text, append to name
                    // In this PDF, lines before numbers are usually name/publisher
                    if (['RACHNAV', 'SAGAR', 'GOYAL', 'RATNA', 'COLLINS', 'PEARSON', 'AVARTAN', 'SNOWDROP', 'NOT AVAILABLE'].some(pub => line.includes(pub))) {
                         currentItem.publisher += line + ' ';
                         expectingPrice = true; // next number is price
                    } else if (line.match(/^[A-Z\s]+$/) && line.length > 3 && !line.includes('Hindi Set')) {
                         currentItem.publisher += line + ' ';
                         expectingPrice = true; 
                    } else {
                         currentItem.name += line + ' ';
                         // some rows don't have publishers, just a name then price
                         if (i + 1 < lines.length && lines[i + 1].match(/^\d+$/) && parseInt(lines[i+1], 10) > 100) {
                             expectingPrice = true;
                         }
                    }
                }
            }
        }
    }

    // Clean up strings
    Object.values(classes).forEach(c => {
        c.books.forEach(b => {
             b.name = b.name.trim();
             b.publisher = b.publisher.trim();
        });
        
        // Deduplicate books by name if PDF repeats pages
        const uniqueBooks = [];
        const seen = new Set();
        c.books.forEach(b => {
            if (!seen.has(b.name)) {
                seen.add(b.name);
                uniqueBooks.push(b);
            }
        });
        c.books = uniqueBooks;
    });

    return classes;
}

module.exports = { parseBookListPdf };
