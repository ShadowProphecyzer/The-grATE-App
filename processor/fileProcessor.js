const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const OpenAI = require('openai');
const config = require('../shared/config');
const DatabaseManager = require('../shared/database');

class FileProcessor {
    constructor() {
        this.tempDir = path.join(__dirname, 'temp');
        this.processingDir = path.join(__dirname, 'processing');
        this.isProcessing = false;
        this.checkInterval = config.PROCESSING_DELAY;
        
        // Database manager
        this.dbManager = new DatabaseManager();
        
        // Initialize AI client and database
        this.initializeAI();
        this.initializeDatabase();
    }

    // Initialize AI clients
    initializeAI() {
        // Initialize First AI client
        const firstApiKey = config.AI_FIRST_API_KEY;
        if (!firstApiKey || firstApiKey === 'your_first_ai_api_key_here') {
            console.warn('Warning: AI_FIRST_API_KEY not set in .env file. First AI processing will be skipped.');
            this.firstAIClient = null;
        } else {
            try {
                this.firstAIClient = new OpenAI({
                    apiKey: firstApiKey
                });
                console.log('First AI client initialized successfully');
            } catch (error) {
                console.error('Error initializing first AI client:', error.message);
                this.firstAIClient = null;
            }
        }

        // Initialize Second AI client
        const secondApiKey = config.AI_SECOND_API_KEY;
        if (!secondApiKey || secondApiKey === 'your_second_ai_api_key_here') {
            console.warn('Warning: AI_SECOND_API_KEY not set in .env file. Second AI processing will be skipped.');
            this.secondAIClient = null;
        } else {
            try {
                this.secondAIClient = new OpenAI({
                    apiKey: secondApiKey
                });
                console.log('Second AI client initialized successfully');
            } catch (error) {
                console.error('Error initializing second AI client:', error.message);
                this.secondAIClient = null;
            }
        }
    }

    // Initialize MongoDB connection
    async initializeDatabase() {
        try {
            await this.dbManager.connect();
            console.log('Database connection initialized successfully');
        } catch (error) {
            console.error('Error initializing database connection:', error.message);
        }
    }

