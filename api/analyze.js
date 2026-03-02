import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { photoBase64, existingFish } = req.body;

    if (!photoBase64) {
      return res.status(400).json({ error: 'Photo data required' });
    }

    const fishDescriptions = existingFish && existingFish.length > 0
      ? existingFish.map(f => 
          `Fish "${f.name}" (ID: ${f.id}): Breed=${f.breed}, Markings="${f.markings}", Added=${f.dateAdded}`
        ).join('\n')
      : 'No fish in collection yet';

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
      return res.status(response.status).json({ error: errorData.error?.message || 'API call failed' });
    }

    const data = await response.json();
    const analysisText = data.candidates[0].content.parts[0].text;

    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse analysis response' });
    }

    res.json(analysis);

  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
