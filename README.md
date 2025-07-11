# The grATE App

A web application with cloud-based user management using MongoDB Atlas.

## Features

- User registration and authentication
- Cloud-based user storage (MongoDB Atlas)
- Secure password hashing
- Responsive web interface

## Setup Instructions

### 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Free tier is sufficient)

2. **Configure Database Access**
   - Go to Database Access in your Atlas dashboard
   - Create a new database user with read/write permissions
   - Remember the username and password

3. **Configure Network Access**
   - Go to Network Access in your Atlas dashboard
   - Add your IP address or use `0.0.0.0/0` for all IPs (for development)

4. **Get Connection String**
   - Go to Clusters in your Atlas dashboard
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

### 2. Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   - Create a `.env` file in the `backend` directory
   - Add your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/grate_app?retryWrites=true&w=majority
   PORT=3000
   ```
   - Replace `your_username`, `your_password`, and `your_cluster` with your actual MongoDB Atlas credentials

3. **Start the Server**
   ```bash
   npm start
   ```

### 3. Frontend Setup

The frontend files are static HTML/CSS/JS files that can be served directly by the Express server.

### 4. Deployment Options

#### Option A: Deploy to Heroku
1. Create a Heroku account
2. Install Heroku CLI
3. Create a new Heroku app
4. Set environment variables in Heroku dashboard
5. Deploy using Git

#### Option B: Deploy to Railway
1. Create a Railway account
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard
4. Deploy automatically

#### Option C: Deploy to Render
1. Create a Render account
2. Create a new Web Service
3. Connect your GitHub repository
4. Set environment variables
5. Deploy

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/user/:email` - Get user profile
- `POST /api/user/:username/data` - Add data to user's collection
- `GET /api/user/:username/data` - Get data from user's collection

## User Collections

Each user gets their own MongoDB collection named after their username when they register. This allows for:

- **User-specific data storage**: Each user has their own collection for storing personal data
- **Data isolation**: User data is completely separated by username
- **Scalable architecture**: Easy to add user-specific features and data

### Example Usage

```javascript
// Add data to a user's collection
POST /api/user/johndoe/data
{
  "type": "food_item",
  "name": "Pizza",
  "rating": 5
}

// Get all data from a user's collection
GET /api/user/johndoe/data
```

## Security Features

- Password hashing using bcrypt
- Input validation for usernames and passwords
- Username uniqueness checking
- Password requirements (8+ chars, capital letter, number)
- Error handling
- CORS enabled for cross-origin requests

## Validation Rules

### Username Requirements
- 3-20 characters long
- Only letters, numbers, and underscores allowed
- Must be unique across all users

### Password Requirements
- Minimum 8 characters
- At least one capital letter
- At least one number

## File Structure

```
The grATE App/
├── backend/
│   ├── server.js          # Express server with MongoDB integration
│   ├── config.js          # Configuration settings
│   ├── package.json       # Dependencies
│   └── .env              # Environment variables (create this)
└── frontend/
    ├── account.html       # Login/signup page
    ├── account.js         # Authentication logic
    ├── dashboard.html     # User dashboard
    ├── dashboard.js       # Dashboard functionality
    ├── mainscreen.html    # Main landing page
    ├── mainscreen.js      # Main page logic
    ├── scanner.html       # Scanner page
    ├── scanner.js         # Scanner functionality
    └── *.css             # Styling files
```

## Troubleshooting

1. **Connection Issues**: Ensure your MongoDB Atlas connection string is correct and your IP is whitelisted
2. **Port Issues**: Make sure port 3000 is available or change the PORT environment variable
3. **Dependencies**: Run `npm install` in the backend directory if you encounter module errors

## Next Steps

- Add user sessions/JWT tokens for better security
- Implement password reset functionality
- Add user profile management
- Implement data validation middleware
- Add logging and monitoring 