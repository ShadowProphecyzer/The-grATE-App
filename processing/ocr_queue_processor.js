const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const QUEUE_DIR = path.join(__dirname, 'queue');
const OCR_SPACE_API_KEY = process.env.ocr_api_key;

async function processNextImage() {
    const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.jpg'));
    if (files.length === 0) {
        console.log('No images in queue.');
        return;
    }
    const file = files[0];
    const filePath = path.join(QUEUE_DIR, file);
    console.log('Processing:', filePath);
    try {
        const imageFile = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('apikey', OCR_SPACE_API_KEY);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('file', imageFile, file);
        const ocrRes = await axios.post('https://api.ocr.space/parse/image', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        // Clean up processed file
        fs.unlinkSync(filePath);
        const parsedText = ocrRes.data.ParsedResults && ocrRes.data.ParsedResults[0] ? ocrRes.data.ParsedResults[0].ParsedText : '';
        console.log('OCR Result:', parsedText);

        // Save OCR result as .txt file in stage_1 folder
        const stage1Dir = path.join(__dirname, 'stage_1');
        if (!fs.existsSync(stage1Dir)) fs.mkdirSync(stage1Dir, { recursive: true });
        const baseName = path.parse(file).name;
        const txtPath = path.join(stage1Dir, baseName + '.txt');
        fs.writeFileSync(txtPath, parsedText, 'utf8');
        console.log('Saved OCR result to:', txtPath);
    } catch (error) {
        console.error('OCR failed:', error.message);
    }
}

processNextImage(); 