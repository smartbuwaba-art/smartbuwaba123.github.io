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
1. Open index.html and replace CHANGE_ADMIN_EMAIL@example.com with the email of your admin account.
2. In Firebase Console, enable Authentication > Sign-in method > Email/Password.
3. Enable Firestore Database.
4. Enable Storage.
5. Deploy firestore.rules and storage.rules.
6. Upload the project to GitHub Pages or your hosting provider.

IMPORTANT
- Never put an OpenAI/Meta/private AI API key directly in index.html. Smart Buwaba AI currently works locally; connect a secure server/backend later.
- Firebase Storage upload size is limited by the included rule to 200 MB per file. Adjust if needed.
- The Firebase config is already the project config from the supplied website.
