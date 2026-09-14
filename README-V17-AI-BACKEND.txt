SMART BUWABA APP V17 — REAL AI BACKEND

This edition connects the Smart Buwaba AI page to the OpenAI Responses API through a secure serverless backend.

FILES:
- api/chat.js       Secure backend endpoint
- package.json      OpenAI JavaScript SDK dependency
- vercel.json       Vercel serverless configuration
- index.html        AI UI updated to call /api/chat by default

DEPLOYMENT (Vercel):
1. Upload/push this project to a GitHub repository.
2. Import the repository into Vercel.
3. In Vercel Project Settings -> Environment Variables, add:
   OPENAI_API_KEY = your OpenAI API key
   OPENAI_MODEL = gpt-5.6-luna   (optional; this is the default)
4. Redeploy.
5. Open Smart Buwaba -> AI. The AI backend URL should be /api/chat.

IMPORTANT SECURITY:
- NEVER put OPENAI_API_KEY inside index.html, JavaScript, Firebase config, or GitHub files.
- Keep the key only in the backend environment variable.
- If the key is ever exposed, rotate/revoke it immediately.

GITHUB PAGES NOTE:
GitHub Pages can host the front end but does not run this Node/Vercel serverless endpoint. If the front end remains on GitHub Pages, deploy this same /api/chat backend to Vercel and enter the full Vercel endpoint URL in Settings -> AI Assistant.

The app keeps its local AI fallback if the remote backend is unavailable.
