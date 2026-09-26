# Smart Buwaba AI backend

This folder provides the server-side AI endpoints used by the Android/web app.

## Vercel setup
1. Deploy this folder as a Vercel project.
2. Add an environment variable named `OPENAI_API_KEY` in the Vercel project settings.
3. Optional: set `OPENAI_CHAT_MODEL` and `OPENAI_IMAGE_MODEL` if you want different models.
4. The endpoints are `/api/chat` and `/api/image`.
5. Put the deployed `/api/chat` URL into the app's `sb_ai_backend` local setting if it differs from the existing Smart Buwaba AI URL.

The API key is intentionally server-side and is not placed in the Android app.
