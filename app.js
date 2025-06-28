require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
const port = 3000; // Or any port you prefer

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // You can also use "gemini-1.5-flash" for potentially faster/cheaper inference

// Middleware
app.use(cors()); // Enable CORS for all routes (adjust for production)
app.use(express.json()); // To parse JSON request bodies

// Recipe generation endpoint
app.post('/generate-recipe', async (req, res) => {
    const { ingredient } = req.body;

    if (!ingredient) {
        return res.status(400).json({ error: 'Ingredient is required.' });
    }

    try {
        const prompt = `Generate a detailed and easy-to-follow recipe using the main ingredient: "${ingredient}".
        Please include:
        1. Recipe Name
        2. Ingredients list with quantities (assume common kitchen staples are available, but list primary ones)
        3. Step-by-step instructions.
        Keep it concise but helpful. Format the output as plain text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ recipe: text });

    } catch (error) {
        console.error('Error generating recipe:', error);
        res.status(500).json({ error: 'Failed to generate recipe. Please try again.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});