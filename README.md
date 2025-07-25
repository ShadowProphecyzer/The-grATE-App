# The grATE App

Project Description
--------------------
The grATE App is an AI-powered food analysis and health management application that helps users make informed decisions about their food choices. It provides comprehensive tools for ingredient analysis, nutrition tracking, health evaluation, and community sharing.
It solves the problem of complex food ingredient understanding and promotes healthier eating habits through intelligent analysis and personalized recommendations.

Key Highlights
--------------
- Project Name: The grATE App
- Purpose: AI-powered food analysis and health management
- Target Users: Health-conscious individuals, people with dietary restrictions, and anyone wanting to make better food choices

Prerequisites
-------------
- Node.js: Recommended version 18+
- npm: Node.js package manager
- MongoDB: Local instance or MongoDB Atlas
- OpenAI API: For AI-powered analysis and recommendations
- Environment Variables (.env):
  - MONGO_URI: MongoDB connection string (e.g. mongodb://localhost:27017/grate-app)
  - PORT: (optional) Server port (defaults to 3000)
  - OPENAI_API_KEY: OpenAI API key for AI features
  - SESSION_SECRET: Secret for session management

Installation & Setup
---------------------
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/the-grate-app.git
   cd the-grate-app
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Configure environment variables:
   Create a .env file in the project root:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key
   SESSION_SECRET=your_session_secret
   ```

4. Start the server:
   ```bash
   npm run start-backend
   ```

   For development:
   ```bash
   cd backend && npm start
   ```

Usage
-----
Users interact with The grATE App via their browser:

1. Navigate to the application URL (e.g. http://localhost:3000).
2. Create an account or log in to access personalized features.
3. Use various tools for food analysis and health management.
4. Share experiences and discover products in the community marketplace.

Features
--------
- **Ingredient Checker**: Analyze food ingredients with AI-powered insights
- **Health Evaluation**: Get personalized health assessments and recommendations
- **Nutrition Analysis**: Detailed nutritional information and calorie tracking
- **Healthier Alternatives**: Discover better food options based on your preferences
- **Ingredient Substitution**: Find suitable replacements for ingredients
- **Review Analysis**: AI-powered analysis of food product reviews
- **Diet Recommendations**: Personalized diet suggestions based on your profile
- **Symptom Logger**: Track health symptoms and get AI insights
- **Product Scanner**: Scan barcodes and get instant product information
- **Community Marketplace**: Share experiences and discover products
- **User History**: Track all your tool usage and analysis history
- **Personalized Profiles**: Store dietary preferences, allergies, and health goals

Technical Features
-----------------
- **AI Integration**: OpenAI GPT-4o for intelligent food analysis
- **Real-time Analysis**: Instant results for all food-related queries
- **Mobile-First Design**: Optimized for phone-like interface
- **User Authentication**: Secure login and session management
- **Database Storage**: MongoDB for user data and history tracking
- **Responsive UI**: Modern, intuitive interface with smooth interactions
- **Character Limits**: 500-character limit for community posts
- **Scrollable Content**: Custom scrollbars for better user experience

API Endpoints
-------------
- `/api/auth/signup` - User registration
- `/api/auth/login` - User authentication
- `/api/user/:username/preferences` - User profile management
- `/api/ingredient-checker` - AI ingredient analysis
- `/api/health-evaluation` - Health assessment
- `/api/nutrition-analysis` - Nutritional analysis
- `/api/healthier-alternatives` - Alternative food suggestions
- `/api/ingredient-substitution` - Ingredient replacement
- `/api/reviews-analysis` - Review analysis
- `/api/diet-recommendations` - Diet suggestions
- `/api/symptom-logger` - Symptom tracking
- `/api/scan-code` - Product scanning
- `/api/community/posts` - Community posts management
- `/api/user/:username/tool-history` - User activity tracking

Docker Support
-------------
The application includes Docker support for easy deployment:

```bash
# Build the Docker image
docker build -t grate-app .

# Run the container
docker run -p 3000:3000 grate-app
```

Project Structure
----------------
```
the-grate-app/
├── backend/           # Node.js server and API
│   ├── server.js     # Main server file
│   ├── database.js   # MongoDB connection
│   └── config.js     # Configuration
├── frontend/         # Static HTML/CSS/JS files
│   ├── dashboard.html # Main dashboard
│   ├── scanner.html  # Product scanner
│   ├── community.html # Community page
│   └── ...          # Other tool pages
├── processor/        # Additional processing modules
├── Dockerfile        # Docker configuration
└── package.json      # Project dependencies
```

Contributing
-----------
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

License
-------
ISC License

Support
-------
For support and questions, please open an issue on the GitHub repository. 