// Shared configuration for the application
const path = require('path');

// Load .env from the root directory (1 level up from backend/)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

module.exports = {
    // MongoDB Configuration
    MONGODB_URI: process.env.MONGODB_URI,
    DB_NAME: process.env.DB_NAME,
    COLLECTION_NAME: process.env.COLLECTION_NAME,
    
    // Server Configuration
    PORT: process.env.PORT || 3000,
    
    // CORS Configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // Gmail credentials for nodemailer
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASS: process.env.GMAIL_PASS,
    CHAT_SECRET: process.env.CHAT_SECRET
}; 