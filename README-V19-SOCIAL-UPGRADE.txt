SMART BUWABA APP V19 — SOCIAL UPGRADE

This build extends V18 with:
- WhatsApp-style voice-note recording in Chat using the browser microphone.
- Voice notes upload through the existing Cloudinary unsigned upload configuration.
- Chat renderer supports text, shared photos, voice notes and video attachments.
- Any signed-in Smart Buwaba user can publish a video post (not admin-only).
- Simple browser video trim editor: choose start/end seconds and create a trimmed WebM copy before upload.
- Community Feed remains open for text/photo/video posts from signed-in users.
- Community comments use the existing top-level Firestore comments collection.
- Existing Smart Buwaba AI, realtime chat, presence, typing indicators, video feed and Cloudinary upload remain included.

IMPORTANT
- Never put an OpenAI API key in this project or GitHub. Keep it in Vercel Environment Variables.
- Video trimming uses browser MediaRecorder/captureStream. If a browser does not support it, users can publish the original video.
- Audio/video uploads require the configured Cloudinary unsigned upload preset.
