SMART BUWABA V38 — AI IMAGE

The + button and Create/Edit Image panel are now part of index.html.

IMPORTANT: GitHub Pages can serve the frontend, but it cannot execute api/image.js. The included api/image.js is the secure backend and must be deployed on a serverless host such as Vercel, with OPENAI_API_KEY configured there. Do NOT put the API key in index.html.

The frontend uses: https://smart-buwaba-ai-theta.vercel.app/api/image by default, and can be overridden with localStorage key sb_ai_image_backend.
