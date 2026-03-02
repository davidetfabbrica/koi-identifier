# 🐠 Koi Identifier

An AI-powered koi fish identification and cataloging system. Upload photos and automatically detect if you've already cataloged each fish, with breed identification and distinctive feature tracking.

## Features

- 📸 **Photo Upload & Analysis** - AI-powered duplicate detection using Claude's vision
- 🎯 **Breed Identification** - Automatic breed classification (Kohaku, Sanke, Showa, etc.)
- 📍 **Individual Tracking** - Catalog unique fish with distinctive markings and sighting history
- 🔍 **Smart Matching** - Compare new photos against existing collection to identify returning fish
- 💾 **Local Storage** - All data stored locally in browser, nothing sent to servers except for analysis

## Architecture

```
koi-identifier/
├── server.js              # Express backend API
├── public/
│   └── index.html        # Frontend application
├── package.json          # Dependencies
├── .env.example          # Environment template
├── .gitignore            # Git ignore file
└── vercel.json          # Vercel deployment config
```

## Setup

### Prerequisites
- Node.js 18+ installed
- Anthropic API key (get from https://console.anthropic.com/)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd koi-identifier
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Add your API key to `.env`:**
   ```
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```

5. **Run the server:**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3001`

6. **Access the app:**
   Open `public/index.html` in your browser

### Development with Auto-Reload

```bash
npm run dev
```

Uses `nodemon` to automatically restart on file changes.

## Deployment to Vercel

### Option 1: Using Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts and select your project.

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables in Vercel dashboard:
   - `ANTHROPIC_API_KEY` = your API key
6. Deploy!

### Environment Variables on Vercel

In your Vercel project settings, add:
- `ANTHROPIC_API_KEY` - Your Anthropic API key (marked as Secret)

**Important:** Never expose your API key in code or commit `.env` file to Git.

## API Endpoints

### `POST /api/analyze-koi`

Analyzes a koi photo and determines if it's a new fish or matches existing collection.

**Request:**
```json
{
  "photoBase64": "base64-encoded-image",
  "existingFish": [
    {
      "id": 1234567890,
      "name": "Ruby",
      "breed": "Kohaku",
      "markings": "Red spot on left side",
      "dateAdded": "3/2/2026"
    }
  ]
}
```

**Response:**
```json
{
  "isNewFish": true,
  "confidence": 95,
  "description": "Orange and white kohaku with distinctive red patch on head and white belly",
  "matchedFishId": null,
  "reasoning": "Clear distinctive features of new individual"
}
```

### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Koi Identifier backend is running"
}
```

## Usage

### Adding a Fish

1. Click "**+ Add Fish**"
2. Enter fish name (e.g., "Ruby", "Fish #5")
3. Select breed from dropdown
4. Add distinctive markings (e.g., "Red spot on head, white belly")
5. Upload a photo
6. The AI will analyze the photo and suggest if it's new or a duplicate
7. Add any additional notes
8. Click "**✓ Save Fish**"

### Identifying Duplicates

When you upload a photo of a fish you've already cataloged:
- The AI analyzes its distinctive features
- Compares against your existing collection
- Shows a warning if it matches an existing fish
- Includes confidence level in the match

### Logging Sightings

Each time you spot a fish you've already cataloged:
1. Click the fish card
2. Click "**Log Sighting**"
3. A new date entry is added to the sighting history

## Data Privacy

- **Local Storage**: Fish data is stored in your browser's local storage (IndexedDB)
- **No Cloud Sync**: By default, data stays on your device
- **API Calls**: Only photos are sent to Anthropic API for analysis
- **API Key**: Never exposed in frontend code, only used server-side

## Technology Stack

- **Backend**: Express.js, Node.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI**: Anthropic Claude API (vision capabilities)
- **Hosting**: Vercel (backend), Browser (frontend)
- **Storage**: Browser LocalStorage (frontend)

## Security Best Practices

- ✅ API key stored only in server environment variables
- ✅ Never hardcoded in code or frontend
- ✅ `.env` file in `.gitignore`
- ✅ `.env.example` provided as template
- ✅ Use `ANTHROPIC_API_KEY` environment variable on Vercel
- ✅ No authentication required (personal project)

## Troubleshooting

### "Network error analyzing photo"
- Check that your backend server is running (`npm start`)
- Verify API key is set in `.env`
- Check browser console for detailed error messages

### "Invalid API key"
- Verify your API key from https://console.anthropic.com/
- Check it starts with `sk-ant-`
- Make sure there are no extra spaces in `.env`

### Port 3001 already in use
- Change the PORT in `.env` or use: `PORT=3002 npm start`

## Future Enhancements

- [ ] Cloud storage for data backup
- [ ] User accounts and multi-user support
- [ ] Advanced fish metrics (size estimates, age tracking)
- [ ] Map integration to track favorite locations
- [ ] Export reports with fish statistics
- [ ] Mobile app version

## License

MIT

## Contributing

Feel free to open issues and pull requests!

---

**Built with 🐠 and AI**
