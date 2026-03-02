// Koi Identifier Backend Server
// Environment variables handled via .env file (not committed to Git)
// Uses Google Gemini API for free tier

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Verify API key is set
if (!process.env.GOOGLE_API_KEY) {
  console.error('ERROR: GOOGLE_API_KEY environment variable not set');
  console.error('Please create a .env file with: GOOGLE_API_KEY=your-key-from-aistudio.google.com');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Koi Identifier backend is running' });
});

// Analyze koi photo for duplicate detection
app.post('/api/analyze-koi', async (req, res) => {
  try {
    const { photoBase64, existingFish } = req.body;

    if (!photoBase64) {
      return res.status(400).json({ error: 'Photo data required' });
    }

    // Build fish descriptions for context
    const fishDescriptions = existingFish && existingFish.length > 0
      ? existingFish.map(f => 
          `Fish "${f.name}" (ID: ${f.id}): Breed=${f.breed}, Markings="${f.markings}", Added=${f.dateAdded}`
        ).join('\n')
      : 'No fish in collection yet';

    // Call Google Gemini API using the correct v1 endpoint with gemini-2.0-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a koi fish identification expert. Analyze this koi photo and determine if it matches any of the fish already in the collection.

EXISTING FISH IN COLLECTION:
${fishDescriptions}

ANALYSIS TASK:
1. Describe the distinctive features of this koi (colors, patterns, markings, scars, etc.)
2. Check if this matches any existing fish (look for same pattern, colors, unique markings, scars)
3. Provide your assessment

RESPOND ONLY with JSON in this exact format:
{
  "isNewFish": true/false,
  "confidence": 0-100,
  "description": "detailed description of distinctive features",
  "matchedFishId": null or the suggested existing fish name/ID,
  "reasoning": "explanation of your assessment"
}`
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: photoBase64
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      
      if (response.status === 401 || response.status === 403) {
        return res.status(401).json({ error: 'Invalid API key or insufficient quota' });
      }
      
      return res.status(response.status).json({ 
        error: errorData.error?.message || 'API call failed' 
      });
    }

    const data = await response.json();
    const analysisText = data.candidates[0].content.parts[0].text;

    // Parse JSON response
    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
    } catch (e) {
      console.error('Failed to parse analysis:', analysisText);
      return res.status(500).json({ error: 'Failed to parse analysis response' });
    }

    res.json(analysis);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🐠 Koi Identifier backend running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/analyze-koi`);
});