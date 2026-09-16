SMART BUWABA V26 — AI CONNECTION FIX

This version uses the production Vercel AI backend directly when the app is opened on GitHub Pages, instead of calling /api/chat on the GitHub Pages domain.

AI chat endpoint: https://smart-buwaba-ai-git-main-smartbuwaba-art.vercel.app/api/chat
AI image endpoint: https://smart-buwaba-ai-git-main-smartbuwaba-art.vercel.app/api/image

OpenAI secrets remain server-side in Vercel. Do not put API keys in index.html.
