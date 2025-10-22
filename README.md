<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:** Node.js (LTS recommended)

1. Install dependencies:

   `npm install`

2. Create a local environment file and set your Gemini API key. Copy `.env.example` to `.env.local` (or create `.env.local`) and set the value for `GEMINI_API_KEY`:

   - Preferred env var: `GEMINI_API_KEY`
   - The code also supports `API_KEY` as a fallback, but use `GEMINI_API_KEY` to be explicit.

3. Start the dev server:

   `npm run dev`

4. Open the app in your browser at the URL printed by Vite (usually http://localhost:5173).

Note: The app calls the Google GenAI (Gemini) API via the `@google/genai` SDK. Make sure your key has the necessary permissions and quota.
