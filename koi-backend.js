// Koi Identifier Backend Server
// This server handles API calls securely and bypasses CORS restrictions
// Run with: node koi-backend.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Endpoint to analyze koi photos
app.post('/api/analyze-koi', async (req, res) => {
  try {
    const { photoBase64, existingFish, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }

    if (!photoBase64) {
      return res.status(400).json({ error: 'Photo data required' });
    }

    // Build fish descriptions for context
    const fishDescriptions = existingFish.map(f => 
      `Fish "${f.name}" (ID: ${f.id}): Breed=${f.breed}, Markings="${f.markings}", Added=${f.dateAdded}`
    ).join('\n');

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a koi fish identification expert. Analyze this koi photo and determine if it matches any of the fish already in the collection.

EXISTING FISH IN COLLECTION:
${fishDescriptions || 'No fish in collection yet'}

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
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
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
      console.error('Claude API error:', errorData);
      
      if (response.status === 401) {
        return res.status(401).json({ error: 'Invalid API key' });
      }
      
      return res.status(response.status).json({ 
        error: errorData.error?.message || 'API call failed' 
      });
    }

    const data = await response.json();
    const analysisText = data.content[0].text;

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Koi Identifier backend is running' });
});

app.listen(PORT, () => {
  console.log(`🐠 Koi Identifier backend running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/analyze-koi`);
});
