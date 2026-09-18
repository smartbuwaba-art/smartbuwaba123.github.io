SMART BUWABA V40 — IMAGE BRIDGE ONLY

Only the AI image connection was repaired. The rest of the app files were kept from V39.

The frontend calls:
https://smart-buwaba-ai-theta.vercel.app/api/image

For real image generation, that Vercel backend must contain api/image.js and have OPENAI_API_KEY configured as a Vercel Environment Variable. The key must NOT be placed in index.html or GitHub Pages.

The backend uses the OpenAI Images API with GPT-Image-2 for generation/editing.
