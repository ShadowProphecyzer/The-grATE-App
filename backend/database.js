const { MongoClient } = require('mongodb');
const config = require('./config');

class DatabaseManager {
    constructor() {
        this.client = null;
        this.db = null;
    }

    async connect() {
        if (!this.client) {
            this.client = new MongoClient(config.MONGODB_URI);
            await this.client.connect();
            this.db = this.client.db(config.DB_NAME);
            console.log('Connected to MongoDB');
        }
        return this.client;
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('Disconnected from MongoDB');
        }
    }

    // Get user's personal database
    async getUserDatabase(username) {
        if (!this.client) {
            await this.connect();
        }
        return this.client.db(username);
    }

    // Get main application database
    getMainDatabase() {
        return this.db;
    }

    // Get collection from main database
    getCollection(collectionName) {
        return this.db.collection(collectionName);
    }

    // Get collection from user's database
    async getUserCollection(username, collectionName) {
        const userDb = await this.getUserDatabase(username);
        return userDb.collection(collectionName);
    }

    // Get community collection
    getCommunityCollection() {
        return this.db.collection('community_posts');
    }
}

module.exports = DatabaseManager; 