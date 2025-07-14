// api2_checker.js
// Sends a default request to API 2 and checks if the API key and URL work

const axios = require('axios');

// Replace with your actual API 2 URL and API key
const API2_URL = process.env.API2_URL || 'https://example.com/api2';
const API2_KEY = process.env.API2_KEY || 'your_api2_key_here';

async function checkApi2() {
    try {
        const response = await axios.get(API2_URL, {
            headers: {
                'Authorization': `Bearer ${API2_KEY}`
            }
        });
        console.log('API 2 check successful:', response.status, response.data);
    } catch (error) {
        console.error('API 2 check failed:', error.message);
    }
}

checkApi2(); 