SMART BUWABA V24 FINAL REPAIR
==============================

This package keeps the existing Smart Buwaba app and adds/fixes:

1. Stable navigation and safer page switching.
2. Smart Buwaba AI through the secure Vercel /api/chat backend.
3. AI image creation through /api/image.
4. New local Image Editor:
   - brightness
   - contrast
   - saturation
   - rotation
   - text overlay
   - PNG export
5. New browser Video Editor:
   - start/end trimming
   - maximum 120 seconds
   - playback speed
   - mute option
   - WebM export
6. Existing Create Video editor is protected by the same 2-minute limit.
7. Real-time Firestore chat listener with text/photo/voice rendering.
8. Voice/photo sending keeps using the existing Cloudinary upload flow.
9. Original Firebase/Firestore data and existing app files are preserved.

IMPORTANT DEPLOYMENT:
- Deploy this package to the Vercel project that contains /api/chat and /api/image.
- Set OPENAI_API_KEY in Vercel Environment Variables.
- Do not put the OpenAI key in index.html.
- For GitHub Pages front-end, set Settings -> AI Assistant to the full Vercel /api/chat URL.
- Browser camera/microphone requires HTTPS and user permission.
- The browser-only video editor exports WebM; it does not replace the original file.
