SMART BUWABA TV — upgraded v2

Included:
- Existing Smart Buwaba TV design retained
- Email/password user accounts and profiles
- Admin-only official video publishing (set ADMIN_EMAIL in index.html and firestore.rules)
- Firebase Storage photo/video uploads
- Community feed for user photos/videos/text posts
- Likes and sharing
- Basic user-to-user Firestore chat
- Smart Buwaba AI local assistant UI (no API key exposed)

SETUP
1. The configured admin email is mmuhammadallie@gmail.com. Use this email when creating/signing into the admin account.
2. In Firebase Console, enable Authentication > Sign-in method > Email/Password.
3. Enable Firestore Database.
4. Enable Storage.
5. Deploy firestore.rules and storage.rules.
6. Upload the project to GitHub Pages or your hosting provider.

IMPORTANT
- Never put an OpenAI/Meta/private AI API key directly in index.html. Smart Buwaba AI currently works locally; connect a secure server/backend later.
- Firebase Storage upload size is limited by the included rule to 200 MB per file. Adjust if needed.
- The Firebase config is already the project config from the supplied website.

SMART BUWABA AI — SECURE ONLINE MODE
- The website keeps a local fallback AI, so the app still opens if the AI backend is unavailable.
- A secure Firebase Cloud Function named smartBuwabaAI is included. It authenticates the signed-in Firebase user, keeps the Gemini key server-side, and supports multi-turn conversations.
- The AI uses Gemini Interactions API with the gemini-3.8-flash model.

ONE-TIME AI SETUP
1. Install Node.js 20+ and Firebase CLI.
2. In this project folder run: firebase login
3. Run: firebase use smartbuwaba-40422
4. Set the Gemini secret: firebase functions:secrets:set GEMINI_API_KEY
   Paste your Gemini API key when prompted. NEVER put it in index.html.
5. Enter the functions folder and install dependencies: cd functions && npm install
6. From the project root deploy the AI functions: firebase deploy --only functions:smartBuwabaAI,functions:resetSmartBuwabaAI
7. Open the website, sign in, then open Smart Buwaba AI. The AI will now answer conversationally and remember the current conversation through the secure backend.

NOTE
- The AI backend requires Firebase Authentication because the API key must remain private and the endpoint needs abuse protection.
- If the functions are not deployed yet, the website automatically uses the built-in local fallback instead of breaking the rest of the app.