    // Ensure directories exist
    ensureDirectories() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
            console.log('Created temp directory');
        }
        if (!fs.existsSync(this.processingDir)) {
            fs.mkdirSync(this.processingDir, { recursive: true });
            console.log('Created processing directory');
        }
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
            console.log('Created output directory');
        }
    }

    // Get files in temp directory
    getTempFiles() {
        try {
            const files = fs.readdirSync(this.tempDir);
            return files.filter(file => {
                const filePath = path.join(this.tempDir, file);
                return fs.statSync(filePath).isFile();
            });
        } catch (error) {
            console.error('Error reading temp directory:', error.message);
            return [];
        }
    }

    // Check if processing directory is empty
    isProcessingEmpty() {
        try {
            const files = fs.readdirSync(this.processingDir);
            return files.length === 0;
        } catch (error) {
            console.error('Error checking processing directory:', error.message);
            return true;
        }
    }

    // Move a file from temp to processing
    moveFileToProcessing(filename) {
        const sourcePath = path.join(this.tempDir, filename);
        const destPath = path.join(this.processingDir, filename);

        try {
            fs.renameSync(sourcePath, destPath);
            console.log(`Moved ${filename} from temp to processing`);
            return true;
        } catch (error) {
            console.error(`Error moving ${filename}:`, error.message);
            return false;
        }
    }

    // Perform OCR on the file and save as text
    async performOCR(filename) {
        console.log(`Starting OCR processing for ${filename}...`);
        
        const filePath = path.join(this.processingDir, filename);
        
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new Error(`File ${filename} not found in processing directory`);
            }

            // Get file extension to check if it's an image
            const ext = path.extname(filename).toLowerCase();
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.gif', '.webp'];
            
            if (!imageExtensions.includes(ext)) {
                console.log(`File ${filename} is not an image file. Skipping OCR.`);
                return false;
            }

            console.log(`Performing OCR on ${filename}...`);
            
            // Perform OCR using Tesseract.js
            const result = await Tesseract.recognize(filePath, 'eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            });

            // Extract the text from OCR result
            const extractedText = result.data.text;
            
            // Create output filename (replace extension with .txt)
            const baseName = path.parse(filename).name;
            const outputFilename = `${baseName}_ocr.txt`;
            const outputPath = path.join(this.processingDir, outputFilename);
            
            // Save the extracted text to a file
            fs.writeFileSync(outputPath, extractedText);
            console.log(`OCR completed for ${filename}. Text saved to ${outputFilename}`);
            
            return outputFilename;
            
        } catch (error) {
            console.error(`Error performing OCR on ${filename}:`, error.message);
            return false;
        }
    }

    // Extract user from filename (assuming format: username_originalfilename.ext)
    extractUserFromFilename(filename) {
        const parts = filename.split('_');
        if (parts.length >= 2) {
            return parts[0];
        }
        return null;
    }

    // Convert image to base64
    imageToBase64(imagePath) {
        try {
            const imageBuffer = fs.readFileSync(imagePath);
            const base64String = imageBuffer.toString('base64');
            return `data:image/${path.extname(imagePath).slice(1)};base64,${base64String}`;
        } catch (error) {
            console.error('Error converting image to base64:', error.message);
            return null;
        }
    }

    // Store results in user's database
    async storeResultsInUserDB(username, originalImagePath, ocrText, firstAIAnalysis, secondAIAnalysis) {
        try {
            // Convert image to base64
            const imageBase64 = this.imageToBase64(originalImagePath);
            if (!imageBase64) {
                console.error('Failed to convert image to base64');
                return false;
            }

            // Get user's collection
            const userCollection = await this.dbManager.getUserCollection(username, 'image_analysis');

            // Store the complete analysis in user's database
            const analysisDocument = {
                originalImage: imageBase64,
                ocrText: ocrText,
                firstAIAnalysis: firstAIAnalysis,
                secondAIAnalysis: secondAIAnalysis,
                processedAt: new Date(),
                originalFilename: path.basename(originalImagePath)
            };

            await userCollection.insertOne(analysisDocument);

            console.log(`Results stored in database for user: ${username}`);
            return true;

        } catch (error) {
            console.error(`Error storing results in database for user ${username}:`, error.message);
            return false;
        }
    }

    // Send text to first AI for processing
    async sendToAI(textFilename, originalImagePath, ocrText) {
        if (!this.firstAIClient) {
            console.log('First AI client not available, skipping first AI processing');
            return false;
        }

        try {
            if (!ocrText.trim()) {
                console.log(`OCR text is empty, skipping AI processing`);
                return false;
            }

            console.log(`Sending ${textFilename} to first AI for processing...`);
            
            // Get the first prompt from environment variable or use default
            const basePrompt = config.AI_FIRST_PROMPT || 'Please analyze the following text extracted from an image via OCR. Provide a summary, identify key information, and note any potential issues with the text quality:';
            
            // Prepare the prompt for first AI
            const prompt = `${basePrompt}
            
            ${ocrText}`;

            // Send to first AI API
            const completion = await this.firstAIClient.chat.completions.create({
                model: config.AI_FIRST_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI assistant that analyzes OCR-extracted text. Provide clear, concise analysis and identify any issues with text quality or readability.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: config.AI_FIRST_MAX_TOKENS,
                temperature: 0.3
            });

            const firstAIResponse = completion.choices[0].message.content;
            console.log(`First AI analysis completed for ${textFilename}`);
            
            // Send first AI response to second AI
            const secondAIResponse = await this.sendToSecondAI(firstAIResponse, textFilename);
            
            // Extract username from filename
            const username = this.extractUserFromFilename(textFilename);
            
            if (username) {
                // Store results in user's database
                const stored = await this.storeResultsInUserDB(username, originalImagePath, ocrText, firstAIResponse, secondAIResponse);
                if (stored) {
                    console.log(`Both AI analyses completed and stored in database for user: ${username}`);
                } else {
                    console.log(`AI analyses completed but failed to store in database for user: ${username}`);
                }
            } else {
                console.log('Could not extract username from filename, skipping database storage');
            }
            
            return true;
            
        } catch (error) {
            console.error(`Error sending ${textFilename} to first AI:`, error.message);
            return false;
        }
    }

    // Send first AI response to second AI for additional processing
    async sendToSecondAI(firstAIResponse, textFilename) {
        if (!this.secondAIClient) {
            console.log('Second AI client not available, skipping second AI processing');
            return null;
        }

        try {
            console.log(`Sending first AI response to second AI for additional processing...`);
            
            // Get the second prompt from environment variable or use default
            const secondPrompt = config.AI_SECOND_PROMPT || 'Please take the following AI analysis and provide additional insights, recommendations, or alternative interpretations. Focus on actionable insights and practical applications:';
            
            // Prepare the prompt for second AI
            const prompt = `${secondPrompt}
            
            First AI Analysis:
            ${firstAIResponse}`;

            // Send to second AI API
            const completion = await this.secondAIClient.chat.completions.create({
                model: config.AI_SECOND_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI assistant that provides additional insights and recommendations based on previous AI analysis. Focus on practical applications and actionable insights.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: config.AI_SECOND_MAX_TOKENS,
                temperature: 0.4
            });

            const secondAIResponse = completion.choices[0].message.content;
            console.log(`Second AI analysis completed for ${textFilename}`);
            
            return secondAIResponse;
            
        } catch (error) {
            console.error(`Error sending to second AI:`, error.message);
            return null;
        }
    }

    // Process files with OCR and AI
    async processFiles() {
        if (this.isProcessing) {
            return; // Already processing
        }

        this.isProcessing = true;

        try {
            // Check if processing directory is empty
            if (!this.isProcessingEmpty()) {
                console.log('Processing directory is not empty, waiting...');
                this.isProcessing = false;
                return;
            }

            // Get files from temp directory
            const tempFiles = this.getTempFiles();

            if (tempFiles.length === 0) {
                console.log('No files in temp directory');
                this.isProcessing = false;
                return;
            }

            // Move the first file to processing
            const fileToMove = tempFiles[0];
            const success = this.moveFileToProcessing(fileToMove);

            if (success) {
                console.log(`Processing: ${fileToMove}`);
                
                            // Perform OCR on the file
            const ocrResult = await this.performOCR(fileToMove);
            
            if (ocrResult) {
                console.log(`OCR processing completed for ${fileToMove}`);
                
                // Read the OCR text file
                const ocrTextPath = path.join(this.processingDir, ocrResult);
                const ocrText = fs.readFileSync(ocrTextPath, 'utf8');
                const originalImagePath = path.join(this.processingDir, fileToMove);
                
                // Send OCR text to AI for processing (in background)
                this.sendToAI(ocrResult, originalImagePath, ocrText).then(aiSuccess => {
                    if (aiSuccess) {
                        console.log(`AI processing completed for ${ocrResult}`);
                    } else {
                        console.log(`AI processing failed for ${ocrResult}`);
                    }
                    
                    // Clean up OCR text file
                    try {
                        fs.unlinkSync(ocrTextPath);
                        console.log(`Deleted OCR text file from processing: ${ocrResult}`);
                    } catch (error) {
                        console.error(`Error deleting OCR text file:`, error.message);
                    }
                }).catch(error => {
                    console.error(`Error in AI processing for ${ocrResult}:`, error.message);
                });
                
            } else {
                console.log(`OCR processing failed for ${fileToMove}`);
            }
                
                // Remove the original file from processing
                const filePath = path.join(this.processingDir, fileToMove);
                try {
                    fs.unlinkSync(filePath);
                    console.log(`Removed ${fileToMove} from processing`);
                } catch (error) {
                    console.error(`Error removing ${fileToMove}:`, error.message);
                }
            }

        } catch (error) {
            console.error('Error in processFiles:', error.message);
        } finally {
            this.isProcessing = false;
        }
    }

    // Start the file processor
    start() {
        console.log('Starting file processor with OCR and AI capabilities...');
        console.log(`Monitoring: ${this.tempDir}`);
        console.log(`Processing: ${this.processingDir}`);
        console.log(`Output: ${this.outputDir}`);
        
        this.ensureDirectories();

        // Initial check
        this.processFiles();

        // Set up interval to check for new files
        setInterval(() => {
            this.processFiles();
        }, this.checkInterval);
    }

    // Stop the file processor
    stop() {
        console.log('Stopping file processor...');
        process.exit(0);
    }
}

// Create and start the file processor
const processor = new FileProcessor();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    processor.stop();
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    processor.stop();
});

// Start the processor
processor.start(); 