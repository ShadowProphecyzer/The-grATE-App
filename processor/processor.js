const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config({ path: path.join(__dirname, '../.env') });

// Config
const QUEUE_DIR = path.join(__dirname, 'queue');
const OUTPUTS_DIR = path.join(__dirname, 'outputs');
const MONGODB_URI = process.env.MONGODB_URI;

const API1_URL = process.env.API1_URL;
const API1_KEY = process.env.API1_KEY;
const API1_PROMPT = process.env.API1_PROMPT;
const API2_URL = process.env.API2_URL;
const API2_KEY = process.env.API2_KEY;
const API2_PROMPT = process.env.API2_PROMPT;

if (!fs.existsSync(QUEUE_DIR)) fs.mkdirSync(QUEUE_DIR, { recursive: true });
if (!fs.existsSync(OUTPUTS_DIR)) fs.mkdirSync(OUTPUTS_DIR, { recursive: true });

let mongoClient;
async function connectMongo() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.log('Processor connected to MongoDB');
  }
  return mongoClient;
}

// Helper: parse username and timestamp from filename
function parseFileName(filename) {
  const match = filename.match(/^(.+?)_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)\.jpg$/);
  if (!match) return {};
  return { username: match[1], timestamp: match[2] };
}

// Helper: process one file
async function processFile(filePath) {
  const filename = path.basename(filePath);
  const { username, timestamp } = parseFileName(filename);
  if (!username || !timestamp) {
    console.error('Invalid filename format:', filename);
    fs.unlinkSync(filePath);
    return;
  }
  const db = mongoClient.db(username);
  const history = db.collection('history');
  const fileBuffer = fs.readFileSync(filePath);
  const imageBase64 = fileBuffer.toString('base64');
  // Find the history entry
  const entry = await history.findOne({ file_path: filePath });
  if (!entry) {
    await history.insertOne({
      image_base64: imageBase64,
      file_path: filePath,
      timestamp: new Date(timestamp),
      status: 'processing',
      step: 'processor',
    });
  } else {
    await history.updateOne({ _id: entry._id }, { $set: { status: 'processing', step: 'processor' } });
  }
  // Step 1: API1
  let api1Response, api1Result;
  try {
    api1Response = await axios.post(API1_URL, {
      image: imageBase64,
      prompt: API1_PROMPT,
      key: API1_KEY,
    });
    api1Result = api1Response.data.result;
    await history.updateOne(
      { file_path: filePath },
      { $set: { api1_request: { prompt: API1_PROMPT }, api1_response: api1Response.data, api1_result: api1Result } }
    );
  } catch (err) {
    await history.updateOne(
      { file_path: filePath },
      { $set: { status: 'error', error_logs: [`API1 error: ${err.message}`] } }
    );
    fs.unlinkSync(filePath);
    return;
  }
  if (!api1Result || api1Result === 'No Result') {
    await history.updateOne(
      { file_path: filePath },
      { $set: { status: 'error', error_logs: ['FDA code not detected. Please try again.'] } }
    );
    fs.unlinkSync(filePath);
    return;
  }
  // Step 2: API2
  let api2Response, api2Result;
  try {
    api2Response = await axios.post(API2_URL, {
      code: api1Result,
      prompt: API2_PROMPT,
      key: API2_KEY,
    });
    api2Result = api2Response.data.result;
    await history.updateOne(
      { file_path: filePath },
      { $set: { api2_request: { prompt: API2_PROMPT, code: api1Result }, api2_response: api2Response.data, api2_result: api2Result } }
    );
  } catch (err) {
    await history.updateOne(
      { file_path: filePath },
      { $set: { status: 'error', error_logs: [`API2 error: ${err.message}`] } }
    );
    fs.unlinkSync(filePath);
    return;
  }
  if (!api2Result) {
    await history.updateOne(
      { file_path: filePath },
      { $set: { status: 'error', error_logs: ['Product not found. Please try again.'] } }
    );
    fs.unlinkSync(filePath);
    return;
  }
  // Save output to outputs folder
  const outputFilename = `${username}_${timestamp}_api2.json`;
  const outputPath = path.join(OUTPUTS_DIR, outputFilename);
  fs.writeFileSync(outputPath, JSON.stringify(api2Result, null, 2));
  await history.updateOne(
    { file_path: filePath },
    { $set: { status: 'done', outputs_file_path: outputPath } }
  );
  // Delete input file
  fs.unlinkSync(filePath);
  console.log('Processed and cleaned up:', filename);
}

// Queue processor: process one file at a time
let processing = false;
async function processQueue() {
  if (processing) return;
  processing = true;
  try {
    const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.jpg'));
    if (files.length === 0) {
      processing = false;
      return;
    }
    const filePath = path.join(QUEUE_DIR, files[0]);
    await processFile(filePath);
  } catch (err) {
    console.error('Queue processing error:', err);
  }
  processing = false;
}

function startQueueWatcher() {
  console.log('Watching queue folder:', QUEUE_DIR);
  const watcher = chokidar.watch(QUEUE_DIR, { persistent: true, ignoreInitial: false });
  watcher.on('add', async filePath => {
    await processQueue();
  });
  setInterval(processQueue, 5000); // Fallback polling
}

(async () => {
  await connectMongo();
  startQueueWatcher();
})(); 