const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const config = require('./config');
const DatabaseManager = require('./database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = config.PORT;
const COLLECTION_NAME = config.COLLECTION_NAME;
const QUEUE_DIR = path.join(__dirname, '../processor/queue');

// Ensure queue directory exists
if (!fs.existsSync(QUEUE_DIR)) fs.mkdirSync(QUEUE_DIR, { recursive: true });

// Database manager
const dbManager = new DatabaseManager();

// Username validation function
function validateUsername(username) {
    // Username must be 3-20 characters long, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

// Password validation function
function validatePassword(password) {
    // Password must be at least 8 characters, contain at least one capital letter and one number
    const minLength = password.length >= 8;
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return minLength && hasCapital && hasNumber;
}

// Helper function to get a user's collection
async function getUserCollection(username) {
    return await dbManager.getUserCollection(username, 'profile');
}

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await dbManager.connect();
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/mainscreen.html'));
});

// User registration endpoint
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Validate username format
        if (!validateUsername(username)) {
            return res.status(400).json({ 
                message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.' 
            });
        }

        // Validate password requirements
        if (!validatePassword(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters long and contain at least one capital letter and one number.' 
            });
        }

        // Check if username already exists
        const usersCollection = dbManager.getCollection(COLLECTION_NAME);
        const existingUsername = await usersCollection.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({ message: 'Username already exists. Please choose a different username.' });
        }

        // Check if email already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user document
        const user = {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        // Insert user into main users collection
        await usersCollection.insertOne(user);

        // Create per-user database and collections
        try {
            const userDb = await dbManager.getUserDatabase(username);
            // Create collections with an initial document in each
            await userDb.collection('history').insertOne({ initialized: true, createdAt: new Date() });
            await userDb.collection('saved_recipes').insertOne({ initialized: true, createdAt: new Date() });
            await userDb.collection('chatbot').insertOne({ initialized: true, createdAt: new Date() });
            console.log(`Created per-user database and collections for user: ${username}`);
        } catch (error) {
            console.error(`Error creating per-user database/collections for user ${username}:`, error);
            // Don't fail the registration if database creation fails
        }

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// User login endpoint
app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find user by email
        const usersCollection = dbManager.getCollection(COLLECTION_NAME);
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        res.json({ 
            message: 'Sign-in successful.', 
            username: user.username 
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get user profile endpoint
app.get('/api/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const usersCollection = dbManager.getCollection(COLLECTION_NAME);
        const user = await usersCollection.findOne(
            { email }, 
            { projection: { password: 0 } } // Exclude password from response
        );
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Example endpoint to add data to a user's collection
app.post('/api/user/:username/data', async (req, res) => {
    try {
        const { username } = req.params;
        const data = req.body;
        
        // Verify user exists
        const usersCollection = dbManager.getCollection(COLLECTION_NAME);
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Add data to user's collection
        const userCollection = await getUserCollection(username);
        const result = await userCollection.insertOne({
            ...data,
            createdAt: new Date()
        });
        
        res.status(201).json({ 
            message: 'Data added to user collection successfully.',
            dataId: result.insertedId
        });
    } catch (error) {
        console.error('Add user data error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Example endpoint to get data from a user's collection
app.get('/api/user/:username/data', async (req, res) => {
    try {
        const { username } = req.params;
        
        // Verify user exists
        const usersCollection = dbManager.getCollection(COLLECTION_NAME);
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Get data from user's collection
        const userCollection = await getUserCollection(username);
        const data = await userCollection.find({}).toArray();
        
        res.json({ 
            username,
            data: data
        });
    } catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Add photo to user's personal database
app.post('/api/user/:username/upload', multer({ storage: multer.memoryStorage() }).single('photo'), async (req, res) => {
    try {
        const { username } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No photo uploaded.' });
        }
        // Save file to queue folder
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${username}_${timestamp}.jpg`;
        const filePath = path.join(QUEUE_DIR, filename);
        fs.writeFileSync(filePath, file.buffer);
        // Store base64 in user's history collection
        const userHistory = await dbManager.getUserCollection(username, 'history');
        const base64 = file.buffer.toString('base64');
        await userHistory.insertOne({
            image_base64: base64,
            file_path: filePath,
            timestamp: new Date(),
            status: 'queued',
            step: 'upload',
        });
        res.status(201).json({ message: 'Photo uploaded and queued for processing.' });
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});



// Get user's photos
app.get('/api/user/:username/photos', async (req, res) => {
    try {
        const { username } = req.params;
        
        // Verify user exists
        const usersCollection = dbManager.getCollection(COLLECTION_NAME);
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Get photos from user's collection
        const userCollection = await dbManager.getUserCollection(username, 'photos');
        const photos = await userCollection.find({}).sort({ uploadedAt: -1 }).toArray();
        
        res.json({ 
            username,
            photos: photos
        });
    } catch (error) {
        console.error('Get user photos error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});



// Initialize database connection and start server
async function startServer() {
    await connectToDatabase();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer(); 