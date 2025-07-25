const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const STAGE2_DIR = path.join(__dirname, 'stage_2');
const STAGE3_DIR = path.join(__dirname, 'stage_3');
const AI2_API_KEY = process.env.xcyet2_api_key;
const AI2_API_URL = process.env.xcyet2_api_url;
const AI2_API_PROMPT = process.env.xcyet2_api_prompt;

async function processNextText() {
    const files = fs.readdirSync(STAGE2_DIR).filter(f => f.endsWith('.txt'));
    if (files.length === 0) {
        console.log('No text files in stage_2.');
        return;
    }
    const file = files[0];
    const filePath = path.join(STAGE2_DIR, file);
    console.log('Processing:', filePath);
    try {
        const textContent = fs.readFileSync(filePath, 'utf8');
        const response = await axios.post(AI2_API_URL, {
            key: AI2_API_KEY,
            prompt: AI2_API_PROMPT,
            input: textContent
        });
        const aiResult = response.data.result || response.data.text || JSON.stringify(response.data);
        // Save AI result as .txt file in stage_3 folder
        if (!fs.existsSync(STAGE3_DIR)) fs.mkdirSync(STAGE3_DIR, { recursive: true });
        const baseName = path.parse(file).name;
        const txtPath = path.join(STAGE3_DIR, baseName + '.txt');
        fs.writeFileSync(txtPath, aiResult, 'utf8');
        console.log('Saved AI result to:', txtPath);
    } catch (error) {
        console.error('AI processing failed:', error.message);
    }
}

processNextText(); 