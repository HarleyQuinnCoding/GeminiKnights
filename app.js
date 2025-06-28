require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
const port = 3000; // Or your chosen port

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// IMPORTANT: Make sure this model name is correct and accessible.
// "gemini-1.5-flash" is generally a good choice.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or "gemini-pro" if you prefer

// Middleware
app.use(cors()); // Enable CORS for all routes (adjust for production)
app.use(express.json()); // To parse JSON request bodies

// Recipe generation endpoint
app.post('/generate-recipe', async (req, res) => {
    const { ingredient, dietaryRestrictions } = req.body; // Destructure to get dietaryRestrictions

    if (!ingredient) {
        return res.status(400).json({ error: 'Ingredient is required.' });
    }

    // Construct the prompt based on ingredient and dietary restrictions
    let prompt = `Generate a detailed and easy-to-follow recipe using the main ingredient: "${ingredient}".`;

    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
        const restrictionsList = dietaryRestrictions.join(', ');
        prompt += ` The recipe must adhere to the following dietary restrictions: ${restrictionsList}.`;
    }

    prompt += `
    Please include:
    1. Recipe Name
    2. Ingredients list with quantities (assume common kitchen staples are available, but list primary ones)
    3. Step-by-step instructions.
    Keep it concise but helpful. Format the output as plain text.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ recipe: text });

    } catch (error) {
        console.error('Error generating recipe:', error);
        // Provide more detail in the error message for debugging
        res.status(500).json({ error: 'Failed to generate recipe. ' + error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
