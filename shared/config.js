// Shared configuration for the application
const path = require('path');

// Load .env from the root directory (2 levels up from shared/)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
    // MongoDB Configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    DB_NAME: process.env.DB_NAME || 'foodfinder',
    COLLECTION_NAME: process.env.COLLECTION_NAME || 'users',
    
    // Server Configuration
    PORT: process.env.PORT || 3000,
    
    // First AI Configuration
    AI_FIRST_API_KEY: process.env.AI_FIRST_API_KEY,
    AI_FIRST_MODEL: process.env.AI_FIRST_MODEL || 'gpt-3.5-turbo',
    AI_FIRST_MAX_TOKENS: parseInt(process.env.AI_FIRST_MAX_TOKENS) || 1000,
    AI_FIRST_PROMPT: process.env.AI_FIRST_PROMPT,
    
    // Second AI Configuration
    AI_SECOND_API_KEY: process.env.AI_SECOND_API_KEY,
    AI_SECOND_MODEL: process.env.AI_SECOND_MODEL || 'gpt-4',
    AI_SECOND_MAX_TOKENS: parseInt(process.env.AI_SECOND_MAX_TOKENS) || 1500,
    AI_SECOND_PROMPT: process.env.AI_SECOND_PROMPT,
    
    // Processing Configuration
    PROCESSING_DELAY: parseInt(process.env.PROCESSING_DELAY) || 1000,
    
    // CORS Configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
}; 