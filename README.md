# Hospital Operations Optimizer

An AI-powered application to predict and optimize hospital operations using the Gemini API. Get real-time predictions for bed occupancy, ER wait times, and patient load.


## Features

- Real-time predictions for:
  - Bed occupancy rates
  - ER waiting times
  - Emergency room patient load
- Manual data input or file upload
- AI-powered recommendations
- Mock mode for testing without API key
- Responsive dashboard UI
- Dark/light mode support

## Run Locally

**Prerequisites:** Node.js (LTS recommended)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   - Copy `.env.example` to `.env.local`
   - Set your Gemini API key:
     ```
     GEMINI_API_KEY=your_key_here
     ```
   - (Optional) Enable mock mode:
     ```
     MOCK_MODE=true
     ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))
- `MOCK_MODE` - Set to "true" to use mock data instead of real API calls (optional)

## Tech Stack

- React + TypeScript
- Vite
- Google Gemini API
- Recharts for visualizations
- Tailwind CSS

## Development

The app uses the Google GenAI SDK to interact with Gemini's API. Make sure your key has the necessary permissions and quota for production use.

Mock mode is available for development - set `MOCK_MODE=true` in your `.env.local` to test the UI without making real API calls.
