#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 grATE App Setup');
console.log('==================\n');

console.log('This script will help you configure your MongoDB Atlas connection.');
console.log('Make sure you have:');
console.log('1. A MongoDB Atlas account');
console.log('2. A cluster created');
console.log('3. A database user with read/write permissions');
console.log('4. Your IP address whitelisted\n');

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    try {
        const mongoUri = await question('Enter your MongoDB Atlas connection string: ');
        
        if (!mongoUri.includes('mongodb+srv://')) {
            console.log('❌ Invalid MongoDB Atlas connection string. It should start with "mongodb+srv://"');
            rl.close();
            return;
        }

        // Create .env file
        const envContent = `MONGODB_URI=${mongoUri}
PORT=3000`;

        const envPath = path.join(__dirname, 'backend', '.env');
        fs.writeFileSync(envPath, envContent);

        console.log('\n✅ Configuration saved to backend/.env');
        console.log('\nNext steps:');
        console.log('1. cd backend');
        console.log('2. npm install');
        console.log('3. npm start');
        console.log('\nYour app will be available at http://localhost:3000');

        // Test connection
        console.log('\n🔍 Testing database connection...');
        
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(mongoUri);
        
        try {
            await client.connect();
            console.log('✅ Database connection successful!');
            await client.close();
        } catch (error) {
            console.log('❌ Database connection failed. Please check your connection string and network access.');
            console.log('Error:', error.message);
        }

    } catch (error) {
        console.log('❌ Setup failed:', error.message);
    } finally {
        rl.close();
    }
}

setup(); 