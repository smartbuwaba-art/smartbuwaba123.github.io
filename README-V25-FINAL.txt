SMART BUWABA V25 — AI SOCIAL CREATOR
====================================

This build is based on V24 and adds:
- Secure Smart Buwaba AI chat with persistent local AI conversation history.
- AI image generation through /api/image.
- AI image editing: upload a photo and describe changes.
- AI video creator: upload multiple images or give a text idea; the app creates a short WebM slideshow.
- Save generated images/videos to the device gallery/downloads.
- Existing Firestore social feed, chat, voice notes, waveform, duration and playback speed are preserved.
- Existing 2-minute video editor is preserved.

DEPLOYMENT
- Vercel must contain api/chat.js and api/image.js.
- Keep OPENAI_API_KEY only in Vercel Environment Variables.
- Optional OPENAI_MODEL defaults to gpt-5.6-luna.
- Optional OPENAI_IMAGE_MODEL defaults to gpt-image-2.
- Browser microphone/video tools require HTTPS and permission.
- AI video creation here is a browser-generated short video from AI-generated/uploaded images; it is not a native text-to-video model.
