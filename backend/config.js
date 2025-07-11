// Configuration file for the grATE App backend
// Copy this file to .env and update with your actual MongoDB Atlas credentials

module.exports = {
    // MongoDB Atlas Connection String
    // Replace this with your actual MongoDB Atlas connection string
    // Get this from your MongoDB Atlas dashboard
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://gaurishveluvali:fyijs7o4WTI7kjD6@cluster0.gsvktco.mongodb.net',
    
    // Server Port
    PORT: process.env.PORT || 3000,
    
    // Database and Collection names
    DB_NAME: 'grate_app',
    COLLECTION_NAME: 'users'
}; 