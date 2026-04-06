const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Placeholder PDF import logic.
// In the long term, we need specific regex to parse the pdf.
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);

    // After parsing, delete the temp file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'PDF uploaded and parsed successfully',
      textPreview: data.text.substring(0, 500) // snippet for now until structured parsing is implemented
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
});

module.exports = router;
