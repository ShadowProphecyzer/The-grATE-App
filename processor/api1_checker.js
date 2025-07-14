// api1_checker.js
// Sends a default request to API 1 and checks if the API key and URL work

const axios = require('axios');

// Replace with your actual API 1 URL and API key
const API1_URL = process.env.API1_URL || 'https://example.com/api1';
const API1_KEY = process.env.API1_KEY || 'your_api1_key_here';

async function checkApi1() {
    try {
        const response = await axios.get(API1_URL, {
            headers: {
                'Authorization': `Bearer ${API1_KEY}`
            }
        });
        console.log('API 1 check successful:', response.status, response.data);
    } catch (error) {
        console.error('API 1 check failed:', error.message);
    }
}

checkApi1(); 