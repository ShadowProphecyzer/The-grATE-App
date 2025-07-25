const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const config = require('./config');
const DatabaseManager = require('./database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // Add this line
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { Configuration, OpenAIApi } = require('openai');
const OpenAI = require('openai').OpenAI;
const { ObjectId } = require('mongodb');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Missing token' });
    const jwtSecret = config.JWT_SECRET || 'your_jwt_secret';
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

function authenticateSession(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Not authenticated (session)' });
    }
}

const app = express();
const PORT = config.PORT;
const COLLECTION_NAME = config.COLLECTION_NAME;
const QUEUE_DIR = path.join(__dirname, '../processor/queue');
const GMAIL_USER = config.GMAIL_USER;
const GMAIL_PASS = config.GMAIL_PASS;

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
        
        // Create some sample community posts if none exist
        await createSamplePosts();
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

// Create sample community posts
async function createSamplePosts() {
    try {
        const postsCollection = dbManager.getCommunityCollection();
        const existingPosts = await postsCollection.countDocuments();
        
        if (existingPosts === 0) {
            console.log('Creating sample community posts...');
            
            const samplePosts = [
                {
                    content: "Just discovered this amazing Thai restaurant! The ingredients were so fresh and the FDA code was clearly visible. Love how easy it is to scan and get instant information about what I'm eating! 🍜",
                    author: "FoodExplorer",
                    likes: ["HealthNut", "ThaiFoodie"],
                    comments: [],
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
                },
                {
                    content: "Found some interesting ingredients in my local market today. Used the ingredient checker tool and learned so much about what I was buying. The AI analysis was super helpful! 📱",
                    author: "HealthNut",
                    likes: ["FoodExplorer"],
                    comments: [],
                    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
                },
                {
                    content: "Anyone have recommendations for healthy alternatives to processed snacks? I'm trying to make better food choices and the healthier alternatives tool has been a game changer! 🌱",
                    author: "ThaiFoodie",
                    likes: ["FoodExplorer", "HealthNut"],
                    comments: [],
                    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
                },
                {
                    content: "The nutrition analysis tool is incredible! I scanned a product and got detailed nutritional info instantly. Makes grocery shopping so much easier and healthier! 📊",
                    author: "NutritionGuru",
                    likes: ["FoodExplorer", "HealthNut", "ThaiFoodie"],
                    comments: [],
                    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
                    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
                },
                {
                    content: "Just used the diet recommendations tool and got personalized suggestions based on my profile. The AI really understands my dietary preferences! Highly recommend trying it out! 🎯",
                    author: "WellnessSeeker",
                    likes: ["NutritionGuru", "HealthNut"],
                    comments: [],
                    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
                    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
                }
            ];
            
            await postsCollection.insertMany(samplePosts);
            console.log('Sample posts created successfully!');
        }
    } catch (error) {
        console.error('Error creating sample posts:', error);
    }
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(session({
    secret: config.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Set to true if using HTTPS
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
    }
}));

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

        // Set session
        req.session.user = {
            username: user.username,
            email: user.email
        };

        // Generate JWT
        const jwtSecret = config.JWT_SECRET || 'your_jwt_secret';
        const token = jwt.sign(
            { username: user.username, email: user.email },
            jwtSecret,
            { expiresIn: '2h' }
        );
        // Generate HMAC hash for chat bubble authentication
        const secret = config.CHAT_SECRET;
        const userId = user.username;
        const hash = crypto.createHmac('sha256', secret).update(userId).digest('hex');

        res.json({ 
            message: 'Sign-in successful.', 
            username: user.username,
            chatHash: hash, // Add hash to response
            token // Return JWT
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
app.post('/api/user/:username/data', authenticateSession, async (req, res) => {
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
app.get('/api/user/:username/data', authenticateSession, async (req, res) => {
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
app.post('/api/user/:username/upload', authenticateSession, multer({ storage: multer.memoryStorage() }).single('photo'), async (req, res) => {
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

// Add photo to processor queue from base64 (scanner)
app.post('/api/user/:username/queue-image', async (req, res) => {
    try {
        const { username } = req.params;
        const { imageBase64, filename } = req.body;
        if (!imageBase64 || !filename) {
            return res.status(400).json({ message: 'Missing imageBase64 or filename.' });
        }
        // Extract base64 data (remove data URL prefix if present)
        const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        // Ensure queue directory exists
        const queueDir = path.join(__dirname, '../processor/queue');
        if (!fs.existsSync(queueDir)) fs.mkdirSync(queueDir, { recursive: true });
        // Save as JPG file
        const filePath = path.join(queueDir, filename.replace(/\.png$/, '.jpg'));
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        res.status(201).json({ message: 'Image queued for processing.', filePath });
    } catch (error) {
        console.error('Queue image error:', error);
        res.status(500).json({ message: 'Failed to queue image.' });
    }
});


// Get user's photos
app.get('/api/user/:username/photos', authenticateSession, async (req, res) => {
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

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    const { username, email, problem, description } = req.body;
    if (!username || !email || !problem || !description) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
    }
    // Problem validation (at least 2 chars)
    if (problem.trim().length < 2) {
        return res.status(400).json({ message: 'Problem overview must be at least 2 characters.' });
    }
    // Description validation (at least 10 chars)
    if (description.trim().length < 10) {
        return res.status(400).json({ message: 'Description must be at least 10 characters.' });
    }
    try {
        // Store contact in 'contacts' collection in the main (generic) database
        const contactsCollection = dbManager.getCollection('contacts');
        await contactsCollection.insertOne({
            username,
            email,
            problem,
            description,
            createdAt: new Date()
        });
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_PASS
            }
        });
        // Send mail
        await transporter.sendMail({
            from: `grATE App Contact <${GMAIL_USER}>`,
            to: GMAIL_USER,
            subject: `Contact Form Submission from ${username}`,
            text: `Username: ${username}\nEmail: ${email}\nProblem: ${problem}\nDescription: ${description}`,
            replyTo: email
        });
        res.json({ message: 'Message sent! We will get back to you soon.' });
    } catch (error) {
        console.error('Contact form email error:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
});

// Report form endpoint
app.post('/api/report', multer({ storage: multer.memoryStorage() }).array('photos', 3), async (req, res) => {
    try {
        const { fda, issue, location, username, email } = req.body;
        const files = req.files || [];
        if (!fda || !issue || !location) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        // Prepare images as base64 strings
        const images = files.map(file => ({
            originalname: file.originalname,
            mimetype: file.mimetype,
            buffer: file.buffer,
            base64: file.buffer.toString('base64')
        }));
        // Store report in 'reports' collection
        const reportsCollection = dbManager.getCollection('reports');
        const reportDoc = {
            fda,
            issue,
            location,
            images: images.map(img => ({ originalname: img.originalname, mimetype: img.mimetype, base64: img.base64 })),
            createdAt: new Date(),
            username: username || null,
            email: email || null
        };
        await reportsCollection.insertOne(reportDoc);
        // Also save in user's own reports collection if username is provided
        if (username) {
            const userReportsCollection = await dbManager.getUserCollection(username, 'reports');
            await userReportsCollection.insertOne(reportDoc);
        }
        // Email the report
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_PASS
            }
        });
        // Prepare attachments for email
        const attachments = images.map((img, idx) => ({
            filename: img.originalname || `image${idx+1}.jpg`,
            content: img.buffer,
            encoding: 'base64',
            contentType: img.mimetype
        }));
        await transporter.sendMail({
            from: `grATE App Report <${GMAIL_USER}>`,
            to: GMAIL_USER,
            subject: `Product Report Submission (FDA: ${fda})`,
            text: `FDA Tag: ${fda}\nIssue: ${issue}\nLocation: ${location}\nImages attached: ${images.length}`,
            attachments
        });
        res.json({ message: 'Report submitted successfully.' });
    } catch (error) {
        console.error('Report form email error:', error);
        res.status(500).json({ message: 'Failed to submit report. Please try again later.' });
    }
});

// Save or update user preferences
app.post('/api/user/preferences', async (req, res) => {
    try {
        const { username, email, age, height, weight, allergies, dietary, likes, dislikes, goals } = req.body;
        if (!username || !email) {
            return res.status(400).json({ message: 'Username and email are required.' });
        }
        const userPrefsCollection = dbManager.getCollection('user_preferences');
        // Upsert preferences by email+username
        const result = await userPrefsCollection.updateOne(
            { username, email },
            { $set: { age, height, weight, allergies, dietary, likes, dislikes, goals, updatedAt: new Date() } },
            { upsert: true }
        );
        res.json({ message: 'Preferences saved.' });
    } catch (error) {
        console.error('Save preferences error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get user preferences by email or username
app.get('/api/user/preferences', async (req, res) => {
    try {
        const { email, username } = req.query;
        if (!email && !username) {
            return res.status(400).json({ message: 'Email or username required.' });
        }
        const userPrefsCollection = dbManager.getCollection('user_preferences');
        const prefs = await userPrefsCollection.findOne(email ? { email } : { username });
        if (!prefs) {
            return res.status(404).json({ message: 'Preferences not found.' });
        }
        res.json(prefs);
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get user preferences by username (for ingredient checker)
app.get('/api/user/:username/preferences', async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json({ message: 'Username required.' });
        }
        const userPrefsCollection = dbManager.getCollection('user_preferences');
        const prefs = await userPrefsCollection.findOne({ username });
        if (!prefs) {
            return res.status(404).json({ message: 'Preferences not found.' });
        }
        res.json(prefs);
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// --- User Scan History Endpoint ---
const { MongoClient, ObjectId } = require('mongodb');

app.get('/api/user/:username/history', authenticateSession, async (req, res) => {
    const username = req.params.username;
    if (!username) return res.status(400).json({ error: 'Username required' });
    try {
        const userHistoryCollection = await dbManager.getUserCollection(username, 'history');
        const history = await userHistoryCollection
            .find({})
            .sort({ createdAt: -1, timestamp: -1 })
            .toArray();
        res.json(history);
    } catch (err) {
        console.error('Error fetching user history:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get user's products (example endpoint, not protected by JWT yet)
app.get('/api/user/:username/products', authenticateSession, async (req, res) => {
    try {
        const { username } = req.params;
        const userCollection = await dbManager.getUserCollection(username, 'products');
        const products = await userCollection.find({}).toArray();
        res.json({ username, products });
    } catch (error) {
        console.error('Get user products error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Store tool usage history per user
app.post('/api/user/:username/tool-history', async (req, res) => {
    const username = req.params.username;
    const { tool, input, result } = req.body;
    if (!tool || !input || !result) {
        return res.status(400).json({ error: 'tool, input, and result are required' });
    }
    try {
        console.log('Saving tool history for user:', username, { tool, input, result });
        const toolHistoryCollection = await dbManager.getUserCollection(username, 'tool_history');
        const savedResult = await toolHistoryCollection.insertOne({
            tool,
            input,
            result,
            createdAt: new Date()
        });
        console.log('Tool history saved successfully:', savedResult);
        res.json({ message: 'Tool usage saved.' });
    } catch (err) {
        console.error('Error saving tool history:', err);
        res.status(500).json({ error: 'Failed to save tool history' });
    }
});

// Get tool usage history per user
app.get('/api/user/:username/tool-history', async (req, res) => {
    const username = req.params.username;
    if (!username) return res.status(400).json({ error: 'Username required' });
    try {
        console.log('Fetching tool history for user:', username);
        const toolHistoryCollection = await dbManager.getUserCollection(username, 'tool_history');
        const history = await toolHistoryCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        console.log('Found tool history entries:', history.length);
        res.json(history);
    } catch (err) {
        console.error('Error fetching tool history:', err);
        res.status(500).json({ error: 'Failed to fetch tool history' });
    }
});

app.post('/api/ingredient-checker', async (req, res) => {
    try {
        console.log('Ingredient checker request received:', req.body);
        const { ingredients, profile } = req.body;
        if (!ingredients) {
            console.log('No ingredients provided');
            return res.status(400).json({ error: 'Ingredients are required.' });
        }
        
        // Build personalized prompt using user profile
        let profileText = '';
        let hasProfile = false;
        
        if (profile && typeof profile === 'object') {
            const fields = [];
            if (profile.allergies && profile.allergies.trim()) {
                fields.push(`Allergies: ${profile.allergies}`);
                hasProfile = true;
            }
            if (profile.dietary && profile.dietary.trim()) {
                fields.push(`Dietary Restrictions: ${profile.dietary}`);
                hasProfile = true;
            }
            if (profile.goals && profile.goals.trim()) {
                fields.push(`Health Goals: ${profile.goals}`);
                hasProfile = true;
            }
            if (profile.likes && profile.likes.trim()) {
                fields.push(`Food Likes: ${profile.likes}`);
                hasProfile = true;
            }
            if (profile.dislikes && profile.dislikes.trim()) {
                fields.push(`Food Dislikes: ${profile.dislikes}`);
                hasProfile = true;
            }
            if (profile.age && profile.age > 0) {
                fields.push(`Age: ${profile.age} years`);
                hasProfile = true;
            }
            if (profile.weight && profile.weight > 0) {
                fields.push(`Weight: ${profile.weight} kg`);
                hasProfile = true;
            }
            if (profile.height && profile.height > 0) {
                fields.push(`Height: ${profile.height} cm`);
                hasProfile = true;
            }
            
            if (fields.length > 0) {
                profileText = `User Profile:\n${fields.join('\n')}\n\n`;
            }
        }
        
        const systemPrompt = `You are a nutritionist and food safety expert. Analyze ingredients based on user profile and provide clear, helpful advice.`;
        
        const userPrompt = `${profileText}Analyze these ingredients: ${ingredients}

${hasProfile ? 'Based on the user\'s profile, check:' : 'Provide general analysis:'}
- Allergens and safety concerns
- Nutritional value and health benefits  
- Dietary restrictions and preferences
- Health goal alignment
- Alternative suggestions if needed

Format response with:
✅ Safe ingredients
⚠️ Caution items (with reasons)
❌ Avoid items (with alternatives)
💡 Recommendations

Be concise and specific.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 500,
            temperature: 0.3
        });
        
        const result = completion.choices[0].message.content;
        res.json({ result });
    } catch (error) {
        console.error('OpenAI error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to check ingredients.' });
    }
});

app.post('/api/health-evaluation', async (req, res) => {
    try {
        console.log('Health evaluation request received:', req.body);
        const { foods, profile } = req.body;
        if (!foods) {
            console.log('No foods provided');
            return res.status(400).json({ error: 'Foods are required.' });
        }
        
        // Build personalized prompt using user profile
        let profileText = '';
        let hasProfile = false;
        
        if (profile && typeof profile === 'object') {
            const fields = [];
            if (profile.allergies && profile.allergies.trim()) {
                fields.push(`Allergies: ${profile.allergies}`);
                hasProfile = true;
            }
            if (profile.dietary && profile.dietary.trim()) {
                fields.push(`Dietary Restrictions: ${profile.dietary}`);
                hasProfile = true;
            }
            if (profile.goals && profile.goals.trim()) {
                fields.push(`Health Goals: ${profile.goals}`);
                hasProfile = true;
            }
            if (profile.likes && profile.likes.trim()) {
                fields.push(`Food Likes: ${profile.likes}`);
                hasProfile = true;
            }
            if (profile.dislikes && profile.dislikes.trim()) {
                fields.push(`Food Dislikes: ${profile.dislikes}`);
                hasProfile = true;
            }
            if (profile.age && profile.age > 0) {
                fields.push(`Age: ${profile.age} years`);
                hasProfile = true;
            }
            if (profile.weight && profile.weight > 0) {
                fields.push(`Weight: ${profile.weight} kg`);
                hasProfile = true;
            }
            if (profile.height && profile.height > 0) {
                fields.push(`Height: ${profile.height} cm`);
                hasProfile = true;
            }
            
            if (fields.length > 0) {
                profileText = `User Profile:\n${fields.join('\n')}\n\n`;
            }
        }
        
        const systemPrompt = `You are a nutritionist and health expert. Evaluate foods for their health impact, nutritional value, and compatibility with user profiles. Provide comprehensive health assessments.`;
        
        const userPrompt = `${profileText}Evaluate the health impact of these foods: ${foods}

${hasProfile ? 'Based on the user\'s profile, assess:' : 'Provide general health assessment:'}
- Overall nutritional value and health benefits
- Potential health risks or concerns
- Compatibility with dietary restrictions and preferences
- Impact on health goals and fitness objectives
- Recommended portion sizes and frequency
- Healthier alternatives if applicable

Format response with:
✅ Health Benefits
⚠️ Health Considerations  
❌ Health Risks (if any)
💡 Recommendations
📊 Nutritional Highlights

Be comprehensive, evidence-based, and actionable.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 600,
            temperature: 0.3
        });
        
        const result = completion.choices[0].message.content;
        res.json({ result });
    } catch (error) {
        console.error('OpenAI error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to evaluate health impact.' });
    }
});

app.post('/api/nutrition-analysis', async (req, res) => {
    try {
        console.log('Nutrition analysis request received:', req.body);
        const { foods, profile } = req.body;
        if (!foods) {
            console.log('No foods provided');
            return res.status(400).json({ error: 'Foods are required.' });
        }
        
        // Build personalized prompt using user profile
        let profileText = '';
        let hasProfile = false;
        
        if (profile && typeof profile === 'object') {
            const fields = [];
            if (profile.allergies && profile.allergies.trim()) {
                fields.push(`Allergies: ${profile.allergies}`);
                hasProfile = true;
            }
            if (profile.dietary && profile.dietary.trim()) {
                fields.push(`Dietary Restrictions: ${profile.dietary}`);
                hasProfile = true;
            }
            if (profile.goals && profile.goals.trim()) {
                fields.push(`Health Goals: ${profile.goals}`);
                hasProfile = true;
            }
            if (profile.age && profile.age > 0) {
                fields.push(`Age: ${profile.age} years`);
                hasProfile = true;
            }
            if (profile.weight && profile.weight > 0) {
                fields.push(`Weight: ${profile.weight} kg`);
                hasProfile = true;
            }
            if (profile.height && profile.height > 0) {
                fields.push(`Height: ${profile.height} cm`);
                hasProfile = true;
            }
            
            if (fields.length > 0) {
                profileText = `User Profile:\n${fields.join('\n')}\n\n`;
            }
        }
        
        const systemPrompt = `You are a nutritionist. Provide concise nutritional analysis with calorie estimates, macronutrients, and key vitamins/minerals. Keep responses under 100 words.`;
        
        const userPrompt = `${profileText}Analyze the nutrition of: ${foods}

${hasProfile ? 'Consider the user\'s profile for personalized insights:' : 'Provide general nutritional analysis:'}
- Estimated calories per serving
- Key macronutrients (protein, carbs, fat)
- Important vitamins and minerals
- Health benefits and considerations

Format: Brief, factual, under 100 words.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 150,
            temperature: 0.3
        });
        
        const result = completion.choices[0].message.content;
        res.json({ result });
    } catch (error) {
        console.error('OpenAI error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to analyze nutrition.' });
    }
});

app.post('/api/healthier-alternatives', async (req, res) => {
    try {
        console.log('Healthier alternatives request received:', req.body);
        const { foods, profile } = req.body;
        if (!foods) {
            console.log('No foods provided');
            return res.status(400).json({ error: 'Foods are required.' });
        }
        
        // Build personalized prompt using user profile
        let profileText = '';
        let hasProfile = false;
        
        if (profile && typeof profile === 'object') {
            const fields = [];
            if (profile.allergies && profile.allergies.trim()) {
                fields.push(`Allergies: ${profile.allergies}`);
                hasProfile = true;
            }
            if (profile.dietary && profile.dietary.trim()) {
                fields.push(`Dietary Restrictions: ${profile.dietary}`);
                hasProfile = true;
            }
            if (profile.goals && profile.goals.trim()) {
                fields.push(`Health Goals: ${profile.goals}`);
                hasProfile = true;
            }
            if (profile.likes && profile.likes.trim()) {
                fields.push(`Food Likes: ${profile.likes}`);
                hasProfile = true;
            }
            if (profile.dislikes && profile.dislikes.trim()) {
                fields.push(`Food Dislikes: ${profile.dislikes}`);
                hasProfile = true;
            }
            
            if (fields.length > 0) {
                profileText = `User Profile:\n${fields.join('\n')}\n\n`;
            }
        }
        
        const systemPrompt = `You are a nutritionist. Suggest healthier alternatives to foods, considering nutritional value, taste, and accessibility. Keep responses under 100 words.`;
        
        const userPrompt = `${profileText}Suggest healthier alternatives to: ${foods}

${hasProfile ? 'Consider the user\'s profile for personalized suggestions:' : 'Provide general alternatives:'}
- More nutritious options
- Similar taste/texture alternatives
- Easy to find substitutes
- Health benefits of alternatives

Format: Brief, practical, under 100 words.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 150,
            temperature: 0.3
        });
        
        const result = completion.choices[0].message.content;
        res.json({ result });
    } catch (error) {
        console.error('OpenAI error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to find alternatives.' });
    }
});

app.post('/api/ingredient-substitution', async (req, res) => {
    try {
        console.log('Ingredient substitution request received:', req.body);
        const { ingredients, profile } = req.body;
        if (!ingredients) {
            console.log('No ingredients provided');
            return res.status(400).json({ error: 'Ingredients are required.' });
        }
        
        // Build personalized prompt using user profile
        let profileText = '';
        let hasProfile = false;
        
        if (profile && typeof profile === 'object') {
            const fields = [];
            if (profile.allergies && profile.allergies.trim()) {
                fields.push(`Allergies: ${profile.allergies}`);
                hasProfile = true;
            }
            if (profile.dietary && profile.dietary.trim()) {
                fields.push(`Dietary Restrictions: ${profile.dietary}`);
                hasProfile = true;
            }
            if (profile.likes && profile.likes.trim()) {
                fields.push(`Food Likes: ${profile.likes}`);
                hasProfile = true;
            }
            if (profile.dislikes && profile.dislikes.trim()) {
                fields.push(`Food Dislikes: ${profile.dislikes}`);
                hasProfile = true;
            }
            
            if (fields.length > 0) {
                profileText = `User Profile:\n${fields.join('\n')}\n\n`;
            }
        }
        
        const systemPrompt = `You are a culinary expert. Suggest practical ingredient substitutes that maintain similar taste, texture, and cooking properties. Keep responses under 100 words.`;
        
        const userPrompt = `${profileText}Suggest substitutes for: ${ingredients}

${hasProfile ? 'Consider the user\'s profile for suitable alternatives:' : 'Provide general substitutes:'}
- Similar taste and texture
- Easy to find alternatives
- Cooking compatibility
- Nutritional considerations

Format: Brief, practical, under 100 words.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 150,
            temperature: 0.3
        });
        
        const result = completion.choices[0].message.content;
        res.json({ result });
    } catch (error) {
        console.error('OpenAI error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to find substitutes.' });
    }
});

app.post('/api/reviews-analysis', async (req, res) => {
    try {
        console.log('Reviews analysis request received:', req.body);
        const { review, profile } = req.body;
        if (!review) {
            console.log('No review provided');
            return res.status(400).json({ error: 'Review is required.' });
        }
        
        // Build personalized prompt using user profile
        let profileText = '';
        let hasProfile = false;
        
        if (profile && typeof profile === 'object') {
            const fields = [];
            if (profile.allergies && profile.allergies.trim()) {
                fields.push(`Allergies: ${profile.allergies}`);
                hasProfile = true;
            }
            if (profile.dietary && profile.dietary.trim()) {
                fields.push(`Dietary Restrictions: ${profile.dietary}`);
                hasProfile = true;
            }
            if (profile.goals && profile.goals.trim()) {
                fields.push(`Health Goals: ${profile.goals}`);
                hasProfile = true;
            }
            
            if (fields.length > 0) {
                profileText = `User Profile:\n${fields.join('\n')}\n\n`;
            }
        }
        
        const systemPrompt = `You are a food safety and nutrition expert. Analyze user reviews and safety reports, providing helpful insights and recommendations. Keep responses under 100 words.`;
        
        const userPrompt = `${profileText}Analyze this review/report: ${review}

${hasProfile ? 'Consider the user\'s profile for personalized insights:' : 'Provide general analysis:'}
- Safety concerns or benefits
- Nutritional insights
- Recommendations
- Similar experiences

Format: Brief, helpful, under 100 words.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 150,
            temperature: 0.3
        });
        
        const result = completion.choices[0].message.content;
        res.json({ result });
    } catch (error) {
        console.error('OpenAI error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to analyze review.' });
    }
});

app.post('/api/diet-recommendations', async (req, res) => {
    try {
        console.log('Diet recommendations request received:', req.body);
        const { preferences, profile } = req.body;
        if (!preferences) {
            console.log('No preferences provided');
            return res.status(400).json({ error: 'Dietary preferences are required.' });
        }
        
        // Build personalized prompt using user profile
        let profileText = '';
        let hasProfile = false;
        
        if (profile && typeof profile === 'object') {
            const fields = [];
            if (profile.age && profile.age.trim()) {
                fields.push(`Age: ${profile.age}`);
                hasProfile = true;
            }
            if (profile.weight && profile.weight.trim()) {
                fields.push(`Weight: ${profile.weight}`);
                hasProfile = true;
            }
            if (profile.height && profile.height.trim()) {
                fields.push(`Height: ${profile.height}`);
                hasProfile = true;
            }
            if (profile.allergies && profile.allergies.trim()) {
                fields.push(`Allergies: ${profile.allergies}`);
                hasProfile = true;
            }
            if (profile.dietary && profile.dietary.trim()) {
                fields.push(`Dietary Restrictions: ${profile.dietary}`);
                hasProfile = true;
            }
            if (profile.goals && profile.goals.trim()) {
                fields.push(`Health Goals: ${profile.goals}`);
                hasProfile = true;
            }
            
            if (fields.length > 0) {
                profileText = `User Profile:\n${fields.join('\n')}\n\n`;
            }
        }
        
        const systemPrompt = `You are a nutritionist and diet expert. Provide personalized diet recommendations based on user preferences and profile. Keep responses under 100 words.`;
        
        const userPrompt = `${profileText}Dietary Preferences/Goals: ${preferences}

${hasProfile ? 'Provide personalized recommendations based on the user\'s profile:' : 'Provide general diet recommendations:'}
- Meal suggestions
- Food choices
- Portion guidance
- Timing recommendations

Format: Brief, practical, under 100 words.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 150,
            temperature: 0.3
        });
        
        const result = completion.choices[0].message.content;
        res.json({ result });
    } catch (error) {
        console.error('OpenAI error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get diet recommendations.' });
    }
});

app.post('/api/symptom-logger', async (req, res) => {
    try {
        console.log('Symptom logger request received:', req.body);
        const { symptoms, profile } = req.body;
        if (!symptoms) {
            console.log('No symptoms provided');
            return res.status(400).json({ error: 'Symptoms are required.' });
        }
        
        // Build personalized prompt using user profile
        let profileText = '';
        let hasProfile = false;
        
        if (profile && typeof profile === 'object') {
            const fields = [];
            if (profile.age && profile.age.trim()) {
                fields.push(`Age: ${profile.age}`);
                hasProfile = true;
            }
            if (profile.allergies && profile.allergies.trim()) {
                fields.push(`Allergies: ${profile.allergies}`);
                hasProfile = true;
            }
            if (profile.dietary && profile.dietary.trim()) {
                fields.push(`Dietary Restrictions: ${profile.dietary}`);
                hasProfile = true;
            }
            if (profile.goals && profile.goals.trim()) {
                fields.push(`Health Goals: ${profile.goals}`);
                hasProfile = true;
            }
            
            if (fields.length > 0) {
                profileText = `User Profile:\n${fields.join('\n')}\n\n`;
            }
        }
        
        const systemPrompt = `You are a health expert. Analyze symptoms and food patterns to provide insights and suggestions. Keep responses under 100 words.`;
        
        const userPrompt = `${profileText}Symptoms and Foods: ${symptoms}

${hasProfile ? 'Consider the user\'s profile for personalized insights:' : 'Provide general analysis:'}
- Potential triggers
- Pattern recognition
- Dietary suggestions
- Monitoring advice

Format: Brief, helpful, under 100 words.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 150,
            temperature: 0.3
        });
        
        const result = completion.choices[0].message.content;
        res.json({ result });
    } catch (error) {
        console.error('OpenAI error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to analyze symptoms.' });
    }
});

// Community posts endpoints
app.get('/api/community/posts', async (req, res) => {
    try {
        console.log('Fetching community posts');
        const postsCollection = dbManager.getCommunityCollection();
        const posts = await postsCollection.find({}).sort({ createdAt: -1 }).limit(50).toArray();
        
        console.log(`Found ${posts.length} posts`);
        res.json({ posts });
    } catch (error) {
        console.error('Error fetching community posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts.' });
    }
});

app.post('/api/community/posts', async (req, res) => {
    try {
        console.log('Creating community post:', req.body);
        const { content, author } = req.body;
        
        if (!content || !author) {
            return res.status(400).json({ error: 'Content and author are required.' });
        }
        
        const postsCollection = dbManager.getCommunityCollection();
        const newPost = {
            content: content,
            author: author,
            likes: [],
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await postsCollection.insertOne(newPost);
        console.log('Post created with ID:', result.insertedId);
        
        res.json({ 
            success: true, 
            postId: result.insertedId,
            message: 'Post created successfully' 
        });
    } catch (error) {
        console.error('Error creating community post:', error);
        res.status(500).json({ error: 'Failed to create post.' });
    }
});

app.post('/api/community/posts/:postId/like', async (req, res) => {
    try {
        console.log('Liking post:', req.params.postId, req.body);
        const { username } = req.body;
        const postId = req.params.postId;
        
        if (!username) {
            return res.status(400).json({ error: 'Username is required.' });
        }
        
        const postsCollection = dbManager.getCommunityCollection();
        const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found.' });
        }
        
        // Toggle like
        const isLiked = post.likes && post.likes.includes(username);
        const updateOperation = isLiked 
            ? { $pull: { likes: username } }
            : { $addToSet: { likes: username } };
        
        await postsCollection.updateOne(
            { _id: new ObjectId(postId) },
            updateOperation
        );
        
        console.log(`Post ${postId} ${isLiked ? 'unliked' : 'liked'} by ${username}`);
        res.json({ 
            success: true, 
            liked: !isLiked,
            message: `Post ${isLiked ? 'unliked' : 'liked'} successfully` 
        });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post.' });
    }
});

// API endpoint that simulates unavailable service
app.post('/api/scan-code', async (req, res) => {
    try {
        console.log('Scan code request received:', req.body);
        const { code, imageBase64 } = req.body;
        
        // Simulate API unavailable error
        console.log('Simulating API unavailable error');
        res.status(503).json({ 
            error: 'API Unavailable', 
            message: 'The scanning service is temporarily unavailable. Please try again later.',
            code: 'SERVICE_UNAVAILABLE'
        });
        
    } catch (error) {
        console.error('Scan API error:', error);
        res.status(503).json({ 
            error: 'API Unavailable',
            message: 'Service temporarily down. Please try again later.',
            code: 'SERVICE_UNAVAILABLE'
        });
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