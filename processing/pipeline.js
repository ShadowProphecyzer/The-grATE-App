const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROCESSING_DIR = __dirname;

function runScript(script, file, isPython = false) {
    console.log(`\n[PIPELINE] Running ${script}${file ? ' for file: ' + file : ''}`);
    const cmd = isPython ? 'python' : 'node';
    const result = spawnSync(cmd, [path.join(PROCESSING_DIR, script)], { stdio: 'inherit' });
    if (result.error) throw result.error;
}

function processAll(stageDir, scriptName, ext = '.jpg', isPython = false) {
    const dir = path.join(PROCESSING_DIR, stageDir);
    if (!fs.existsSync(dir)) return;
    let files = fs.readdirSync(dir).filter(f => f.endsWith(ext));
    if (files.length === 0) {
        console.log(`[PIPELINE] No files to process in ${stageDir}`);
    }
    while (files.length > 0) {
        console.log(`[PIPELINE] Processing ${files[0]} in ${stageDir}`);
        runScript(scriptName, files[0], isPython);
        files = fs.readdirSync(dir).filter(f => f.endsWith(ext));
    }
    console.log(`[PIPELINE] Finished processing all files in ${stageDir}`);
}

console.log('[PIPELINE] Starting Stage 1: OCR on images in queue');
processAll('queue', 'ocr_queue_processor.js', '.jpg');
console.log('[PIPELINE] Starting Stage 2: AI processing on text in stage_1');
processAll('stage_1', 'xcyet.js', '.txt', true); // Use Python for xcyet.js
console.log('[PIPELINE] Starting Stage 3: AI processing on text in stage_2');
processAll('stage_2', 'xcyet2.js', '.txt');

console.log('[PIPELINE] Pipeline complete.'); 